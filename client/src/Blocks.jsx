import server from "./server";
import { useEffect, useState } from "react";
import Transactions from "./ConfirmTransactions";

function Blocks() {
  const [blocks, setBlocks] = useState([]);
  const [bModalIsOpened, setBModalIsOpened] = useState(false);
  const [blockID, setBlockID] = useState("");
  const [hash, setHash] = useState("");
  const [previousHash, setPreviousHash] = useState("");
  const [nonce, setNonce] = useState("");
  const [totalSent, setTotalSent] = useState("");
  const [averageValue, setAverageValue] = useState("");
  const [time, setTime] = useState("");
  const [targetDifficulty, setTargetDifficulty] = useState("");
  const [size, setSize] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [totalTxs, setTotalTxs] = useState("");
  function getSize(block) {
    return new TextEncoder().encode(JSON.stringify(block)).byteLength / 1024
  }
  function handleBlockClick(block) {
    setBlockID(block.id);
    setHash(`0x${block.hash}`);
    setPreviousHash(block.previousHash ? `0x${block.previousHash}` : "N/A");
    setNonce(block.nonce);
    setTotalSent(block.sent);
    setAverageValue(block.sent / block.transactions.length);
    setTime(new Date(block.timeStamp).toISOString());
    setTargetDifficulty(block.targetDifficulty);
    setSize(`${getSize(block)} Kb`);
    setTotalTxs(block.transactions.length);
    setTransactions(block.transactions);
    setBModalIsOpened(true);
  }


  useEffect(() => {
    async function getBlocks() {
      const { data } = await server.get("/blocks");
      setBlocks(data);
    }
    getBlocks();
    const intervalID = setInterval(async () => {
      const { data } = await server.get("/blocks");
      setBlocks(data);
    }, 15000);
    return () => clearInterval(intervalID);
  }, []);

  return (
    <div className="container blocks">
      <h2>Latest Blocks</h2>
      {!!blocks.length && <ul className="blockList">
        {blocks.map((block, index) => (
          <li key={index} onClick={() => handleBlockClick(block)}>
            <span className="blockAvatar"></span>
            <div className="blockDataWrap">
              <span className="id">{block.id}</span>

              <div className="time">{new Date(block.timeStamp).toISOString()}</div>
              <div className="colWrap">
                <span className="blockTxs">{block.transactions.length + " Txs"}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>}
      {bModalIsOpened &&
        <>
          <div className="bModalOverlay" onClick={() => setBModalIsOpened(false)}></div>
          <div className="bModal">
            <div className="headrow">
              <h3>Advanced Block Details</h3>
              <h4 className="closeBtn" onClick={() => setBModalIsOpened(false)}>X</h4>
            </div>
            <div className="detailsWrap">
              <div className="bCol">
                <div className="id">
                  <div className="label">ID:</div>
                  <div className="value">{blockID}</div>
                </div>
                <div className="row">
                  <div className="modalCol">
                    <div className="label">Hash:</div>
                    <div className="value">{hash}</div>
                  </div>
                  <div className="modalCol">
                    <div className="label">Previous Hash:</div>
                    <div className="value">{previousHash}</div>
                  </div>
                </div>
                <div className="row">
                  <div className="modalCol">
                    <div className="label">Nonce:</div>
                    <div className="value">{nonce}</div>
                  </div>

                  <div className="modalCol">
                    <div className="label">sent:</div>
                    <div className="value">{totalSent}</div>
                  </div>
                </div>
                <div className="row">
                  <div className="modalCol">
                    <div className="label">Average value:</div>
                    <div className="value">{averageValue}</div>
                  </div>
                  <div className="modalCol">
                    <div className="label">Mined:</div>
                    <div className="value">{time}</div>
                  </div>
                </div>
                <div className="row">
                  <div className="modalCol">
                    <div className="label">TargetDifficulty:</div>
                    <div className="value">{targetDifficulty}</div>
                  </div>
                  <div className="modalCol">
                    <div className="label">size:</div>
                    <div className="value">{size}</div>
                  </div>
                </div>
                <div className="row">
                  <div className="modalCol">
                    <div className="label">Total transactions:</div>
                    <div className="value">{totalTxs}</div>
                  </div>
                </div>
              </div>
              <div className="bCol">
                <Transactions transactions={transactions} blockID={blockID} blockLength={blocks.length} />
              </div>
            </div>
          </div>
        </>}
    </div>
  );
}

export default Blocks;
