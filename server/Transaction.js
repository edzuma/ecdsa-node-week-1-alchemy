
const secp = require("ethereum-cryptography/secp256k1");
const {keccak256} = require("ethereum-cryptography/keccak");
const  {bytesToHex,hexToBytes}= require("ethereum-cryptography/utils")
class Transaction {
    constructor(from,to,amount,nonce,timeStamp) {
        this.from = from;
        this.to = to;
        this.amount = parseFloat(amount);
        this.nonce = parseInt(nonce);
        this.timeStamp =timeStamp;
        this.signature = undefined;
    }

    hash(isByte = false) {
        const data = {
            from: this.from,
            to: this.to,
            amount: this.amount,
            nonce: this.nonce,
            timeStamp: this.timeStamp
          }; 
        const byte = keccak256(new TextEncoder().encode(JSON.stringify(data)))
        return isByte ? byte : bytesToHex(byte);
    }


    async sign(privKeyHex,isRecoverable = false) {
        if(isRecoverable) {
            const [signature,recoveryBit] = await secp.sign(this.hash(true), hexToBytes(privKeyHex),{recovered:isRecoverable});
            this.signature = bytesToHex(signature);
            return [signature,recoveryBit];
        }
        const signature = await secp.sign(this.hash(true), hexToBytes(privKeyHex),{recovered:isRecoverable});
        this.signature = bytesToHex(signature);
        return signature;
    }
    
    verify(signatureByte, pubKeyByte) {
        return secp.verify(signatureByte,this.hash(true),pubKeyByte);
    }

   async get(IsSigned = false, privKeyHex = "") {
        this.signature = (IsSigned && privKeyHex) ? bytesToHex(await this.sign(privKeyHex)) : undefined;
        const data = {
            from: this.from,
            to: this.to,
            amount: this.amount,
            nonce: this.nonce,
            timeStamp: this.timeStamp,
            hash: this.hash(),
            signature: this.signature,
          }; 
          return data;
    }
}

module.exports = {
    Transaction
}