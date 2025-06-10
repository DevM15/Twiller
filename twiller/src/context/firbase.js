
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.firebaseapikey,
  authDomain: "twitter-5a751.firebaseapp.com",
  projectId: "twitter-5a751",
  storageBucket: "twitter-5a751.firebasestorage.app",
  messagingSenderId: "1042209663398",
  appId: "1:1042209663398:web:f0302888a8d03a7434c767",
  measurementId: "G-MVCJJ02XYK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export default app
// const analytics = getAnalytics(app);
