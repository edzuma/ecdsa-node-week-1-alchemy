import Wallet from "./Wallet";
import Transfer from "./Transfer";
import PrivateKeyGen from "./PrivateKeyGen";
import "./App.scss";
import { useState } from "react";
import Transactions from "./Transactions";
import Blocks from "./Blocks";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");

  return (
    <div className="app">

      <div className="col">
      <Wallet
        balance={balance}
        setBalance={setBalance}
        address={address}
        setAddress={setAddress}
      />
      <Transfer setBalance={setBalance} from={address}/>
      </div>
      <div className="col"><PrivateKeyGen/></div>
      <div className="col">
      <Transactions />
      <Blocks/>
      </div>
    </div>
  );
}

export default App;
