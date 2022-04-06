import "./App.css";
import { ethers } from "ethers";
import { useState } from "react";
import Criptdle from "./contract/Cripdle.json";

const criptdleAddress = "0xc13A13144D2E68ACa1e1e6Fd6d75aADD4737814C";

function App() {

  const [words, setWords] = useState([]);
  const [word, setWord] = useState();
  const [isLoading, setIsLoading] = useState(false);

  async function fetchWords() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        criptdleAddress,
        Criptdle.abi,
        provider
      );
      try {
        const data = await contract.readWords();
        setWords(data);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  async function requestAccount() {
    await window.ethereum.request({method: "eth_requestAccounts"});
  }

  async function newWord() {
    if (!word) return;
    
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        criptdleAddress,
        Criptdle.abi,
        signer
      );

      setIsLoading(true);
      const transaction = await contract.createWord(word);
      await transaction.wait();
      fetchWords();
      setIsLoading(false);
    }

  }

  return (
    <div className="App">
      <ul className="Words">
        {words.map((word)=> (
          <li key={word}>{word}</li>
        ))}
      </ul>
      
      <button onClick={fetchWords}>Traer las palabras</button>
      <br /><br />
      <input placeholder="Nueva palabra" onChange={e => setWord(e.target.value)} />
      <button onClick={newWord}>Crear palabra</button>

      <br /><br />
      {isLoading && <p>Cargando...</p>}
    </div>
  );
}

export default App;
