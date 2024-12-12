
const MAX_TRANSACTIONS = 10;
const TARGET_DIFFICULTY = BigInt(0x0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
class Block {
    constructor(id, blocks) {
        this.id = id;
        this.blocks = blocks;
        this.transactions = [];
        this.nonce = 0;
        this.timeStamp = 0;
        this.totalDifficulty = `${TARGET_DIFFICULTY}`;
        this.size = 0;
        this.sent = 0;
        const lastBlockIndex = blocks.length - 1;
        this.previousHash = lastBlockIndex >= 0 ? blocks[lastBlockIndex].hash : undefined
        this.hash = undefined;
    }

    addTX (tx) {
        this.transactions.push(tx)
    }

    mine() {
        do {
            this.hash = bytesToHex(keccak256((new TextEncoder()).encode( JSON.stringify(block))));
            this.nonce++;
        }
        while(BigInt(`0x${this.hash}`) >= this.targetDifficulty)
    }


}
