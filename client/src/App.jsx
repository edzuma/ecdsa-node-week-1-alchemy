import Wallet from "./Wallet";
import Transfer from "./Transfer";
import PrivateKeyGen from "./PrivateKeyGen";
import "./App.scss";
import { useState } from "react";

function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [indexdDBAllowed,setIndexdDBAllowed] = useState(false);
  const [pKeyExist,setPKeyExist] = useState(false);

  return (
    <div className="app">
      <Wallet
        balance={balance}
        setBalance={setBalance}
        address={address}
        setAddress={setAddress}
      />
      <Transfer setBalance={setBalance} address={address}/>
      <PrivateKeyGen/>
    </div>
  );
}

export default App;
