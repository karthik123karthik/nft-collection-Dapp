
import Head from "next/head";
import {useRef ,useState,useEffect} from "react";
 import Web3Modal from "web3modal";
 import {Contract, providers, utils} from "ethers";
 import styles from "../styles/Home.module.css"
 import {CONTRACT_ADDRESS,CONTRACT_ABI} from "../constants";



export default function Home(){
  const[isOwner,setIsOwner] = useState(false);
  const [isWalletConnected,setIsWalletConnected]  = useState(false);
  const [preSaleStarted,setPreSaleStarted ] = useState(false);
  const [preSaleEnded,setPreSaleEnded] = useState(false);
  const [loading,setLoading] = useState(false);
  const [numTokensMinted,setNumTokensMinted] = useState(0);
  const web3ModalRef = useRef();



  //function to get number of nfts minted

  const getNumMintedTokens = async()=>{
       try{
          const provider =await getProviderOrSigner();
          const contract = new Contract(CONTRACT_ADDRESS,CONTRACT_ABI,provider);
          const tokenIds = await contract.tokenIds();
          setNumTokensMinted(tokenIds.toString());
       }
       catch(error){
         console.log(error);
       }
  }

  //function to get owner
 const getOwner = async()=>{
   try{
    const signer = await getProviderOrSigner(true);
    const contract = new Contract(CONTRACT_ADDRESS,CONTRACT_ABI,signer);
    const owner = await contract.owner();
    const sender = await signer.getAddress();
    if(owner.toLowerCase() === sender.toLowerCase()){
      setIsOwner(true);
    }
    else{
      setIsOwner(false);
    }
   }
   catch(error){
     console.error(error);
   }
 }

 //presale mint function 

 const presaleMint = async()=>{
   try{
     setLoading(true);
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(CONTRACT_ADDRESS,CONTRACT_ABI,signer);
      const tx  = await contract.presaleMint({
        value:utils.parseEther("0.01")
      });
      await tx.wait();
      console.log("your nft minted");
      setLoading(false);
   }
   catch(error){
     console.error(error);
   }
 }
 const publicMint = async()=>{
   try{
     setLoading(true);
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(CONTRACT_ADDRESS,CONTRACT_ABI,signer);
      const tx  = await contract.mint({
        value:utils.parseEther("0.01")
      });
      await tx.wait();
      console.log("your nft minted");
      setLoading(false);
      setNumTokensMinted((prev) => prev+1)
   }
   catch(error){
     console.error(error);
   }
 }


 //check for presaleended

 const checkIfPresaleEnded = async ()=>{
   try{
    const provider = await getProviderOrSigner();
    const contract = new Contract(CONTRACT_ADDRESS,CONTRACT_ABI,provider);
    const _isended = await contract.presaleEnded();
    const hasEnded = _isended.lt(Math.floor(new Date()/1000));
    setPreSaleEnded(hasEnded);
    
   }
   catch(error){
     console.error(error);
   }

 }


  //start the presale

  const startPreSale = async()=>{
    try{
      setLoading(true);
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(CONTRACT_ADDRESS,CONTRACT_ABI,signer);
      const tx = await contract.startPresale();
      await tx.wait();
      setPreSaleStarted(true);
      setLoading(false);
    }
    catch(error){
      console.log(error);
    }
  }


  //check presale 

  const isPreSaleStarted = async()=>{
    try{
       const provider = await getProviderOrSigner();
       const contract = new Contract(CONTRACT_ADDRESS,CONTRACT_ABI,provider);
       const preSaleStarted = await contract.presaleStarted();
       setPreSaleStarted(preSaleStarted);    
       return preSaleStarted;   
    }
    catch(error){
      console.error(error);
      return false;
    }
  }

  //function give provider and signer

  const getProviderOrSigner = async (needSigner=false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    
    const {chainId} = await web3Provider.getNetwork();
    if(chainId!==4){
      window.alert("wrong network");
      throw Error("change the network");
    }

    if(needSigner){
      const signer =web3Provider.getSigner();
      return signer;
    }

    return web3Provider;

  }


  //connect a wallet
  const connectWallet = async ()=>{

    try{
      await getProviderOrSigner();
      setIsWalletConnected(true);
    }
    catch(error) {
       console.log(error);
    }
       
  }


  const onPageLoad = async()=>{
     await  connectWallet();
     await getOwner();
     const preSaleStarted = await isPreSaleStarted();
     if(preSaleStarted) {
       await checkIfPresaleEnded();
     }
    await getNumMintedTokens();
    //get number of tokens
    setInterval(async()=>{
        await getNumMintedTokens();

    },5*1000);

    //get sale status

    setInterval(async()=>{
       const presaleStarted  = await isPreSaleStarted();
       if(presaleStarted){
         await checkIfPresaleEnded();
       }
    },5*1000);
  }

  


//initiate a web3modal object;
  useEffect(() => {
    if(!isWalletConnected){
       web3ModalRef.current = new Web3Modal({
         network:"rinkeby",
         providerOptions:[],
         disableInjectedProvider:false,
       });

       onPageLoad();
    }   

   
  }, [])
  


 function renderBody(){
  if(!isWalletConnected){
    return (<button className={styles.button} onClick={connectWallet}>connect your wallet</button>)
  }

  if(isOwner && !preSaleStarted){
    //render a button to start presale
   return( <button className={styles.button} onClick={startPreSale}>start presale</button>);
  }
  if(!preSaleStarted){
    //send a message saying come back later
    return(
      <div>
        <span>presale has not started yet comeback later</span>
      </div>
    )
  }


  if(preSaleStarted && !preSaleEnded){
    //render a button to mint a nft and address should be whiteListed
    return(
      <div>
        <span>presale is started you can mint an nft if you are whiteListed</span>
        <button className={styles.button} onClick={presaleMint} >presale mint</button>
      </div>
    )
  }

  if(preSaleEnded){
    //rend a button to mint public 
    return(
      <div>
        <span>presale is ended you can mint an nft if any remaining</span>
        <button className={styles.button} onClick={publicMint}>public mint</button>
      </div>
    )
  }
}

  return(
    <div>
    <Head>
      <title>my-app</title>
    </Head>
    <div className={styles.main}>
      <h1 className={styles.title}>welcome to cryptoDev</h1>
      <img className={styles.poster} src="/cryptodev.svg"></img>
      <div className={styles.description} >{numTokensMinted}/20 have been minted!...</div>
      {loading? <span>loading...</span>:
      renderBody()
       }
    </div>
    </div>
  )
}