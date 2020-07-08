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
router.post("/passwordforgot", async (req, res) => {
  const output = {
    success: false,
    body: req.body.userEmail,
  };

  //先取得該帳號資訊
  const sqlCheckEmail =
    "SELECT `userId`, `userEmail`, `userPassword`, `userFirstName` FROM `Users` WHERE `userAccount` = ? ";
  const [responseCehckEmail] = await db.query(sqlCheckEmail, [
    req.body.userEmail,
  ]);

  console.log(responseCehckEmail[0]);

  if (responseCehckEmail.length === 1) {
    const userId = responseCehckEmail[0].userId;
    const userEmail = responseCehckEmail[0].userEmail;
    const userPasswordEncoded = responseCehckEmail[0].userPassword;
    const userFirstName = responseCehckEmail[0].userFirstName;
    //收件人
    const emailTo = userEmail;
    //製作認證碼
    const verificationNum = userPasswordEncoded.slice(
      userPasswordEncoded.length - 8,
      userPasswordEncoded.length + 1
    );
    //更改密碼連結
    const passwordForgotlink = `http://localhost:3000/account/passwordForgotchange/${userId}`;

    // console.log(emailTo, verificationNum);

    //信件內容
    const mailOptions = {
      from: "InSense Perfume <insenseofficial2020@gmail.com>", // sender address
      to: emailTo, // list of receivers
      subject: "InSense密碼更改", // Subject line
      text: "測試寄信內容", // plain text body
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
                ${userFirstName} 您好
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
                認證碼為：
                <span style="font-weight: 400;">
                    ${verificationNum}
                </span>
            </p>
            <p
                style="
                    font-size: 12px;
                    color: #aaa;
                    text-align: center;
                    line-height: 28px;
                    letter-spacing: 1px;
                    margin-top: 0;
                "
            >
                (請點以下連結，並使用該認證碼進行密碼更改)
            </p>
            <a
                href="${passwordForgotlink}"
                target="_blank"
                style="
                    text-decoration: none;
                    border: 1px solid #ec844c;
                    display: block;
                    width: 300px;
                    margin: 42px auto 18px;
                "
                onmouseover="this.style.background='#ec844c'; this.firstChild.style.color='white'"
                onmouseout="this.style.background='transparent'; this.firstChild.style.color='#ec844c'"
                ><h3
                    style="
                        margin: 0;
                        font-weight: 400;
                        font-size: 16px;
                        color: #ec844c;
                        text-decoration: solid #ec844c 1px;
                        text-align: center;
                        letter-spacing: 1px;
                        line-height: 40px;
                    "
                >
                    InSense密碼更改
                </h3></a
            >
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
  } else {
    output.message = "NO_USER_FOUND";
    res.json(output);
  }
});

//更改密碼
router.patch("/passwordforgotchange", async (req, res) => {
  const output = {
    success: false,
    // body: req.body,
  };

  //先取得該帳號資訊
  const sqlCheckEmail =
    "SELECT `userId`, `userPassword` FROM `Users` WHERE `userId` = ? ";
  const [responseCehckEmail] = await db.query(sqlCheckEmail, [req.body.userId]);
  // console.log(responseCehckEmail);

  if (responseCehckEmail.length === 1) {
    const userId = responseCehckEmail[0].userId;
    const userPasswordEncoded = responseCehckEmail[0].userPassword;

    //檢查認證碼
    const verificationCheck = userPasswordEncoded.slice(
      userPasswordEncoded.length - 8,
      userPasswordEncoded.length + 1
    );

    if (verificationCheck !== req.body.verification) {
      output.message = "VERIFICATION_INCORRECT";
    } else {
      const sqlChangePassword =
        "UPDATE `Users` SET `userPassword`= ? WHERE `userId` = ?";
      const [responseChangePassword] = await db.query(sqlChangePassword, [
        req.body.newPassword,
        userId,
      ]);
      // console.log(responseChangePassword);

      if (responseChangePassword.affectedRows) {
        output.success = true;
      } else {
        output.message = "UPDATE_ERROR";
      }
    }
  } else {
    output.message = "NO_USER_FOUND";
  }

  res.json(output);
});

module.exports = router;
