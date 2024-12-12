import server from "./server";
import { useEffect, useState } from "react";

function Transactions() {
  const [txs,setTxs] = useState([]);

  useEffect(()=>{
    const intervalID = setInterval(async () => {
      const {data} = await server.get("/transactions");
      setTxs(data);
    },10000);
    return () => clearInterval(intervalID);
  },[]);

  return (
    <div className="container transactions">
      <h2>Unconfirmed Transactions</h2>
      <ul className="txList">
      {txs.map((tx, index) => (
              <li key={index} onClick={() => handleTxClick(tx)}>
                <span className="hash">{`${tx.hash.slice(0,5)}-${tx.hash.slice(-5)}`}</span>
                <span className="time">{new Date(tx.timeStamp).toISOString()}</span>
                <span className="value">{tx.amount}</span>
              </li>
            ))}
      </ul>
    </div>
  );
}

export default Transactions;
