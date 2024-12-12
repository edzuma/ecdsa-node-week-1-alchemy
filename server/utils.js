const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { readFileSync, writeFileSync } = require("fs");

function extractAddress(pbKeyByte) {
    const hash = keccak256(pbKeyByte.slice(1)).slice(-20);
    const address = '0x' + toHex(hash);
    return address;
}

function getAddrData() {
    const data = readFileSync("./addressData.json", { encoding: "utf-8" });
    return JSON.parse(data);
}

function updateAddrData(addrData) {
    return writeFileSync("./addressData.json", JSON.stringify(addrData),)
}


function getTransactions() {
    const data = readFileSync("./transactions.json", { encoding: "utf-8" });
    return JSON.parse(data);
}

function updateTransactions(transactions) {
    return writeFileSync("./transactions.json", JSON.stringify(transactions),)
}

function getBlocks() {
    const data = readFileSync("./blocks.json", { encoding: "utf-8" });
    return JSON.parse(data);
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