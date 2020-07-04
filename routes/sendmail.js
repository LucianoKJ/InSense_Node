const express = require("express");
// const db = require(__dirname + "/db_connect");
const router = express.Router();
// const checkLogin = require(__dirname + "/../libraries/checkLogin"); // 檢查login 狀態

const nodemailer = require("nodemailer"); // Mail模組
require("dotenv").config(); // 環境變數s設定

const sha256 = require('js-sha256');


//信箱權限
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.ACCOUNT,
    clientId: process.env.CLINENTID,
    clientSecret: process.env.CLINENTSECRET,
    refreshToken: process.env.REFRESHTOKEN,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

//寄信
router.get("/", (req, res) => {
  const output = {
    success: false,
    body: req.body.userEmail,
  };

  //信件內容
  const mailOptions = {
    from: "InSense Perfume <insenseofficial2020@gmail.com>", // sender address
    to: "<lucianokuanjung@gmail.com>", // list of receivers
    subject: "InSense密碼更改", // Subject line
    text: "測試寄信內容", // plain text body
    html:
      '<h1 style="font-weight:300">InSense密碼更改</h1><p style="font-size:18px">認證碼為：0000</p><p style="font-size:18px">請點以下連結，並使用認證碼進行密碼更改</p><a href="www.google.com"><h3 style="font-weight:200">InSense密碼更改</h3></a>',
  };

  //寄信
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      output.error = error;
      console.log(error);
    } else if (info) {
      console.log(info);
      output.info = info;
      output.success = true;
    }
    // console.log(output);
    res.json(output);
  });
});

// console.log(sha256.array("13213231231232313131331fdaffqf"))

module.exports = router;
