import server from "./server";
import { useState } from "react";

function Transactions({transactions, blockID, blockLength}) {
  const [tModalIsOpened, setTModalIsOpened] = useState(false)
  const [hash, setHash] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [value, setValue] = useState("");
  const [nonce, setNonce] = useState("");
  const [confirmations, setConfirmations] = useState("");
  const [time, setTime] = useState("");


  function handleTxClick(tx) {
    setHash("0x" + tx.hash);
    setFrom(tx.from);
    setTo(tx.to);
    setValue(tx.amount);
    setNonce(tx.nonce);
    const t = new Date(tx.timeStamp).toISOString();
    setTime(t);
    setConfirmations(blockLength - blockID+1);
    setTModalIsOpened(true);
  }



  return (
    <div className="container transactions">
      <h3>Transactions</h3>
      {!!transactions.length && <ul className="txList">
        {transactions.map((tx, index) => (
          <li key={index} onClick={() => handleTxClick(tx)}>
            <span className="hash">{`0x${tx.hash.slice(0, 3)}-${tx.hash.slice(-5)}`}</span>
            <span className="time">{new Date(tx.timeStamp).toISOString()}</span>
            <span className="value">{tx.amount}</span>
          </li>
        ))}
      </ul>}
      {tModalIsOpened &&
        <>
          <div className="modal tModal">
            <div className="headrow">
              <h3>Advanced Transaction Details</h3>
              <h4 className="closeBtn" onClick={() => setTModalIsOpened(false)}>X</h4>
            </div>
            <div className="row">
              <div className="modalCol">
                <div className="label">Hash:</div>
                <div className="value">{hash}</div>
              </div>
              <div className="modalCol">
                <div className="label">From:</div>
                <div className="value">{from}</div>
              </div>
            </div>
            <div className="row">
              <div className="modalCol">
                <div className="label">To:</div>
                <div className="value">{to}</div>
              </div>

              <div className="modalCol">
                <div className="label">Confirmations:</div>
                <div className="value">{confirmations}</div>
              </div>
            </div>
            <div className="row">
              <div className="modalCol">
                <div className="label">Value:</div>
                <div className="value">{value}</div>
              </div>
              <div className="modalCol">
                <div className="label">Time:</div>
                <div className="value">{time}</div>
              </div>
            </div>
            <div className="row">
              <div className="modalCol">
                <div className="label">Nonce:</div>
                <div className="value">{nonce}</div>
              </div>

            </div>
          </div>
        </>}
    </div>
  );
}

export default Transactions;
