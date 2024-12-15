const { updateTransactions, updateBlocks, getTransactions, getBlocks } = require("./utils");
const { Block } = require("./Block");

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
        const prevHash = this.blocks.length > 0 ? this.blocks[this.blocks.length-1].hash : undefined
        const block = new Block(this.blocks.length + 1,prevHash);
        if(this.mempool.length < this.maxTransactions) return;
        for(let i = 0; i < this.maxTransactions; i++) {
            const tx = this.mempool.pop();
            block.addTX(tx);
        }
        updateTransactions(this.mempool);
        block.mine();
        return this.addBlock(block);
    }

    addBlock(block) {
        this.blocks = getBlocks();
        this.blocks.push(block);
        if(this.verifyBlocks())
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