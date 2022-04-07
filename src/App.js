import "./App.css";

import { ethers } from "ethers"; // librería para interactuar con nuestro smart contract
import { useState } from "react";

import Criptdle from "./contract/Cripdle.json"; // ABI

const criptdleAddress = "0xc13A13144D2E68ACa1e1e6Fd6d75aADD4737814C"; // la dirección de nuestro smart contract

function App() {
  const [words, setWords] = useState([]); // para guardar las palabras que obtengamos del readWords()
  const [word, setWord] = useState(); // para guardar la palabra que el usuario escribe en el input
  const [isLoading, setIsLoading] = useState(false); // para indicar al usuario que la info se está cargando

  async function fetchWords() {
    // función que trae las palabras de la blockchain, usando la función readWords() de nuestro smart contract
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        criptdleAddress,
        Criptdle.abi,
        provider
      );
      try {
        setIsLoading(true);
        const data = await contract.readWords();
        setWords(data);
        setIsLoading(false);
      } catch (err) {
        console.log("Error: ", err);
      }
    } else {
      alert("Tenés que tener Metamask instalada.");
    }
  }

  async function requestAccount() {
    // fuunción para obtener la cuenta de Metamask
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function newWord() {
    // función para escribir una nueva palabra en la blockchain, usando la función createWord() de nuestro smart contract
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
      <button onClick={fetchWords}>Traer las palabras</button>
      <br />
      <br />
      <br />
      <input
        placeholder="Nueva palabra..."
        onChange={(e) => setWord(e.target.value)}
      />
      <br />
      <br />
      <button onClick={newWord}>Crear palabra</button>

      <br />
      <br />
      {isLoading && <div className="Loading"></div>}
      <ul className="Words">
        {words.map((word) => (
          <li key={word}>{word}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
