import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleButton from "react-google-button";
import { useUserAuth } from "../../context/UserAuthContext";
import { RecaptchaVerifier } from 'firebase/auth'
import { auth } from "../../context/firbase";
import "./login.css";
import { UAParser } from "ua-parser-js";

const Signup = () => {
  const port = process.env.PORT || "localhost:5000";
  const [username, setusername] = useState("");
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [error, seterror] = useState("");
  const [password, setpassword] = useState("");
  const [number, setNumber] = useState("")
  const { signUp, googleSignIn, phoneSignIn } = useUserAuth();
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

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

  const handlesubmit = async (e) => {
    e.preventDefault();
    seterror("");
    try {
      await signUp(email, password);
      const user = {
        username: username,
        name: name,
        email: email,
      };
      fetch(`http://${port}/register`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(user),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.acknowledged) {
            console.log(data);
            navigate("/");
          }
        });
    } catch (error) {
      seterror(error.message);
      window.alert(error.message);
    }
  };
  const hanglegooglesignin = async (e) => {
    e.preventDefault();
    try {
      const result = await googleSignIn();

      const parser = new UAParser();
      const uaResult = parser.getResult();

      const user = {
        email: result.email,
        location: {
          browser: uaResult.browser,
          os: uaResult.os,
          device: uaResult.device
        }
      }
      fetch(`http://${port}/register`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(user),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.acknowledged) {
            console.log(data);
            navigate("/");
          }
        });
    } catch (error) {
      console.log(error.message);
    }
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
      const user = {
        username: username,
        name: name,
        email: email,
        tel: number
      };
      fetch(`http://${port}/register`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(user),
      })
      window.alert("Phone number verified and user signed in!");
      navigate("/");
    } catch (error) {
      seterror(error.message);
      window.alert(error.message);
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="image-container">
          <img className="image" src={twitterimg} alt="twitterimage" />
        </div>

        <div className="form-container">
          <div className="form-box">
            <TwitterIcon className="Twittericon" style={{ color: "skyblue" }} />
            <h2 className="heading" style={{ margin: "20px" }}>Happening now</h2>
            <div class="d-flex align-items-sm-center">
              <h3 className="heading1" style={{ margin: "0px" }}> Join twiller today</h3>
            </div>
            {error && <p className="errorMessage">{error}</p>}
            <form onSubmit={handlesubmit}>
              <input
                className="display-name"
                type="username"
                placeholder="@username"
                onChange={(e) => setusername(e.target.value)}
              />
              <input
                className="display-name"
                type="name"
                placeholder="Enter Full Name"
                onChange={(e) => setname(e.target.value)}
              />
              <input
                className="email"
                type="email"
                placeholder="Email Address"
                onChange={(e) => setemail(e.target.value)}
              />
              <input
                className="password"
                type="password"
                placeholder="Password"
                onChange={(e) => setpassword(e.target.value)}
              />
              <div className="btn-login">
                <button type="submit" className="btn">
                  Sign Up
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
              <GoogleButton
                className="g-btn"
                type="light"
                onClick={hanglegooglesignin}
              />
            </div>
            <div>
              Already have an account?
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  color: "var(--twitter-color)",
                  fontWeight: "600",
                  marginLeft: "5px",
                }}
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
