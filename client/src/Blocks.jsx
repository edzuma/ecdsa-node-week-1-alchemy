import server from "./server";
import { useEffect, useState } from "react";

function Blocks() {
    const [blocks, setBlocks] = useState([]);

    useEffect(() => {
        const intervalID = setInterval(async () => {
            const { data } = await server.get("/blocks");
            setBlocks(data);
        }, 15000);
        return () => clearInterval(intervalID);
    }, []);

    return (
        <div className="container blocks">
            <h2>Latest Blocks</h2>
            <ul className="blockList">
                {blocks.map((block, index) => (
                    <li key={index} onClick={() => handleBlockClick(tx)}>
                        <span className="blockAvatar"></span>
                        <div>
                        <span className="id">{block.id}</span>

                        <div className="time">{new Date(block.timeStamp).toISOString()}</div>
                        <div className="colWrap">
                            <span className="blockTxs">{block.transctions.length + " Txs"}</span>
                            <span className="blockSize"></span>
                        </div>
                        </div>    
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Blocks;
