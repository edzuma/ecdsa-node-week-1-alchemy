import server from "./server";
import { useEffect, useState } from "react";

function Transactions() {
  const [txs, setTxs] = useState([]);
  const [hash, setHash] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [value, setValue] = useState("");
  const [nonce, setNonce] = useState("");
  const [confirmations, setConfirmations] = useState("");
  const [time, setTime] = useState("");
  const [modalIsOpened, setModalIsOpened] = useState(false);



  function handleTxClick(tx) {
    setHash("0x" + tx.hash);
    setFrom(tx.from);
    setTo(tx.to);
    setValue(tx.amount);
    setNonce(tx.nonce);
    const t = new Date(tx.timeStamp).toISOString();
    setTime(t);
    setConfirmations("Unconfirmed");
    setModalIsOpened(true);
  }

  function handleOverlayClick() {
    setModalIsOpened(false);
  }

  useEffect(() => {
    async function getTxs() {
      const { data } = await server.get("/transactions");
      setTxs(data);
    }
    getTxs();
    const intervalID = setInterval(async () => {
      await getTxs()
    }, 10000);
    return () => clearInterval(intervalID);
  }, []);

  return (
    <div className="container transactions">
      <h2>Unconfirmed Transactions</h2>
      {!!txs.length &&
        <ul className="txList">
          {txs.map((tx, index) => (
            <li key={index} onClick={() => handleTxClick(tx)}>
              <span className="hash">{`0x${tx.hash.slice(0, 3)}-${tx.hash.slice(-5)}`}</span>
              <span className="time">{new Date(tx.timeStamp).toISOString()}</span>
              <span className="value">{tx.amount}</span>
            </li>
          ))}
        </ul>
      }
      {modalIsOpened &&
        <>
          <div className="overlay" onClick={() => handleOverlayClick()}></div> <div className="modal">
            <div className="headrow">
              <h3>Advanced Transaction Details</h3>
              <h4 className="closeBtn" onClick={() => setModalIsOpened(false)}>X</h4>
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
