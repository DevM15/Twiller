import { useState } from "react";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import GoogleButton from "react-google-button";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { useUserAuth } from "../../context/UserAuthContext";
import { auth } from "../../context/firbase";
import { RecaptchaVerifier } from 'firebase/auth'
import { UAParser } from "ua-parser-js";
const Login = () => {

  const [email, seteamil] = useState("");
  const [password, setpassword] = useState("");
  const [error, seterror] = useState("");
  const [number, setNumber] = useState("")
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const port = process.env.PORT || "localhost:5000";

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
      const user = await googleSignIn();

      const parser = new UAParser();
      const uaResult = parser.getResult();

      if (uaResult.browser.name === "Chrome") {
        const email = user.email
        await fetch(`http://${port}/AuthforChrome`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email
          }),
        });
        navigate("/Authforchrome", { state: { email } })
      }
      else {
        const response = await fetch(`http://${port}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: user.email,
            location: {
              browser: uaResult.browser,
              os: uaResult.os,
              device: uaResult.device
            }
          })
        });
        const data = await response.json();
        if (data && !data.error) {
          navigate("/");
        } else {
          seterror(data.error || "Google login failed.");
          window.alert(data.error || "Google login failed.");
        }
      }
    } catch (error) {
      seterror(error.message);
      window.alert(error.message);
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
