var express = require("express");
const db = require(__dirname + "/db_connect");
var router = express.Router();

//引入libraries中的函式
var makeFormatedId = require(__dirname + "/../libraries/makeFormatedId"); // 製作格式化的ID

//註冊會員
router.post("/registration", async (req, res) => {
  // console.log(req.body)

  //新增會員
  const sqlAddUser =
    "INSERT INTO `Users` (`userAccount`, `userPassword`, `userFirstName`, `userLastName`, `userEmail`, `userGender`, `userCity`, `userDistrict`, `userAddress`, `userPostCode`, `userBirthday`) VALUES (?, ? ,?, ?, ?, ? , ?, ?, ?, ?, ?)";
    
  const responseAddUser = await db.query(sqlAddUser, [
    req.body.email,
    req.body.password,
    req.body.firstName,
    req.body.lastName,
    req.body.email,
    req.body.gender,
    req.body.cities,
    req.body.districts,
    req.body.address,
    req.body.postCode,
    req.body.birthday,
  ]);

  const sqlAddUserId = "UPDATE `Users` SET `userId`= ? WHERE `id` = ?";

  //取得剛剛插入的id
  const insertId = responseAddUser[0].insertId.toString();
  // console.log(insertId);

  //插入userId
  const responseAddUserId = await db.query(sqlAddUserId, [
    makeFormatedId(5, "U", insertId),
    insertId,
  ]);

  //回傳值
  res.json([responseAddUser, responseAddUserId]);
});

//登入login
router.post("/login", async (req, res) => {
  // console.log("req.body", req.body);
  const output = {
    success: false,
    logInStatus: false,
    body: req.body,
  };

  const sqlLogIn =
    "SELECT * FROM Users WHERE `userAccount` = ? AND `userPassword` = ?";

  const responseLogIn = await db.query(sqlLogIn, [
    req.body.userEmail,
    req.body.userPassword,
  ]);

  if (responseLogIn[0].length > 0) {
    output.success = true;
    output.userInfo = responseLogIn[0][0];
    output.logInStatus = true;

    //紀錄帳密在Session
    req.session.userEmail = req.body.userEmail;
    req.session.userPassword = req.body.userPassword;
  } else {
    output.errorMessage = "No_User_Found";
  }

  res.json(output);
});

//登出logout
router.post("/logout", async (req, res) => {
  // console.log("req.body", req.body);
  delete req.session.userEmail;
  delete req.session.userPassword;

  const output = {
    success: true,
    logOutStatus: req.session ? false : true,
  };

  res.json(output);
});

//檢查有無登入
router.post("/checklogin", async (req, res) => {
  const output = {
    logInStatus: false,
  };

  if (req.session.userEmail && req.session.userPassword) {
    const sqlLogIn =
      "SELECT * FROM Users WHERE `userAccount` = ? AND `userPassword` = ?";

    const responseLogIn = await db.query(sqlLogIn, [
      req.session.userEmail,
      req.session.userPassword,
    ]);

    if (responseLogIn[0].length > 0) {
      output.userInfo = responseLogIn[0][0];
      output.logInStatus = true;
    }
  }

  res.json(output);
});

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("this is user page");
});

module.exports = router;
