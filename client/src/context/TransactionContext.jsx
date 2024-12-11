import React, { useEffect, useState } from 'react';
import { ethers} from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';


export const TransactionContext = React.createContext();

const { ethereum } = window;    

const createEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
  
    return transactionsContract;
  };

const getEthereumContract = async () => {
    console.log("Ethereum object:", ethereum);

    if (!ethereum) throw new Error("MetaMask is not installed!");

    try {
        
        const provider = new ethers.providers.Web3Provider(ethereum); // Ensure ethers is imported correctly
        const signer = provider.getSigner();
        const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

        return transactionContract;
    } catch (error) {
        console.error("Error in getEthereumContract:", error);
        throw new Error("Failed to initialize contract");
    }
};

export const TransactionProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);


    const handleChange = (e, name) => {

        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
    }

    const getAllTransactions = async () => {
        try {
          if (ethereum) {
            const transactionsContract = createEthereumContract();
    
            const availableTransactions = await transactionsContract.getAllTransactions();
    
            const structuredTransactions = availableTransactions.map((transaction) => ({
              addressTo: transaction.receiver,
              addressFrom: transaction.sender,
              timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
              message: transaction.message,
              keyword: transaction.keyword,
              amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }));
    
            console.log(structuredTransactions);
    
            setTransactions(structuredTransactions);
          } else {
            console.log("Ethereum is not present");
          }
        } catch (error) {
          console.log(error);
        }
      };

    const checkIfWalletIsConnected = async () => {

        try {

            if(!ethereum) {
                return alert("Please connect to MetaMask");
            }
    
            const accounts = await ethereum.request({ method: 'eth_accounts' });
    
            if(accounts.length > 0){
                setCurrentAccount(accounts[0]);
    
                getAllTransactions();
            } else {
                console.log("No accounts found");
            }
        } catch (error) {

            console.log(error);

            throw new Error("No ethereum object. ");
        }
    }

    const checkIfTransactionsExit = async () => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransctionCount();

            window.localStorage.setItem("transactionCount", transactionCount)
        } catch(error) {
            console.log(error);

            throw new Error("No ethereum object. ");
        }   
    }

    const connectWallet = async () => {

        try {
            if (!ethereum) return alert("Please install MetaMask");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            console.log(accounts);
            setCurrentAccount(accounts[0]); 
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object. ");
        }
    }

    const sendTransaction = async () => {

        try {
            if(!ethereum) return alert("Please install MetaMask");
            
            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = await getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);
            
            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', // 21000 GWEI
                    value: parsedAmount._hex,
                }]
            });

            const transactionHash = await transactionContract.addToBlockChain(addressTo, parsedAmount, message, keyword);

            setIsLoading(true);

            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`); 
            
            const transactionCount = await transactionContract.getTransctionCount();
            setTransactionCount(transactionCount.toNumber());

        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object. ");    
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExit();
    }, []); 

    return (
        <TransactionContext.Provider
            value={{
                transactionCount,
                connectWallet,
                transactions,
                currentAccount,
                isLoading,
                sendTransaction,
                handleChange,
                formData,
            }}
        >
      {children}
    </TransactionContext.Provider>
    )

}