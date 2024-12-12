const express = require("express");
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const { hexToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { isAddress } = require("web3-validator");
const { extractAddress, getAddrData, updateAddrData } = require("./utils");
const { Transaction } = require("./Transaction");
const { Miner } = require("./Miner");


const MAX_TRANSACTIONS = 10;
const TARGET_DIFFICULTY = BigInt(0x0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
const FAUCET_PRIV_KEY = "13fab64184dc34c0c5232f15908d2740023905acc0ddc268c33e8ab0cf4a174a";

const app = express();
const port = 3042;
const addrData = getAddrData();
const miner = new Miner(MAX_TRANSACTIONS,TARGET_DIFFICULTY);
app.use(cors());
app.use(express.json());








app.post("/fund", async (req, res) => {
  const { message, signature, recoveryBit } = req.body;
  const pubKey = secp.recoverPublicKey(message, hexToBytes(signature), parseInt(recoveryBit));
  const address = extractAddress(pubKey);
  if (!isAddress(address)) return res.status(400).send({ message: "invalid address!" });
  const isSigned = secp.verify(hexToBytes(signature), keccak256(hexToBytes(address.slice(2))), pubKey);
  if (isSigned) {
    setInitialBalance(address);
    addrData.faucet.balance -= 100;
    addrData[address].balance = 100;
    const data =
    {
      from: addrData.faucet.address,
      to: address,
      amount: 100,
      nonce: addrData.faucet.nonce,
    };
    const tx = new Transaction(data.from, data.to, data.amount, data.nonce);
    const txData = await tx.get(true, FAUCET_PRIV_KEY);
    miner.addTx(txData);
    res.status(200).end();
    addrData.faucet.nonce += 1;
    updateAddrData(addrData);
    return miner.run();
  }
  return res.status(401).end();
})

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = addrData[address].balance || 0;
  res.send({ balance });
});

app.get("/transactions", (_, res) => {
  return res.send(miner.mempool);
});
app.get("/blocks", (_, res) => {
  return res.send(miner.blocks);
});

app.get("/nonce/:address", (req, res) => {
  const { address } = req.params;
  const nonce = addrData[address].nonce || 0;
  res.send({ nonce });
});

app.post("/send", async (req, res) => {
  const { from, to, amount, nonce, signature, recoveryBit } = req.body;
  if (!isAddress(to)) return res.status(400).send({ message: "invalid recipient address!" });
  const tx = new Transaction(from, to, parseFloat(amount), parseInt(nonce));
  const hash = tx.hash(true);
  const pubKey = secp.recoverPublicKey(hash, hexToBytes(signature), parseInt(recoveryBit));
  const fromAdd = extractAddress(pubKey);
  console.log(fromAdd);
  console.log(`${fromAdd}`.toLowerCase().trim());
  console.log(`${from}`.toLowerCase().trim());
  if (fromAdd.toLowerCase().trim() != from.toLowerCase().trim()) return res.status(409).send({ message: "invalid sender" });
  if (addrData[fromAdd].nonce != nonce) return res.status(409).send({ message: "invalid transaction" });
  const isSigned = tx.verify(hexToBytes(signature), pubKey);
  if (!isSigned) return res.status(401).end();
  setInitialBalance(to);
  if (!addrData[fromAdd]?.balance || addrData[fromAdd].balance < amount) {
    return res.status(400).send({ message: "Not enough funds!" });
  }
  addrData[fromAdd].balance -= amount;
  addrData[to].balance += amount;
  addrData[fromAdd].nonce += 1;
  const txData = await tx.get();
  txData.signature = signature;
  miner.addTx(txData);
  res.send({ balance: addrData[fromAdd].balance });
  updateAddrData(addrData);
  return miner.run();
});

function setInitialBalance(address) {
  if (addrData[address]?.balance == undefined) {
    addrData[address]= {
      balance: 0,
      nonce: 0,
    }
  }
}

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});


