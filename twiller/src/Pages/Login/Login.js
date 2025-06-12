import React, { useEffect, useState } from "react";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleButton from "react-google-button";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { useUserAuth } from "../../context/UserAuthContext";
import { auth } from "../../context/firbase";
import { RecaptchaVerifier } from 'firebase/auth'

const Login = () => {
  const [email, seteamil] = useState("");
  const [password, setpassword] = useState("");
  const [error, seterror] = useState("");
  const [number, setNumber] = useState("")
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();
  const { googleSignIn, logIn, phoneSignIn } = useUserAuth();
  const handlesubmit = async (e) => {
    e.preventDefault();
    seterror("");
    try {
      await logIn(email, password)
      navigate("/");
    } catch (error) {
      seterror(error.message);
      window.alert(error.message);
    }
  };
  const hanglegooglesignin = async (e) => {
    e.preventDefault();
    try {
      await googleSignIn();
      fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        }
      });
    }
    return window.recaptchaVerifier;
  };
  const handletel = async (e) => {
    e.preventDefault();
    seterror("");
    try {
      const appVerifier = setupRecaptcha();
      const result = await phoneSignIn(number, appVerifier);
      setConfirmationResult(result);
      window.alert("OTP sent!");
    } catch (error) {
      seterror(error.message);
      window.alert(error.message);
    }
  };
  const onSubmitOTP = async (e) => {
    e.preventDefault();
    seterror("");
    try {
      if (!window.confirmationResult) {
        seterror("No confirmation result. Please request OTP again.");
        return;
      }
      await window.confirmationResult.confirm(otp);
      window.alert("Phone number verified and user signed in!");
      navigate("/");
    } catch (error) {
      seterror(error.message);
      window.alert(error.message);
    }
  };

  const UAParser = require('ua-parser-js');

  // Example user-agent string
  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

  // Initialize parser
  const parser = new UAParser(userAgent);

  // Parse the user-agent
  const result = parser.getResult();

  console.log("Browser Name:", result.browser.name);
  console.log("Operating System:", result.os.name); // Windows
  console.log("Device Type:", result.device.type || "Desktop"); // Desktop

  // Example output:
  // {
  //   ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  //   browser: { name: "Chrome", version: "91.0.4472.124" },
  //   engine: { name: "WebKit", version: "537.36" },
  //   os: { name: "Windows", version: "10" },
  //   device: { vendor: undefined, model: undefined, type: undefined },
  //   cpu: { architecture: "amd64" }
  // }

  return (
    <>
      <div className="login-container">
        <div className="image-container">
          <img src={twitterimg} className=" image" alt="twitterimg" />
        </div>
        <div className="form-container">
          <div className="form-box">
            <TwitterIcon style={{ color: "skyblue" }} />
            <h2 className="heading" >Happening now</h2>
            {error && <p>{error.message}</p>}
            <form onSubmit={handlesubmit}>
              <input
                type="email"
                className="email"
                placeholder="Email address"
                onChange={(e) => seteamil(e.target.value)}
              />
              <input
                type="password"
                className="password"
                placeholder="Password"
                onChange={(e) => setpassword(e.target.value)}
              />
              <div className="btn-login">
                <button type="submit" className="btn">
                  Log In
                </button>
              </div>
            </form>
            <hr />
            <form onSubmit={handletel}>
              <input type="tel"
                className="number"
                placeholder="number"
                onChange={(e) => setNumber(e.target.value)} />
              <button type="submit" className="tel-btn">
                Send
              </button>
            </form>
            <div id="recaptcha-container"></div> {/* Add this for reCAPTCHA */}
            <h2>Enter OTP</h2>
            <form onSubmit={onSubmitOTP}>
              <input className='form-control mb-3' type="number" name="otp" placeholder="OTP Number" required onChange={(e) => setOtp(e.target.value)} />
              <button className='btn btn-primary' type="submit">Submit</button>
            </form>
            <hr />
            <div className="google-button">
              <GoogleButton className="g-btn" type="light" onClick={hanglegooglesignin} />
            </div>
          </div>
          <div>
            Don't have an account
            <Link
              to="/signup"
              style={{
                textDecoration: "none",
                color: "var(--twitter-color)",
                fontWeight: "600",
                marginLeft: "5px",
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
