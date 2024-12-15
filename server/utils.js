
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { readFileSync, writeFileSync } = require("fs");

function extractAddress(pbKeyByte) {
    const hash = keccak256(pbKeyByte.slice(1)).slice(-20);
    const address = '0x' + toHex(hash);
    return address;
}


function updateAddrData(addrData) {
    return writeFileSync("./addressData.json", JSON.stringify(addrData));
}
function getAddrData() {
    try {
        const data = JSON.parse(readFileSync("./addressData.json", { encoding: "utf-8" }));
        if(!data?.faucet) {
            const error = new Error("");
            error.code = 'ENOENT';
            throw error
        }
        return data;
    } catch (error) {
        if (error.code == 'ENOENT') {
            const data = { faucet: { address: "0x78a9bc2b496989213af8c01ce65f2a80059a164b", nonce: 0, balance: 1000000 } };
            updateAddrData(data);
            return data;
        }
        throw error;
    }
}


function updateTransactions(transactions) {
    return writeFileSync("./transactions.json", JSON.stringify(transactions),)
}

function getTransactions() {
    try {
        const data = JSON.parse(readFileSync("./transactions.json", { encoding: "utf-8" }));
        if(!Array.isArray(data)) {
            const error = new Error("");
            error.code = 'ENOENT';
            throw error
        }
        return data;
    } catch (error) {
        if (error.code == 'ENOENT') {
            const data = [];
            updateTransactions(data);
            return data;
        }
        throw error;
    }
}


function getBlocks() {
    try {
        const data = JSON.parse(readFileSync("./blocks.json", { encoding: "utf-8" }));
        if(!Array.isArray(data)) {
            const error = new Error("");
            error.code = 'ENOENT';
            throw error
        }
        return data;
    } catch (error) {
        if (error.code == 'ENOENT') {
            const data = [];
            updateBlocks(data);
            return data;
        }
        throw error;
    }
}

function updateBlocks(blocks) {
    return writeFileSync("./blocks.json", JSON.stringify(blocks),)
}



module.exports = {
    extractAddress,
    getAddrData,
    updateAddrData,
    getTransactions,
    updateTransactions,
    getBlocks,
    updateBlocks
}