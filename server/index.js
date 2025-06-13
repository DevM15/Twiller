const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const router = express.Router();
const cors = require("cors");
require('dotenv').config()
const uri =
  process.env.mongodburi;
const port = 5000;

const utcTime = new Date();

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri);

const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
app.use(bodyParser.json());

const otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'devmistry1501@gmail.com',       // ✅ Replace with your email
    pass: 'fvva qyec mtxv jnpj',     // ✅ Use Gmail App Password, NOT your login password
  },
});


function detectBrowser(userAgent) {
  if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) return 'Chrome';
  if (/Edg/i.test(userAgent)) return 'Edge';
  return 'Other';
}

function isMobileUserAgent(userAgent) {
  return /Mobi|Android|iPhone/i.test(userAgent);
}

function isWithinAllowedTime() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 10 && hour < 13;
}


async function run() {
  try {
    await client.connect();
    const postcollection = client.db("database").collection("posts");
    const usercollection = client.db("database").collection("users");
    app.post("/register", async (req, res) => {
      const user = req.body;
      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
      const loginData = {
        email: user.email,
        history: [
          {
            ip: ip,
            browser: user.location.browser.name,
            os: user.location.os.name,
            device: user.location.device.type || "Desktop",
            timestamp: new Date()
          }
        ]
      };
      const result = await usercollection.insertOne(loginData);
      res.send(result);
    });
    app.post('/login', async (req, res) => {
      const existingUser = await usercollection.findOne({ email: req.body.email });
      if (!existingUser) {
        return res.status(404).send({ error: 'Email not found' });
      }

      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;

      const loginData = {
        ip: ip,
        browser: req.body.location.browser.name,
        os: req.body.location.os.name,
        device: req.body.location.device.type || "Desktop",
        istTimeString: new Date(utcTime).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata"
        })
      };

      const filter = { email: req.body.email };
      const update = {
        $push: {
          history: loginData
        }
      };
      const options = { upsert: true };

      const result = await usercollection.updateOne(filter, update, options);
      res.send(result);
    });
    app.get("/loggedinuser", async (req, res) => {
      const email = req.query.email;
      const user = await usercollection.find({ email: email }).toArray();
      res.send(user);
    });
    app.post("/post", async (req, res) => {
      const post = req.body;
      const result = await postcollection.insertOne(post);
      res.send(result);
    });
    app.get("/post", async (req, res) => {
      const post = (await postcollection.find().toArray()).reverse();
      res.send(post);
    });
    app.get("/userpost", async (req, res) => {
      const email = req.query.email;
      const post = (
        await postcollection.find({ email: email }).toArray()
      ).reverse();
      res.send(post);
    });

    app.get("/user", async (req, res) => {
      const user = await usercollection.find().toArray();
      res.send(user);
    });

    app.patch("/userupdate/:email", async (req, res) => {
      const filter = req.params;
      const profile = req.body;
      const options = { upsert: true };
      const updateDoc = { $set: profile };
      // console.log(profile)
      const result = await usercollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.get("/history", async (req, res) => {
      const { email } = req.query;
      try {
        if (!email) {
          return res.status(400).send({ error: "Email is required" });
        }
        const result = await usercollection.findOne(
          { email },
          { projection: { history: 1, _id: 0 } } // include history, exclude _id
        );
        res.send(result);
      } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });


    app.post('/AuthforChrome', async (req, res) => {
      const { email, userAgent } = req.body;

      const browser = detectBrowser(userAgent);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[email] = otp;

      try {
        await transporter.sendMail({
          from: '"Secure Login" <your.email@gmail.com>',
          to: email,
          subject: 'Your OTP Code',
          text: `Your OTP is: ${otp}`,
          html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
        });

        return res.json({ message: 'OTP sent to email', requireOTP: true });
      } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ message: 'Failed to send OTP' });
      }
      console.log(`Sending OTP to ${email}: ${otp}`); // Replace with actual email send
      return res.json({ message: 'OTP sent to email', requireOTP: true });

    });

    app.post('/verify-otp', (req, res) => {
      const { email, otp } = req.body;
      if (otpStore[email] === otp) {
        delete otpStore[email];
        return res.json({ message: 'Login successful via OTP' });
      }
      return res.status(401).json({ message: 'Invalid OTP' });
    });


  } catch (error) {
    console.log(error);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Twiller is working");
});

app.listen(port, () => {
  console.log(`Twiller clone is workingon ${port}`);
});