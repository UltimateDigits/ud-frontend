import { useState, useEffect } from "react";
import "./LoginForm.css";
import config from "../../../../config.json";
import conABI from "../../../../abi/abi.json";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { ProtocolFamily } from "@coinbase/waas-sdk-web";
import { useSelector, useDispatch } from "react-redux";
import { Loader } from "rsuite";
import FullScreenLoader from "./FullScreenLoader";
import udIcon from "../../../../assets/ud-square-logo.png";
// import coinbase from "../../../../assets/home-page/coinbase.svg";
import coinbase from "../../../../assets/coinbase.svg";
import { useWalletContext } from "@coinbase/waas-sdk-web-react";
import axios from "axios";
import { disconnect, getAccount, switchChain } from "@wagmi/core";
import { useAccount, useEnsName } from "wagmi";

import {
  createPublicClient,
  getContract,
  http,
  createWalletClient,
} from "viem";
import { base, baseSepolia, bscTestnet } from "viem/chains";
import { connectConfig } from "../../../../ConnectKit/Web3Provider";
import { CustomButton } from "../../../../ConnectKit/ConnectKitButton";

import { setUserData } from "../../../../services/wallet/UserSlice";
import ErrorBoundary from "../Error-Boundary/ErrorBoundary";
const LoginForm = ({
  setProceedTo,
  setsigner,
  setwalletaddress,
  setcontract,
  setUser,

  log,
  setNav,
}) => {
  const { waas, user, isCreatingWallet, wallet, isLoggingIn, error } =
    useWalletContext();
  const userr = useSelector((state) => state.user);
  const dispatch = useDispatch();
  console.log(userr, "befie redux");

  // const updateUserInfo = (address, rootId) => {
  //   console.log(address, rootId);
  //   dispatch(setUser({ address: address, rootId: rootId }));
  // };
  //function to initialise and declare variables
  const navigate = useNavigate();
  const [openEmail, setOpenEmail] = useState(true);
  const [openPhone, setOpenPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [gotData, setGotData] = useState(false);

  const [gotAddress, setGotAddress] = useState(false);

  const [content, setContent] = useState("Loading .....");
  const { address } = useAccount();

  const checkUser = async (rootId, address) => {
    try {
      const apiurl = config.backend;
      const res = await axios.post(`${apiurl}/coinbase/verify`, {
        rootId: rootId,
      });

      console.log(res);
      if (res.status === 200) {
        const temp = res.data.user;

        if (temp.countryCode === "999") {
          console.log("inside the country code");
          console.log("gonna dispatch");
          dispatch(
            setUserData({
              ...userr,
              address: temp.address,
              phno: "",
              countryCode: temp.countryCode,
              virtuals: temp.virtuals,
              rootId: temp.rootId,
            })
          );
          setLoading(false);
          console.log("sleep3");

          navigate("/real-number");
        } else {
          dispatch(
            setUserData({
              ...userr,
              address: temp.address,
              phno: temp.phone,
              countryCode: temp.countryCode,
              rootId: temp.rootId,
            })
          );

          // setUser({
          //   isLoggedIn: true,
          //   email: "",
          //   phoneNumber: temp.phone,
          //   address: temp.address,
          // });
          setLoading(false);
          console.log("sleep4");

          navigate("/real-number");
        }
      } else if (res.status === 204) {
        dispatch(setUserData({ ...userr, rootId: rootId, address: address }));
        setLoading(false);

        navigate("/selection-page");
      }
    } catch (error) {
      console.log("error checking users", error);
    }
  };

  const handleLogin = async () => {
    console.log("logging in");
    console.log("if error", error);
    setLoading(true);
    setContent("Fetching your wallet");
    console.log("user", user);
    console.log("Waas", waas);
    if (user !== undefined) {
      if (user.hasWallet) {
        console.log("user already erukan so kaathirupom");
        const res1 = await waas.logout();
        // await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
        console.log(res1);
        // alert("already line la erukom bro")
        // handleLogin();
        setLoading(false);
        alert("try again");
        return;
      }
    }
    console.log("waas", waas);

    const res = await waas.login();

    console.log(res);
    console.log("wallet", wallet);
    console.log("user", user);
    console.log("isCreatingWallet", isCreatingWallet);

    if (res.hasWallet === false) {
      console.log("wallet not created");
      const wallet = await res.create();
      console.log("wallet", wallet);
      console.log("waas", waas);
      setContent("Creating your wallet");
      setLoadingCreate(true);

      // setLoading(true)

      const address = await wallet.addresses.for(ProtocolFamily.EVM);
      console.log("address", address);
      console.log(`Got address: ${address.address}`);
      // const privateKeys = await wallet.exportKeysFromHostedBackup(passcode);
      const privateKeys = await wallet.backup;
      console.log("private keys", privateKeys);
      dispatch(
        setUserData({
          address: address.address,
          rootId: wallet.rootContainerID,
          privKey: privateKeys,
          fulladdress: address,
          new: true,
        })
      );
      setLoadingCreate(false);
      navigate("/wallet");
      return;
      if (res) {
        dispatch(
          setUserData({ address: address.address, rootId: res.rootContainerID })
        );

        navigate("/wallet");
      }
    }
    if (res.hasWallet === true) {
      console.log("wallet created already");
      console.log("user", user);
      console.log("wass", waas);
      console.log("res", res);

      const res2 = await res.restoreFromHostedBackup();
      console.log(res2);
      setContent("Restoring your wallet");

      console.log("wallet", wallet);
      console.log("waas", waas);

      const address = await res2.addresses.for(ProtocolFamily.EVM);
      const priv = await res.backup;
      console.log("private keys", priv);
      console.log("address", address);
      localStorage.setItem("address", JSON.stringify(address));
      console.log(`Got address: ${address.address}`);

      dispatch(setUserData({ ...userr, privKey: priv }));

      if (res) {
        checkUser(res2.rootContainerID, address.address);
      }
    }
  };

  // Logout the user.
  const handleLogout = async () => {
    console.log("logging out");
    const res = await waas.logout();
    console.log(res);
  };

  const coinbaseThings = async () => {
    if (!user || wallet || isCreatingWallet) return;

    // NOTE: This will trigger a reflow of you component, and `wallet` will be set
    // to the created or restored wallet.

    console.log("user", user);
    if (user.hasWallet) {
      const res = await user.restoreFromHostedBackup();
      console.log(res);
      console.log("wallet", wallet);

      const address = await res.addresses.for(ProtocolFamily.EVM);
      console.log(`Got address: ${address.address}`);

      if (res) {
        // updateUserInfo(address.address, res.rootContainerID);
        // dispatch(
        //   setUserData({ address: address.address, rootId: res.rootContainerID })
        // );
        // console.log(userr, "after redux");

        // navigate("/selection-page");

        checkUser(res.rootContainerID, address.address);
      }
    } else {
      user.create(/* optional user-specified passcode */);
    }
  };

  useEffect(() => {
    // If the user is not yet logged in, the wallet is already loaded,
    // or the wallet is loading, do nothing.
    coinbaseThings();
  }, [user, wallet, isCreatingWallet]);
  useEffect(() => {
    setNav("2");
  }, []);

  useEffect(() => {
    if (address) {
      console.log("address from use hook", address);
      navigate("/real-number");
    } else {
    }
  }, []);

  // Get the query parameter string
  const queryString = window.location.search;
  const entho = async () => {
    await switchChain(connectConfig, { chainId: base.id });
  };
  const account = getAccount(connectConfig);
  useEffect(() => {
    entho();
  }, [account.chainId]);

  const checkAddress = async (address) => {
    console.log("Address", address);
    try {
      const apiurl = config.backend;
      const res = await axios.post(`${apiurl}/coinbase/getPhno`, {
        address: address,
      });
      if (res.status === 200) {
        console.log("there", res);
        const data = res.data.mapping;
        console.log(data);
        console.log(data.countryCode, "countryCode");
        const temp = data.virtuals[0];
        console.log(temp, "temp");

        if (data.countryCode === "999") {
          console.log("inside the country code");
          dispatch(
            setUserData({
              ...userr,
              address: data.address,
              phno: temp,
              countryCode: data.countryCode,
            })
          );
          console.log("sleep1");
          navigate("/real-number");
          setGotData(true);
        } else {
          dispatch(
            setUserData({
              ...userr,
              address: data.address,
              phno: data.phone,
              countryCode: data.countryCode,
            })
          );
          console.log("sleep2");
          const val = localStorage.getItem("in");

          if (val !== false) {
            navigate("/real-number");
          } else {
            setGotData(true);

            return;
          }

          //this is the check point for backking iussue
          return;
          // navigate("/real-number");
        }
      } else if (res.status === 204) {
        console.log("not there");
        dispatch(
          setUserData({
            ...userr,
            address: address,

            rootId: "ncw",
          })
        );
        navigate("/selection-page");
        setGotData(true);
      }
    } catch (error) {
      console.log("error in getting phno", error);
    }
  };

  useEffect(() => {
    if (account.isConnected && account.address) {
      console.log("Wallet Address:", account.address);
      checkAddress(account.address);

      setwalletaddress(account.address);
    }
  }, [account.isConnected, account.address]);
  const publicClient = createPublicClient({
    chain: base,
    transport: http("https://mainnet.base.org"),
  });

  async function connectWalletAndSetupContract() {
    if (gotAddress === false) {
      setOpenPhone(false);
      setOpenEmail(false);
      if (!gotData) {
        try {
          const contract = getContract({
            address: config.address_nft,
            abi: conABI,
            // 1a. Insert a single client
            client: publicClient,
          });
          if (contract && setProceedTo) {
            setcontract(contract);
            console.log(`Contract connected: ${contract.address}`);

            setUser({ isLoggedIn: true, email: "", phoneNumber: "" });
            console.log("FinalLog:", log);

            console.log(account.chainId, ":chainId");
            setGotAddress(true);
            // const res = await checkAddress(account);

            // Navigate based on the `log` state and presence of `setProceedTo` function
            // const destination = log ? "/selection-page" : "/login";
            // navigate(destination);
          }
        } catch (error) {
          console.error("Error setting up the contract:", error);
        }
      }
    }
  }

  return (
    <ErrorBoundary>
      <div
        className="loginWrapper"
        style={{ textAlign: setProceedTo ? "left" : "center" }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            marginTop: "4rem",
          }}
        >
          <img src={udIcon} style={{ width: "50px", height: "50px" }} />
        </div>
        <h2 style={{ textAlign: "center", color: "#3D4043" }}>
          Sign up or Log in
        </h2>

        <br />
        <CustomButton onSuccess={connectWalletAndSetupContract} />
        <button
          className=""
          onClick={handleLogin}
          style={{ color: "#3D4043", height: "60px", background: "white" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                columnGap: "10px",
              }}
            >
              {" "}
              <img src={udIcon} />
              Continue with Ultimate Wallet
            </div>
            <span>
              <img
                style={{
                  height: "fit-content",
                  width: "fit-content",
                  marginTop: "-30px",
                }}
                src={coinbase}
                alt="coinbase"
              />
            </span>
          </div>
        </button>
        <FullScreenLoader loading={loading} content={content} />
        <FullScreenLoader loading={loadingCreate} content={"Creating wallet"} />
        <div className="powered"></div>
        <div className="companyrights">© Ultimate Digits 2024</div>
      </div>
    </ErrorBoundary>
  );
};

export default LoginForm;
