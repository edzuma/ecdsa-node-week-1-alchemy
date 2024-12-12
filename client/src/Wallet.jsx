import server from "./server";
import { isAddress } from "web3-validator";
import { useState } from "react";

function Wallet({ address, setAddress, balance, setBalance }) {
  const [errorMsg, setErrorMsg] = useState("");
  async function onChange(evt) {
    const address = evt.target.value;
    setErrorMsg("");
    setAddress(address);
    if (!isAddress(address)) { 
      setBalance(0); 
      return setErrorMsg("invalid wallet address!");
     }
    try {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } catch (ex) {
      return setErrorMsg("error getting balance, " + ex?.response?.data?.message || ex?.message || ex );
    } 
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>
      {errorMsg && <div className="errorMsg">{errorMsg}</div>}
      <label>
        Wallet Address
        <input placeholder="Type a valid ether address" value={address} onChange={onChange}></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
