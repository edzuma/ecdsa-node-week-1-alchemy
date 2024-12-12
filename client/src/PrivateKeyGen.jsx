import { useState } from "react";
import { createPrivateKey, extractAddress, encryptWithPassword, saveMetaData } from "./utils";
import { sign, utils } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import server from "./server";


function PrivateKeyGen() {

    const [privateKey, setPrivateKey] = useState('');
    const [address, setAddress] = useState('');
    const [isOpened, setIsOpened] = useState(false);
    const [isDBSaved, setIsDBSaved] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [encryptionPassword, setEncryptionPassword] = useState('');

    const setValue = (setter) => (evt) => setter(evt.target.value);

    async function fund(privateKey, address) {

        const message = keccak256(utils.hexToBytes(address.slice(2)));
        const [signature, recoveryBit] = await sign(utils.bytesToHex(message), privateKey, { recovered: true });
        const body = {
           message: utils.bytesToHex(message),
            signature : utils.bytesToHex(signature),
            recoveryBit: recoveryBit.toString()
        }
        try {
             await server.post(`/fund`, body);
          } catch (ex) {
           throw  new Error("funding failed, "+ ex?.response?.data?.message || ex?.message || ex);
          }
    }

    async function onPkeyGenSubmit(e) {
        e.preventDefault();
        try {
            const pKey = createPrivateKey()
            const addr = extractAddress(pKey)
            await fund(pKey,addr);
            setPrivateKey(pKey);
            setAddress(addr);
            setIsOpened(true);
            setIsDBSaved(false);
            setEncryptionPassword("");
        } catch (error) {
            return setErrorMsg("Private Key Gen Failed:" + ex?.message || ex);
        }
    }

    function onSaveDBCheckClicked() {
        setIsDBSaved(!isDBSaved);
    }

    async function onCloseSubmit(e) {
        e.preventDefault();
        try {
            if (isDBSaved) {
                if (encryptionPassword.length < 8) {
                    setErrorMsg('Password must be atleast 8 characters');
                    return;
                }
                const metaData = await encryptWithPassword(encryptionPassword, privateKey);
                if (await saveMetaData(metaData)) return setIsOpened(false);
            }else {
                setIsOpened(false);
            }
        } catch (error) {
            return setErrorMsg('Unable to save private key, ' + error);
        }
    }

    return (
        <>
            <div className="container pKeyGen">
                <form onSubmit={onPkeyGenSubmit} className="mb16 pKeyGenForm">
                    <button type="submit" className="button genBtn" disabled={isOpened}>
                        Click Here To Generate Private Key
                    </button>
                </form>
                {isOpened && <div className="pKeyGenDisplay">
                    <div className="mb16">In order to sign a transaction, authorize the use of indexDB to save your private key client-side
                        or copy your private key and insert in input provided to sign your transactions. 
                        <div>Every new Key will be funded with a balance of 100.00</div>
                        </div>
                        
                    <div className="mb16">Your Private Key: {privateKey}</div>
                    <div>Your Address: {address}</div>
                    <form onSubmit={onCloseSubmit} className="DBSaveCheckForm">
                        {errorMsg && <div className="errorMsg">{errorMsg}</div>}
                        <label className="saveDBLabel">
                            <span>Check the box to save in indexdDB</span>
                            <input type="checkbox" value={isDBSaved} onClick={onSaveDBCheckClicked} />
                        </label>
                        {isDBSaved && <label className="encPassLabel">
                                Enter a Password for private key encryption
                            <input type="text" value={encryptionPassword} onChange={setValue(setEncryptionPassword)} />
                        </label>}
                        <input type="submit" className="button" value="Close" />
                    </form>
                </div>}
            </div>
        </>
    );
}

export default PrivateKeyGen;
