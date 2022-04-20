import "./App.css";

import { ethers } from "ethers"; // librería para interactuar con nuestro smart contract
import { useState } from "react";

import Criptdle from "./contract/Criptdle.json"; // ABI

const criptdleAddress = "0x484BeEe231e6decD5988e20663538D8722e83733"; // la dirección de nuestro smart contract

function App() {
  const [words, setWords] = useState([]); // para guardar las palabras que obtengamos del readWords()
  const [word, setWord] = useState(""); // para guardar la palabra que el usuario escribe en el input
  const [isLoading, setIsLoading] = useState(false); // para indicar al usuario que la info se está cargando
  const [randomWord, setRandomWord] = useState();
  const [isUsed, setIsUsed] = useState();

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
      setWord("");
      setIsLoading(false);
    }
  }


  async function fetchWord() {
    // función que trae una palabra al azar de la blockchain, usando la función getWord() de nuestro smart contract
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        criptdleAddress,
        Criptdle.abi,
        provider
      );
      try {
        const data = await contract.getWord();
        setRandomWord(data);
      } catch (err) {
        console.log("Error: ", err);
      }
    } else {
      alert("Tenés que tener Metamask instalada.");
    }
  }


  async function checkIfIsUsed() {
    // función que comprobará si la palabra está usada
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        criptdleAddress,
        Criptdle.abi,
        provider
      );
      try {
        const data = await contract.isUsed(randomWord);
        
        if(data) {
          setIsUsed("Ya se usó :(");
        } else {
          setIsUsed("Messirve");
        }


      } catch (err) {
        console.log("Error: ", err);
      }
    } else {
      alert("Tenés que tener Metamask instalada.");
    }
  }

  return (
    <div className="App">
      <button onClick={fetchWords}>Ver todas las palabras</button>
      <br />
      <br />
      <br />
      <input
        placeholder="Nueva palabra..."
        onChange={(e) => setWord(e.target.value)}
        value={word}
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


      <br />
      <br />

      <button onClick={fetchWord}>Traer palabra al azar</button>
      <br />
      {randomWord}


      <br />
      <br />

      <button onClick={checkIfIsUsed}>¿Se usó esta palabra?</button>
      <br />
      {isUsed}
    </div>
  );
}

export default App;
