const express = require("express");
const db = require(__dirname + "/db_connect");
const router = express.Router();


const nodemailer = require("nodemailer"); // Mail模組
require("dotenv").config(); // 環境變數s設定

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

//寄更改密碼信
router.get("/sendcoupon", async (req, res) => {
  const output = {
    success: false,
    body: req.body.userEmail,
  };

//信件內容
const mailOptions = {
    from: "InSense Perfume <insenseofficial2020@gmail.com>", // sender address
    to: emailTo, // list of receivers
    subject: "InSense密碼更改", // Subject line
    text: "測試寄信內容", // plain text body
    html: `<h1 style="font-weight:300">${userFirstName}你好</h1><p style="font-size:18px">認證碼為：${verificationNum}</p><p style="font-size:18px">請點以下連結，並使用該認證碼進行密碼更改</p><a href="${passwordForgotlink}"><h3 style="font-weight:200">InSense密碼更改</h3></a>`,
  };

  //寄信
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
    } else if (info) {
      output.success = true;
    }
    res.json(output);
  });
  
});




router.get('/', async(req,res)=>{
console.log(123)
    const couponCode = `SELECT * FROM coupon`


    const [codeResponse] = await db.query(couponCode)

    
    res.json(codeResponse)
})

module.exports = router

