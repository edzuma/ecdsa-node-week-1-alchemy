
const secp = require("ethereum-cryptography/secp256k1");
const {keccak256} = require("ethereum-cryptography/keccak");
const  {bytesToHex,hexToBytes}= require("ethereum-cryptography/utils")
class Transaction {
    constructor(from,to,amount,nonce) {
        this.from = from;
        this.to = to;
        this.amount = parseFloat(amount);
        this.nonce = parseInt(nonce);
    }

    hash(isByte = false) {
        const data = {
            from: this.from,
            to: this.to,
            amount: this.amount,
            nonce: this.nonce,
          }; 
        const byte = keccak256(new TextEncoder().encode(JSON.stringify(data)))
        return isByte ? byte : bytesToHex(byte);
    }


    async sign(privKeyHex,isRecoverable = false) {
        return await secp.sign(this.hash(true), hexToBytes(privKeyHex),{recovered:isRecoverable});
    }
    
    verify(signatureByte, pubKeyByte) {
        return secp.verify(signatureByte,this.hash(true),pubKeyByte);
    }

   async get(IsSigned = false, privKeyHex = "") {
        const data = {
            from: this.from,
            to: this.to,
            amount: this.amount,
            nonce: this.nonce,
            hash: this.hash(),
            signature: (IsSigned && privKeyHex) ? bytesToHex(await this.sign(privKeyHex)) : undefined,
            timeStamp: Date.now()
          }; 
          return data;
    }
}

module.exports = {
    Transaction
}