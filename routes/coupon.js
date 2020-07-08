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
router.post("/sendcoupon", async (req, res) => {
  const output = {
    success: false,
    body: req.body.userEmail,
  };
  console.log(req.body.userEmail);

  //信件內容
  const mailOptions = {
    from: "InSense Perfume <insenseofficial2020@gmail.com>", // sender address
    to: output.body,
    subject: " 新客優惠券 ", // Subject line
    text: " 新客優惠券發放 ", // plain text body

    html: `<div
            style="
                border: solid 2px rgba(99, 129, 168, 0.8);
                width: 600px;
                display: block;
                margin: auto;
                box-shadow: 2px 6px 10px #ddd;
            "
        >
            <figure style="">
                <img
                    src="https://i.ibb.co/Y81VNXY/In-Sense-logo.png"
                    alt="In-Sense-logo"
                    style="
                        width: 200px;
                        height: 200px;
                        display: block;
                        margin: auto;
                    "
                    border="0"
                />
            </figure>
            <h2
                style="
                    font-weight: 300;
                    text-align: center;
                    line-height: 40px;
                    letter-spacing: 1px;
                    font-size: 32px;
                "
            >
                新客 您好
                <!-- 瑞瑜 您好 -->
            </h2>
            <p
                style="
                    font-weight: 300;
                    font-size: 18px;
                    color: #555555;
                    text-align: center;
                    line-height: 28px;
                    letter-spacing: 1px;
                    margin: 0;
                "
            >
                您的優惠碼為：
                <span style="font-weight: 400;">
                    JOINSENSE
                </span>
            </p>
            <p
                style="
                    font-weight: 300;
                    font-size: 12px;
                    color: white;
                    text-align: center;
                    line-height: 48px;
                    letter-spacing: 1px;
                    margin: 72px 0 0;
                    background-color: rgba(99, 129, 168, 0.8);
                "
            >
                InSense Perfume — Copyright © 2000-2020
            </p>
        </div>`,

  
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

router.get("/", async (req, res) => {
  console.log(123);
  const couponCode = `SELECT * FROM coupon`;

  const [codeResponse] = await db.query(couponCode);

  res.json(codeResponse);
});

module.exports = router;
