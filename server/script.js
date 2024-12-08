const {isAddress} = require("web3-validator");
const {extractAddress, getBalances, updateBalances} = require("./utils");
const secp = require("ethereum-cryptography/secp256k1");
const utils = require("ethereum-cryptography/utils");
const add = extractAddress( secp.getPublicKey(secp.utils.randomPrivateKey(),true));
console.log(add);
console.log(isAddress(add));
