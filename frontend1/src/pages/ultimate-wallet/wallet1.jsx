import React, { useEffect, useState } from "react";
import "./wallet.css";
import frame from "../../assets/Frame.svg";
import clipboard from "../../assets/clipboard.svg";
import qr from "../../assets/qr.svg";
import { QRCodeSVG } from "qrcode.react";
import { useSelector, useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";
import { useWalletContext } from "@coinbase/waas-sdk-web-react";

const WalletAf = () => {
  const { waas, user, isCreatingWallet, wallet, isLoggingIn } =
    useWalletContext();
  const navigate = useNavigate();
  const [privatekey, setPrivatekey] = useState(
    "asddsagsdgasdgadsgdsgasdgasdgasd23"
  );
  const userr = useSelector((state) => state.user);

  const [showPrivKey, setShowPrivKey] = useState(false);
  const [address, setAddress] = useState("0x1234567890");
  const copyToClipboard = (e) => {
    e.preventDefault();
    const textArea = document.createElement("textarea");
    textArea.value = e.currentTarget.textContent.trim();
    document.body.appendChild(textArea);
    textArea.select();
    try {
      const successful = document.execCommand("copy");
      const msg = successful ? "successful" : "unsuccessful";
      console.log(`Copying text command was ${msg}`);
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
    }
    document.body.removeChild(textArea);

    alert("Address copied to clipboard!");
  };

  const showPrivateKey = () => {
    setShowPrivKey(true);
  };
  const handleLink = () => {
    navigate(-1);
  };

  useEffect(() => {
    setAddress(userr.address);
    setPrivatekey(userr.privKey);
  }, [address, privatekey]);
  return (
    <div className="maincontainer">
      <div>
        {" "}
        <img src={frame} alt="frame" className="frame" />
      </div>
      <div className="headerText">Fund Your Wallet </div>
      <div className="address" onClick={copyToClipboard}>
        {address}
        <img src={clipboard} alt="clip" />{" "}
      </div>


      {/* <div>
        From testnet Faucet

        <a href="https://www.bnbchain.org/en/testnet-faucet">
        https://www.bnbchain.org/en/testnet-faucet
        </a>
      </div> */}

      <div>
      <button onClick={() => window.open("https://www.bnbchain.org/en/testnet-faucet", "_blank")}
  style={{
    margin: "10px",
    background: "rgba(255, 255, 255, 0.1)", // Semi-transparent white background
    color: "white",
    border: "2px solid rgba(255, 255, 255, 0.5)", // Light white border
    borderRadius: "8px", // Rounded corners
    padding: "10px 20px", // Padding for a better button size
    cursor: "pointer", // Cursor indicates button is clickable
    transition: "all 0.3s ease" // Smooth transition for hover effects
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.background = "white"; // Change background to white on hover
    e.currentTarget.style.color = "black"; // Change text color to black on hover
    e.currentTarget.style.border = "2px solid transparent"; // Hide border on hover
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"; // Revert to initial background
    e.currentTarget.style.color = "white"; // Revert to initial text color
    e.currentTarget.style.border = "2px solid rgba(255, 255, 255, 0.5)"; // Revert to initial border
  }}
>
  Visit Testnet Faucet
</button>
      </div>

      <div className="qrbox">
        <QRCodeSVG value={address} size={128} level={"H"} />
      </div>

      <div className="link" onClick={handleLink}>
        link Mobile number
      </div>
    </div>
  );
};

export default WalletAf;
