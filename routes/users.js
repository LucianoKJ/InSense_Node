var express = require("express");
const db = require(__dirname + "/db_connect");
var router = express.Router();


//引入libraries中的函式
var makeFormatedId = require(__dirname + "/../libraries/makeFormatedId"); // 製作格式化的ID


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
    req.body.birthday
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

  res.json([responseAddUser, responseAddUserId]);
});

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("this is user page");
});

module.exports = router;
