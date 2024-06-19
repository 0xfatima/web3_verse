import React, { useState, useEffect, children } from "react";
import { ethers } from "ethers";

import { contractAddress, contractABI } from "../utils/constants";

const { ethereum } = window;
export const TransactionContext = React.createContext();


const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);//does not work in version 6 of ethers downgade to version 5.7.2
  //new ethers.BrowserProvider(window.ethereum)
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [isLoading, setIsLoading]= useState(false);
  const [transactionCount, setTransactionCount]=useState(localStorage.getItem('transactionCount'))
  const [transactions, setTransactions]=useState([])

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions= async ()=>{
    try {
      if(!ethereum)return "please install meta mask"//return statement of if block
      const transactionContract= getEthereumContract();
      const availableTransactions= await transactionContract.getAllTransactions();
      const structuredTransactions= availableTransactions.map((transaction)=>({
        addressTo:transaction.reciever,
        addressFrom:transaction.sender,
        timestamp: new Date(transaction.timestamp.toNumber()*1000).toLocaleString(),
        message:transaction.message,
        keyword:transaction.keyword,
        amount:parseInt(transaction.amount._hex)/ (10**18)
      }))
      console.log(structuredTransactions)
      setTransactions(structuredTransactions)
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("please install metamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getAllTransactions();
      } else {
        console.log("No accounts found!");
      }
    } catch (error) {
      throw new Error("No ethereum object");
    }
  };

  const checkIfTransactionsExist= async ()=>{
    try {
      const transactionContract= getEthereumContract();
      const transactionCount= await transactionContract.getTransactionCount();
      window.localStorage.setItem("transactionCount",transactionCount )
    } catch (error) {
      throw new Error("No ethereum object");
    }
  }
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("please install metamask.");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      throw new Error("No ethereum object");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, []);

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("please install metamask.");
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract= getEthereumContract();

      const parsedAmount= ethers.utils.parseEther(amount);
      await ethereum.request({
        method:'eth_sendTransaction',
        params:[{
          from:currentAccount,
          to:addressTo,
          gas:'0x5208',
          value:parsedAmount._hex,
        }]
      })
      
      const transactionHash= await transactionContract.addToBlockchain(addressTo, parsedAmount,message,keyword);
      setIsLoading(true);
      console.log(`loading-${transactionHash.hash}`)
      await transactionHash.wait();
      setIsLoading(false);
      console.log(`success-${transactionHash.hash}`)
      const transactionCount= await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber())
      window.reload();

    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        sendTransaction,
        handleChange,
        formData,
        transactions,
        isLoading
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
