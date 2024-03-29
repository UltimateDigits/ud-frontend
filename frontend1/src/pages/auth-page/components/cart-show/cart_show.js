import { ethers } from "ethers";
import React from "react";
import { useContext, useState } from "react";
import { Web3Storage } from "web3.storage";
import { UserContext } from "../../../../Hook.js";
import { abi_NFT, address_NFT } from "../../../../abi/Nft.js";
import conABI from "../../../../abi/abi.json";
import config from "../../../../config.json";
import checkTotalPrice from "../../../../functions/checkTotalPrice";
import PhoneNumberBox from "../../../../utils/boxes/PhoneNumberBox_show";
import LoadPage from "../../../../utils/loaders/LoadPage";
import "./cart_show.css";
import { toViem } from "@coinbase/waas-sdk-viem";
import { createWalletClient, http, parseEther } from "viem";
import { baseSepolia, bscTestnet, sepolia } from "viem/chains";
import { Address } from "@coinbase/waas-sdk-web";
import { connectConfig } from "../../../../ConnectKit/Web3Provider.jsx";
import { CommonButton } from "../../../../ConnectKit/CommonConnectKitButton.js";
import { ProtocolFamily } from "@coinbase/waas-sdk-web";

import { useSelector } from "react-redux";
import { useWalletContext } from "@coinbase/waas-sdk-web-react";
// import {
//   useSendTransaction,
//   useWaitForTransactionReceipt
// } from 'wagmi';
import {
  getAccount,
  waitForTransactionReceipt,
  sendTransaction,
} from "@wagmi/core";
import { parseUnits } from "viem";
import { getContract, createPublicClient, custom } from "viem";

function CartShow({
  cartArray,
  setProceedTo,
  setcartArray,
  contract_connect,
  setContract_connect,
  signer,
  number,
  walletaddress,
  setwalletaddress,
  setcontract,
}) {
  const { user, wallet } = useWalletContext();

  const userr = useSelector((state) => state.user);
  console.log(userr, "before redux");
  //initializing and declaring various variables
  const [cart, setCart] = useState([]);
  const { flag1, setflag1 } = React.useContext(UserContext);
  const searchParams = new URLSearchParams(window.location.search);
  const [queryParam, setQueryParam] = useState(searchParams.get("n") || "");
  // const [tokenId,setTokenId]=useState("");
  const { tokenId, setTokenId } = React.useContext(UserContext);
  console.log(tokenId);
  const data = {
    address: walletaddress,
    number: number,
    "contract'address": config.address_nft,
  };
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(false);
  const i = 0;

  const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http("https://data-seed-prebsc-1-s1.binance.org:8545/"),
  });

  // const { sendTransaction } = useSendTransaction();

  // const handleTransactionReceipt = async (receipt) => {
  //   if (receipt) {
  //     console.log("Transaction receipt:", receipt);
  //     // Set up contract
  //     const contract = getContract({
  //       address: config.address_nft,
  //       abi: conABI,
  //       client: publicClient,
  //     });

  //     if (contract) {
  //       setcontract(contract);
  //       console.log("Contract set-up done:", contract);
  //       console.log("Wallet address:", account.address);
  //       setwalletaddress(account.address);
  //       setLoad(false);
  //       setProceedTo("purchaseConfirmation");
  //     }
  //   }
  // };
  const account = getAccount(connectConfig);

  async function buyNumber() {
    setLoad(true);
    // Send to which address?
    const toaddress = "0x0EFA91C922ca18646c3A03A5bE8ad9CEe7522540";
    var amount;

    try {
      // Calculate transaction amount
      amount = flag1
        ? (parseInt(checkTotalPrice(cartArray)) - 5) * 0.0046790195017
        : parseInt(checkTotalPrice(cartArray)) * 0.0046790195017;
      setflag1("0");

      // Convert amount to Wei
      const someAmt = parseInt(0.0046790195017 * 10);
      const amt = parseEther(someAmt.toString());
      console.log("AMT:", amt);

      // Call sendTransaction
      if (amt !== 0) {
        // Call sendTransaction
        console.log("transaction sending started");
        if (userr.rootId === "ncw") {
          const { hash } = await sendTransaction(connectConfig, {
            account: account.address,
            to: toaddress,
            value: amt,
          });
          // Wait for transaction receipt using the callback function
          // const receipt = async () => {

          //   await waitForTransactionReceipt(connectConfig, {
          //     hash,
          //     // You can add other options like confirmations, onReplaced, etc. if needed
          //   });
          // }
          // const txReceipt = await receipt();
          console.log("Transaction hash:", hash);
        } else {
          console.log("address", userr.address);
          console.log("user", user);
          console.log("wallet", wallet);
          const address = await wallet.addresses.for(ProtocolFamily.EVM);
          console.log("address", address);
          const add = JSON.parse(localStorage.getItem("address"));
          console.log("address", add);
          const walletClient = createWalletClient({
            account: toViem(address),
            chain: bscTestnet,
            transport: http("https://data-seed-prebsc-1-s1.binance.org:8545/"),
          });
          console.log("walletClient", walletClient);
          console.log(
            "signing a message with address " + userr.address + "..."
          );
          const signature = await walletClient.signMessage({
            message: "hello from waas!",
          });
          console.log(`Got signature: ${signature}`);
          console.log("full address", userr.fulladdress);
          // console.log("full address", toViem(userr.fulladdress));
          console.log("full address from wallet ", toViem(address));

          const res = await walletClient.sendTransaction({
            account: toViem(address),
            to: toaddress, // recipient address
            value: amt, // transaction amount
            // ... other transaction parameters. see: https://viem.sh/docs/accounts/signTransaction.html
          });
          console.log("Transaction hash:", res);
        }

        // console.log("Transaction receipt:", txReceipt);
      } else {
        console.error("amt not defined");
      }

      const contract = getContract({
        address: config.address_nft,
        abi: conABI,
        client: publicClient,
      });

      if (contract) {
        setcontract(contract);
        console.log("Contract set-up done:", contract);
        console.log("Wallet address:", account.address);
        if (userr.rootId === "ncw") {
          setwalletaddress(account.address);
        } else {
          setwalletaddress(userr.fulladdress);
        }
        setLoad(false);
        setProceedTo("purchaseConfirmation");
      }
    } catch (error) {
      console.error("Error processing buyNumber:", error);
      setError(true); // Set error state to true
      setLoad(false); // Set loading state to false
    }
  }

  //funcion to ensure virtual number purchase
  //funcion to ensure virtual number purchase
  async function uyNumber() {
    setLoad(true);
    // send to which address ?
    const toaddress = "0x0EFA91C922ca18646c3A03A5bE8ad9CEe7522540";
    var amount;
    if (flag1) {
      amount = parseInt(checkTotalPrice(cartArray) - 5) * 0.0046790195017;
    } else {
      amount = parseInt(checkTotalPrice(cartArray)) * 0.0046790195017;
    }
    setflag1("0");
    // var amount = parseInt(checkTotalPrice(cartArray)) * 0.0046790195017;
    console.log(amount);
    let amt = ethers.parseUnits(amount.toString());
    const transacamount = "0x" + amt.toString(16);
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x61" }], // chainId must be in hexadecimal numbers
    });
    console.log(amt);

    try {
      signer
        .sendTransaction({
          to: toaddress,
          value: transacamount,
        })
        .then(async (txHash) => {
          console.log(txHash.hash);
          const provider = new ethers.BrowserProvider(window.ethereum);
          console.log(provider);

          //This is used to acces the checked in accounts
          provider
            .getSigner()
            .then(async (res) => {
              console.log(res);

              const contract = new ethers.Contract(
                config.address_nft,
                conABI,
                res
              );
              setcontract(contract);

              var walletaddress = res.address;

              console.log(walletaddress);
              setwalletaddress(walletaddress);

              setLoad(false);
              setProceedTo("purchaseConfirmation");
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((e) => {
          console.log(e);
          setError(true);
          setLoad(false);
        });
    } catch (err) {
      console.log(err);
    }
  }
  return cartArray.length != 0 ? (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="cart_show">
          <div className="searchResultsTable2">
            {/* Similar numbers */}
            {/* dropdown */}
            {/* numbers boxes */}
            <div className="searchResultsTableCol2">
              {cartArray.map(
                (number, i, ava) =>
                  queryParam !== number && (
                    <div className="each">
                      <PhoneNumberBox
                        number={number}
                        cart={cart}
                        setCart={setCart}
                        showAvailability={true}
                        available={true}
                        contract_connect={contract_connect}
                        signer={signer}
                        cartArray={cartArray}
                        setcartArray={setcartArray}
                        setContract_connect={setContract_connect}
                        setProceedTo={setProceedTo}
                      />
                    </div>
                  )
              )}
            </div>
          </div>
          <button
            className="cartCheckout"
            onClick={async () => {
              // await NFT_Gen();
              buyNumber();
            }}
          >
            Complete my Purchase
          </button>
          <p style={{ color: "white" }}>
            Please do NOT click ANY button on Ultimate Digits while your
            transaction is being completed
          </p>
          {error ? (
            <p
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10vh",
                color: "white",
                fontSize: "large",
              }}
            >
              Insufficient Balance
            </p>
          ) : (
            false
          )}
          {load ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "-40vh",
              }}
            >
              <LoadPage />
            </div>
          ) : (
            false
          )}
        </div>
      </div>
    </div>
  ) : (
    ""
  );
}
export default CartShow;
