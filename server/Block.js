const {keccak256} = require("ethereum-cryptography/keccak");
const  {bytesToHex}= require("ethereum-cryptography/utils");

const MAX_TRANSACTIONS = 10;
const TARGET_DIFFICULTY = BigInt(0x0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
class Block {
    constructor(id, prevHash = undefined) {
        this.id = id;
        this.transactions = [];
        this.nonce = 0;
        this.timeStamp = 0;
        this.targetDifficulty = `${TARGET_DIFFICULTY}`;
        this.sent = 0;
        this.previousHash = prevHash
        this.hash = undefined;
    }

    addTX (tx) {
        this.transactions.push(tx)
    }

    setSent() {
        this.sent = this.transactions.reduce((acc,cur)=> acc + cur.amount
        ,0);
    }

    setTimeStamp() {
        this.timeStamp = Date.now();
    }

    mine() {
        this.setSent();
        do {
            this.setTimeStamp();
            this.hash = undefined;
            const block = JSON.stringify(this);
            this.hash = bytesToHex(keccak256((new TextEncoder()).encode(block)));
            this.nonce++;
        }
        while(BigInt(`0x${this.hash}`) >= BigInt(this.targetDifficulty))
    }
}

module.exports = {
    MAX_TRANSACTIONS, 
    TARGET_DIFFICULTY,
    Block
}