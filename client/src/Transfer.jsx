import { useState } from "react";
import server from "./server";
import { sign } from "ethereum-cryptography/secp256k1";
import {bytesToHex,hexToBytes} from "ethereum-cryptography/utils"
import { keccak256 } from "ethereum-cryptography/keccak";
import { getAllMetaData, decryptWithPassword, extractAddress } from "./utils";


function Transfer({ setBalance }) {
  const [sender, setSender] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPkeyForm, setShowPkeyForm] = useState(false);
  const [encryptedPKeys, setEncryptedPKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [metaDataList, setMetaDataList] = useState([]);
  const setValue = (setter) => (evt) => setter(evt.target.value);



  async function transfer(evt) {
    evt.preventDefault();
    if (!sendAmount || !recipient) {
      return setErrorMsg("fill out the inputs to transfer funds");
    }
    try {
      const list = await getAllMetaData();
      setMetaDataList(list);
      setEncryptedPKeys(list.map(item => item.encryptedData));
    } catch (error) {
      return setErrorMsg("error getting encrypted private keys");
      
    }
    setShowPkeyForm(true);
  }

  async function signTX(e) {
    e.preventDefault();
    let privateKey;
    try {
      if(isPasswordRequired){
      const metaData = metaDataList.find((item) => item.encryptedData == selectedKey);
      privateKey =  hexToBytes( await decryptWithPassword(encryptionPassword,metaData.iv, metaData.salt, metaData.encryptedData));
      }else {
        privateKey = hexToBytes(selectedKey);
      }
      setSender(extractAddress(privateKey));
    } catch (error) {
     return setErrorMsg("unable to decrypt with given password");

    }
    const tx = {
      to: recipient,
      amount: parseFloat(sendAmount),
      nonce: 0
    }
    const txStr = JSON.stringify(tx);
    const hashTx = keccak256(new TextEncoder().encode(txStr));
    const [signature, recoveryBit] = await sign(bytesToHex(hashTx),privateKey,{recovered:true});

    const body = {
      ...tx
    }
    delete body.nonce;

    body.signature = bytesToHex(signature);
    body.recoveryBit = recoveryBit.toString();

    try {
      const {
        data: { balance },
      } = await server.post(`/send`, body);
      setBalance(balance);
    } catch (ex) {
     return setErrorMsg("transfer failed, "+ ex?.message || ex);

    }
  }


  async function onSelectedKeyChange(key) {
      const isInPKeyList = metaDataList.some((item) => item.encryptedData == key);
      console.log(isInPKeyList);
      if(isInPKeyList) setIsPasswordRequired(true);
  }

  return (
    <div className="container transfer">
      <form onSubmit={transfer}>
        <h1>Send Transaction</h1>
        {errorMsg && <div className="errorMsg">{errorMsg}</div>}
        <label>
          Send Amount
          <input
            placeholder="1, 2, 3..."
            value={sendAmount}
            onChange={setValue(setSendAmount)}
          ></input>
        </label>

        <label>
          Recipient
          <input
            placeholder="Type an address, for example: 0x2"
            value={recipient}
            onChange={setValue(setRecipient)}
          ></input>
        </label>
        <input type="submit" className="button" value="Transfer" />
      </form>
      {showPkeyForm && <form onSubmit={signTX}>
        <label>
          Insert a private key to sign the transaction.
          <input
            placeholder="Type or select your private key"
            value={selectedKey}
            onChange={setValue(onSelectedKeyChange)}
          ></input>
          <button type="button" onClick={() => setListOpen(!listOpen)}>▼</button>
        </label>
        {listOpen && (
          <ul>
            {encryptedPKeys.map((pkey, index) => (
              <li key={index} onClick={() => setSelectedKey(pkey)}>
                {pkey}
              </li>
            ))}
          </ul>
        )}
        {isPasswordRequired && <label>
          Password
          <input
            placeholder="Type password for decryption of the key"
            value={encryptionPassword}
            onChange={setValue(setEncryptionPassword)}
          ></input>
        </label>}
        <input type="submit" className="button" value="Sign" />
      </form>
      }
    </div>
  );
}

export default Transfer;
