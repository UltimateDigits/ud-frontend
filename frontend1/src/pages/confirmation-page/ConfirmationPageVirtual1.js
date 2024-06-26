import React, { useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import "./ConfirmationPageVirtual1.css";
// import nftLogo from "../../assets/ud-logo.png";
// import {address_NFT,abi_NFT} from "../../../../abi/Nft.js";
import "../auth-page/components/login-form/FullScreenLoader.css";
import conABI from "../../abi/abi1.json";
import config from "../../config.json";
import { address_NFT, abi_NFT } from "../../abi/Nft.js";
import nftLogo from "../../assets/ud-logo.png";
import { UserContext } from "../../Hook.js";
import { useNavigate } from "react-router-dom";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toViem } from "@coinbase/waas-sdk-viem";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

import {
  createPublicClient,
  http,
  getContract,
  createWalletClient,
} from "viem";
import { baseSepolia, bscTestnet, sepolia, base } from "viem/chains";
import {
  getAccount,
  readContract,
  writeContract,
  switchChain,
} from "@wagmi/core";
import { estimateGas } from "@wagmi/core";
import { parseEther } from "viem";

import { useSelector, useDispatch } from "react-redux";
import { getBalance } from "@wagmi/core";

import { connectConfig } from "../../ConnectKit/Web3Provider.jsx";
import axios from "axios";
import { ProtocolFamily } from "@coinbase/waas-sdk-web";
import { useWalletContext } from "@coinbase/waas-sdk-web-react";
import { waitForTransactionReceipt, sendTransaction } from "@wagmi/core";
import FullScreenLoader from "../auth-page/components/login-form/FullScreenLoader.js";

export default function ConfirmationPageVirtual1({
  setProceedTo,
  number,
  signer,
  contract_connect,
  cartArray,
}) {
  const { user, wallet } = useWalletContext();

  const userr = useSelector((state) => state.user);
  console.log(userr, "before redux");

  // Get the query parameter string
  const queryString = window.location.search;
  const navigate = useNavigate();
  const info = useContext(UserContext);
  const { tokenId, setTokenId } = info;
  const [add, setadd] = useState("");
  const [tid, settid] = useState("");
  const [nftMinted, setNftMinted] = useState(false);
  const [balanceVal, setBalanceVal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("Loading.....");

  const [loadingLink, setloadingLink] = useState(false);
  const [hashes, setHashes] = useState();

  const [mintingError, setMintingError] = useState(false);

  // Extract the "cart" parameter value from the query string
  const urlParams = new URLSearchParams(queryString);
  const cartParam = urlParams.get("cart");
  console.log(cartParam);
  console.log(typeof cartParam);
  const flag = 0;

  const publicClient = createPublicClient({
    chain: base,
    transport: http("https://mainnet.base.org"),
  });

  const account = getAccount(connectConfig);

  const getingBalance = async () => {
    const balance = await getBalance(connectConfig, {
      address: userr.address,
    });
    console.log("blance", balance);
    console.log("val", balance.formatted);
    setBalanceVal(balance.formatted);
    console.log("sy,", balance.symbol);
    console.log("value", balance.value);
  };

  useEffect(() => {
    getingBalance();
  }, []);

  async function NFT_Gen() {
    getingBalance();

    setLoading(true);
    setContent("Generating and Minting NFT");

    // await window.ethereum.request({
    //   method: 'wallet_switchEthereumChain',
    //   params: [{ chainId: '0xAA36A7' }], // chainId must be in hexadecimal numbers
    // });

    const contract = getContract({
      address: address_NFT,
      abi: abi_NFT,
      // 1a. Insert a single client
      client: publicClient,
    });

    try {
      async function uploadJSONToPinata(jsonData) {
        const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
        const headers = {
          "Content-Type": "application/json",
          pinata_api_key: "2fdfafd0931760b52f2c",
          pinata_secret_api_key:
            "be4da1450a4a5a8855fcddc13f9fac30e1a7e1b0b97a73feb34fff23fc4dde72",
        };
        const response = await fetch(url, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(jsonData),
        });

        if (!response.ok) {
          throw new Error(`IPFS pinning error: ${response.statusText}`);
        }

        return response.json();
      }

      // try {
      // cartArray.map(async (data, index) => {

      //   console.log(await uploadJSONToPinata(data));
      // });

      async function uploadCartArrayToPinata(cartArray) {
        const ipfsHashes = [];
        const gatewayUrl = "https://gateway.pinata.cloud/ipfs/";

        for (const phoneNumber of cartArray) {
          const jsonData = {
            phoneNumber: phoneNumber,
            image:
              "https://gateway.pinata.cloud/ipfs/QmfBERMctCnt5k4hGz1wx2dUyz7pPc5jmGMtrG8NoqW3Pd",
          };

          try {
            const result = await uploadJSONToPinata(jsonData);
            console.log(result);
            ipfsHashes.push(gatewayUrl + result.IpfsHash);
          } catch (error) {
            console.error(`Failed to upload ${phoneNumber}: ${error.message}`);
          }
        }

        return ipfsHashes;
      }

      const ipfsHashArray = await uploadCartArrayToPinata(cartArray).then(
        (ipfsHashes) => {
          console.log("Collected IPFS hashes:", ipfsHashes);
          setHashes(ipfsHashes);
          return ipfsHashes;
        }
      );
      // Call the function to start the upload process and collect IPFS hashes

      const Transaction = async () => {
        const arr = [
          "https://gateway.pinata.cloud/ipfs/QmT9CDDA13KzXHVenpw5njnJt7bVnuMQP63jJ6Ujwt6RHb",
        ];
        if (userr.rootId === "ncw") {
          try {
            const arr = [
              "https://gateway.pinata.cloud/ipfs/QmT9CDDA13KzXHVenpw5njnJt7bVnuMQP63jJ6Ujwt6RHb",
            ];
            const convertedCartArray = cartArray.map((value) =>
              parseInt(value, 10)
            );
            // console.log("cart", cartArray);

            console.log("hash", ipfsHashArray);
            console.log("convertedCartArray", convertedCartArray);
            if (ipfsHashArray.length === 0 || convertedCartArray.length === 0) {
              setLoading(false);
              alert("no element  inarray");

              return;
            }
            const hash = await writeContract(connectConfig, {
              abi: contract.abi,
              address: contract.address,
              functionName: "mintMultipleNFTs",
              args: [ipfsHashArray, convertedCartArray],
            });
            // const { isLoading: isConfirming, isSuccess: isConfirmed } =
            //   useWaitForTransactionReceipt({
            //     hash,
            //   });
            console.log("hash", hash);
            console.log("ulla");
            setNftMinted(true);
            setLoading(false);

            console.log("veliya");
          } catch (error) {
            console.log("error in ncw", error);
            setMintingError(true);
            setLoading(false);

            return;
          }
        } else {
          console.log("user", user);
          console.log("wallet", wallet);
          const address = await wallet.addresses.for(ProtocolFamily.EVM);
          console.log("address", address);
          const convertedCartArray = cartArray.map((value) =>
            parseInt(value, 10)
          );

          console.log("hash", ipfsHashArray);
          console.log("convertedCartArray", convertedCartArray);
          if (balanceVal != 0) {
            try {
              const walletClient = createWalletClient({
                account: toViem(address),
                chain: base,
                transport: http("https://mainnet.base.org"),
              });

              console.log("walletClient", walletClient);
              if (
                ipfsHashArray.length === 0 ||
                convertedCartArray.length === 0
              ) {
                setLoading(false);
                alert("no element  inarray");

                return;
              }
              const arr = [
                "https://gateway.pinata.cloud/ipfs/QmT9CDDA13KzXHVenpw5njnJt7bVnuMQP63jJ6Ujwt6RHb",
              ];
              const hash = await walletClient.writeContract({
                address: contract.address,
                abi: contract.abi,
                functionName: "mintMultipleNFTs",
                args: [ipfsHashArray, convertedCartArray],
              });
              setNftMinted(true);
              console.log("hash", hash);
              setLoading(false);
            } catch (error) {
              setMintingError(false);
              console.log("other error", error);
              setLoading(false);
            }
          } else {
            alert("not sufficient Base ETH balance");
            setLoading(false);
            setMintingError(false);
          }
        }
      };
      await Transaction();

      console.log("minting called");

      setadd(`Address : ${address_NFT}`);
      var check = 0;
      if (mintingError) {
        return;
      }
      cartArray.map(async (number, i) => {
        console.log("UID ");

        console.log("user", userr);

        console.log("settingUIDtransaction got through");
        check++;
        console.log(check);

        try {
          const apiurl = config.backend;
          if (userr.rootId === "ncw") {
            const res = await axios.post(`${apiurl}/coinbase/map-phno`, {
              phoneNumber: number,
              address: userr.address,
              countryCode: "999",
              rootId: "ncw",
              type: "virtual",
            });

            if (res.status === 200 || res.status === 201) {
              console.log("Mapping successful");
              setloadingLink(false);
              if (check === cartArray.length) {
                navigate(
                  `/selection-page/my-numbers/confirm-page?number=${number}`
                );
              }
            }
          } else {
            const res = await axios.post(`${apiurl}/coinbase/map-phno`, {
              phoneNumber: number,
              address: userr.address,
              countryCode: "999",
              rootId: userr.rootId,
              type: "virtual",
            });

            if (res.status === 200 || res.status === 201) {
              console.log("Mapping successful");
              setloadingLink(false);
              if (check === cartArray.length) {
                navigate(
                  `/selection-page/my-numbers/confirm-page?number=${number}`
                );
              }
            }
          }
        } catch (error) {
          console.log(error);
          setloadingLink(false);
        }
        // if (transaction) {

        // } else {
        //   console.error("error");
        //   console.log("another transaction didn't get through");
        // }
      });
      console.log(cartArray.length);
      // navigate(`/selection-page/my-numbers/confirm-page?number=${number}`);
      // settid(`TokenId : ${parseInt(number)}`);
      // console.log(parseInt(number) + " the nft minting number ");
      // if (transaction) {
      // } else {
      //   console.log("Your transaction didn't get through");
      // }
    } catch (error) {
      console.error("Error processing NFT_gen:", error);
      toast.warn("Check your balance");
      setNftMinted(false);
      setLoading(false);
    }
  }

  async function PerformAction() {
    // Your action here
    // await window.ethereum.request({
    //   method: 'wallet_switchEthereumChain',
    //   params: [{ chainId: '0x61' }], // chainId must be in hexadecimal numbers
    // })
    setContent("Linking Number");
    console.log("called here");
    console.log(cartArray);
    setloadingLink(true);

    const contract = getContract({
      abi: conABI,
      address: config.address,
      // 1a. Insert a single client
      client: publicClient,
    });

    await switchChain(connectConfig, { chainId: base.id });
    var check = 0;
    console.log("contract_connect", contract);

    // const hash = await walletClient.writeContract({
    //      address: contract_connect.address,
    //      abi: contract_connect.abi,
    //      functionName: 'SettingUniqueId',
    //      args: [number, "999"],
    //    })
    console.log(cartArray);
    var transaction = async () => {
      if (userr.rootId === "ncw") {
        console.log("ncw");
        await writeContract(connectConfig, {
          abi: contract_connect.abi,
          address: contract_connect.address,
          functionName: "SetUniqueNumber",
          args: [cartArray],
        });
      } else {
        console.log("user", user);
        console.log("wallet", wallet);
        const address = await wallet.addresses.for(ProtocolFamily.EVM);
        console.log("address", address);

        const walletClient = createWalletClient({
          account: toViem(address),
          chain: base,
          transport: http("https://mainnet.base.org"),
        });
        console.log("walletClient", walletClient);
        const hash = await walletClient.writeContract({
          address: contract.address,
          abi: contract.abi,
          functionName: "SetUniqueNumber",
          args: [cartArray],
        });
        console.log("hash", hash);
      }
    };
    await transaction();

    // setloadingLink(false);
  }

  async function PerfomAction() {
    // Your action here
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x61" }], // chainId must be in hexadecimal numbers
    });
    var check = 0;
    console.log(contract_connect);
    cartArray.map(async (number, i) => {
      var transaction = await contract_connect.SettingUniqueId(number, "999");
      transaction
        .wait()
        .then((res) => {
          console.log(res);

          check++;
          console.log(check);
          if (check == cartArray.length) {
            navigate(
              `/selection-page/my-numbers/confirm-page?number=${number}`
            );
          }
        })
        .catch((e) => {
          console.log(e);
        });
    });
    console.log(cartArray.length);
  }
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="confirmationPageVirtual1">
        <div>
          <div style={{ display: "flex", gap: "20px" }}>
            {cartArray.map((val, index) => (
              <div className="cpv1-nft" key={index}>
                <div className="nft-logo">
                  <img
                    src={nftLogo}
                    alt="image"
                    width={120}
                    style={{ width: "10rem" }}
                  ></img>
                  <div className="nft-number" style={{ color: "white" }}>
                    <b> {`+999 ${val}`} </b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!nftMinted && (
          <div className="cpv2-btn" style={{ margin: "5 rem" }}>
            <button
              onClick={async () => {
                // PerformAction();
                await NFT_Gen();
              }}
            >
              Generate NFT and Link Number to Wallet
            </button>
          </div>
        )}
        {nftMinted && (
          <div className="cpv2-btn2" style={{ margin: "4 rem" }}>
            <button disabled>NFT Generated and Linked</button>
          </div>
        )}
        <div className="row-token">
          <h5 style={{ color: "white" }}>{add}</h5>
          <h5 style={{ color: "white" }}>{tid}</h5>
        </div>

        <div className="cpv1-content" style={{ marginTop: "3rem" }}>
          <div className="text">Congrats! </div>
          <div className="sub-text">
            You’ve purchased a virtual mobile number. <br></br>Click above to
            claim your NFT and to link it to your connected wallet.
          </div>
        </div>

        <div className="cpv2-btn" style={{ marginTop: "-1.8rem" }}>
          {nftMinted === "ty" && (
            <button
              disabled
              style={{
                background: "#f2f2f2",
                color: "#a9a9a9",
                cursor: "not-allowed",
              }}
              // onClick={async () => {
              //   PerformAction();
              //   // await NFT_Gen()
              // }}
            >
              Mint then Link your number to a wallet
            </button>
          )}
          {nftMinted === "th" && (
            <button
              onClick={async () => {
                PerformAction();
                // await NFT_Gen()
              }}
            >
              Link your number to a wallet
            </button>
          )}
        </div>

        <ToastContainer />

        <FullScreenLoader loading={loading} content={content} />
        <FullScreenLoader loading={loadingLink} content={content} />
      </div>
    </div>
  );
}
