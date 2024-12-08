const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const secp = require("ethereum-cryptography/secp256k1");
const {hexToBytes} = require("ethereum-cryptography/utils");
const{ keccak256 } = require("ethereum-cryptography/keccak");
const {extractAddress, getBalances, updateBalances} = require("./utils");
const {isAddress} = require("web3-validator");

const balances = getBalances();

app.post("/fund", (req,res)=>{
  const {message,signature,recoveryBit } = req.body;
  const pubKey = secp.recoverPublicKey(message,hexToBytes(signature),parseInt(recoveryBit));
  const address = extractAddress(pubKey);
  const isSigned = secp.verify(hexToBytes(signature),keccak256(hexToBytes(address.slice(2))),pubKey);
  console.log(isAddress(address));
  if(!isAddress(address)) return res.status(400).send({message: "invalid address!"});
  if(isSigned) {
    console.log(isSigned);
    balances.faucet -= 100;
    balances[address] = 100;
    updateBalances(balances);
    return res.status(200).end();;
  }
  return res.status(401).end();
})

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { from, to, amount, signature, recoveryBit } = req.body;
  const tx = {
    from,
    to,
    amount,
    nonce: 0
  }
  const hashedTX = keccak256(new TextEncoder().encode(JSON.stringify(tx)));
  const pubKey = secp.recoverPublicKey(hashedTX,hexToBytes(signature),parseInt(recoveryBit));
  const fromAdd = extractAddress(pubKey);
  if(fromAdd.toLowerCase().trim() != from.toLowerCase().trim()) return res.status(409).send( {message: "invalid sender"});
  const isSigned = secp.verify(hexToBytes(signature),hashedTX,pubKey);
  if(!isSigned) return res.status(401).end();

  if(!isAddress(to)) return res.status(400).send({message: "invalid recipient address!"});

  setInitialBalance(to);

  if (balances[fromAdd] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[fromAdd] -= amount;
    balances[to] += amount;
    res.send({ balance: balances[fromAdd] });
    return updateBalances(balances);
  }
});

function setInitialBalance(address) {
  if (!balances[address]) {
      balances[address] = 0;
  }
}

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});


