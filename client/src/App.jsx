import Wallet from "./Wallet";
import Transfer from "./Transfer";
import PrivateKeyGen from "./PrivateKeyGen";
import "./App.scss";
import { useState } from "react";

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
    </div>
  );
}

export default App;
