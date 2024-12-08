const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { readFileSync, writeFileSync } = require("fs");

function extractAddress(pbKeyByte) {
    const hash = keccak256(pbKeyByte.slice(1)).slice(-20);
    const address = '0x' + toHex(hash);
    return address;
}

function getBalances() {
    const data = readFileSync("./balances.json", { encoding: "utf-8" });
    return JSON.parse(data);
}

function updateBalances(balances) {
    return writeFileSync("./balances.json", JSON.stringify(balances),)
}


module.exports = {
    extractAddress,
    getBalances, 
    updateBalances, 
}