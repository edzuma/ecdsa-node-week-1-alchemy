import { useState } from "react";
import server from "./server";
import { sign } from "ethereum-cryptography/secp256k1";
import { bytesToHex, hexToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import {isAddress} from "web3-validator";
import { getAllMetaData, decryptWithPassword, extractAddress } from "./utils";


function Transfer({ setBalance,from }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [okMsg,setOkMsg]= useState("");
  const [showPkeyForm, setShowPkeyForm] = useState(false);
  const [encryptedPKeys, setEncryptedPKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [metaDataList, setMetaDataList] = useState([]);
  const setValue = (setter) => (evt) => setter(evt.target.value);

  function setAmountToSend(amount) {
    setErrorMsg("");
    setOkMsg("");
    setSendAmount(amount);
    try {
     amount = parseFloat(amount);
    } catch (error) {
      return setErrorMsg("Invalid amount");
    }
  }
  function setRecipientAddress(address) {
    setErrorMsg("");
    setOkMsg("");
    setRecipient(address);
    if(!isAddress(address)) return setErrorMsg("Invalid receiver address");
    setRecipient(address);
  }

  async function transfer(evt) {
    evt.preventDefault();
    setErrorMsg("");
    setOkMsg("");
    try {
      if (!parseFloat(sendAmount) || !recipient) {
        throw new Error('Invalid transfer inputs!');
      }
      if(!isAddress(from)) throw new Error("Invalid sender wallet address!");
    } catch (error) {
      return setErrorMsg("error: " + error?.message || JSON.stringify(error));
    }
    
    try {
      const list = await getAllMetaData();
      setMetaDataList(list);
      setEncryptedPKeys(list.map(item => item.encryptedData));
    } catch (error) {
      return setErrorMsg("Error getting encrypted private keys");

    }
    setShowPkeyForm(true);
  }

  async function signTX(e) {
    e.preventDefault();
    setErrorMsg("");
    setOkMsg("");
    let privateKey;
    let sender;
    try {
      if (isPasswordRequired) {
        const metaData = metaDataList.find((item) => item.encryptedData == selectedKey);
        privateKey = await decryptWithPassword(encryptionPassword, metaData.iv, metaData.salt, metaData.encryptedData);
      } else {
        privateKey = selectedKey;
      }
      sender = extractAddress(privateKey);
      if(sender.toLowerCase().trim() != from.toLowerCase().trim()) return setErrorMsg("Invalid Sender!");
    } catch (error) {
      return setErrorMsg("Unable to decrypt with given password" + error);
    }
    let nonce = 0;
    try {
      const {
        data
      } = await server.get(`nonce/${sender}`);
      nonce = data.nonce;
    } catch (error) {
      return setErrorMsg("unable to query address" + error);
    }
    const tx = {
      from: sender,
      to: recipient,
      amount: parseFloat(sendAmount),
      nonce
    };
    console.log(tx);
    const txStr = JSON.stringify(tx);
    const hashTx = keccak256(new TextEncoder().encode(txStr));
    const [signature, recoveryBit] = await sign(bytesToHex(hashTx), hexToBytes(privateKey), { recovered: true });

    const body = {
      ...tx
    };


    body.signature = bytesToHex(signature);
    body.recoveryBit = recoveryBit.toString();

    try {
      const {
        data: { balance },
      } = await server.post(`/send`, body);
      setBalance(balance);
    } catch (ex) {
      console.log(ex);
      return setErrorMsg("Transfer failed!, " + ex?.response?.data?.message || ex?.message ||  ex);
    }
    setOkMsg("Transfer successful!");
  }

  async function handleEncKeyChange(key) {
    setErrorMsg("");
    setOkMsg("");
    const isInPKeyList = metaDataList.some((item) => item.encryptedData == key);
    setSelectedKey(key);
    setListOpen(false);
    if (isInPKeyList) { setIsPasswordRequired(true) } else { setIsPasswordRequired(false); }
  }


  return (
    <div className="container transfer">
      <form onSubmit={transfer}>
        <h1>Send Transaction</h1>
        {errorMsg && <div className="errorMsg">{errorMsg}</div>}
        {okMsg && <div className="okMsg">{okMsg}</div>}
        <label>
          Send Amount
          <input
            placeholder="1, 2, 3..."
            value={sendAmount}
            onChange={setValue(setAmountToSend)}
          ></input>
        </label>

        <label>
          Recipient
          <input
            placeholder="Type a valid ether address"
            value={recipient}
            onChange={setValue(setRecipientAddress)}
          ></input>
        </label>
        <input type="submit" className="button" value="Transfer" />
      </form>
      {showPkeyForm && <form onSubmit={signTX}>
        <label className="pkLabel">
          <span>Insert a private key to sign the transaction.</span>
          <span className="pkInputWrap">
            <input
              placeholder="Type or select your private key"
              value={selectedKey}
              onChange={setValue(handleEncKeyChange)}
              onClick={()=>setListOpen(!listOpen)}
            ></input>
            <button type="button" className="dropDownBtn" onClick={() => setListOpen(!listOpen)}>▼</button>
          </span>
        </label>
        {listOpen && (
          <ul className="pkList">
            {encryptedPKeys.map((pkey, index) => (
              <li key={index} onClick={() => handleEncKeyChange(pkey)}>
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
