const {keccak256} = require("ethereum-cryptography/keccak");
const {bytesToHex}  = require("ethereum-cryptography/utils");
const {} = require("./transactions.json");
const { updateTransactions, updateBlocks, getTransactions, getBlocks } = require("./utils");

class Miner {
    constructor(maxTransactions, targetDifficulty){
        this.mempool = getTransactions();
        this.blocks = getBlocks();
        this.maxTransactions = maxTransactions;
        this.targetDifficulty = targetDifficulty;
    }

    addTx(tx) {
        this.mempool.push(tx);
        return updateTransactions(this.mempool);
    }

    run() {
        const lastBlockIndex = this.blocks.length - 1;
        const block = {id: this.blocks.length, timeStamp: Date.now(), nonce: 0, transctions: [], previousHash: lastBlockIndex >= 0 ? this.blocks[lastBlockIndex].hash : undefined };
        if(this.mempool.length < this.maxTransactions) return;
        for(let i = 0; i < this.maxTransactions; i++) {
            const tx = this.mempool.pop();
            block.transctions.push(tx);
        }
        updateTransactions(this.mempool);
        let hash;
        let nonce = 0;
        do {
            block.nonce = nonce;
            hash = bytesToHex(keccak256((new TextEncoder()).encode( JSON.stringify(block))));
            nonce++;
        }
        while(BigInt(`0x${hash}`) >= this.targetDifficulty) 
        block.hash = hash;
        return this.addBlock(block);
    }

    addBlock(block) {
        this.blocks.push(block);
        return updateBlocks(this.blocks);
    }

    verifyBlocks() {
        let prevHash = "";
        const isInvalid = this.blocks.some((block, index) => {
            if(index == 0) return false;
            prevHash = this.blocks[index - 1].hash;
            if(block.previousHash == prevHash) return false;
            return true;
        });
        return !isInvalid;
    }
}





module.exports = {
    Miner
}