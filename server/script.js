const {isAddress} = require("web3-validator");
const {extractAddress} = require("./utils");
const secp = require("ethereum-cryptography/secp256k1");
const utils = require("ethereum-cryptography/utils");
const {keccak256} = require("ethereum-cryptography/keccak")
const privKey = secp.utils.randomPrivateKey();

const add = extractAddress(secp.getPublicKey(privKey, false));

