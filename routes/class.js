var express = require("express");
const db = require(__dirname + "/db_connect");
var moment = require("moment");
const e = require("express");
var router = express.Router();

const makeFormatedId = require(__dirname + "/../libraries/makeFormatedId"); // 製作格式化的ID
const checkLogin = require(__dirname + "/../libraries/checkLogin"); // 檢查login 狀態

// class list query
router.get("/", async (req, res) => {
  const checkLogIn = await checkLogin(req);
  const output = {
    success: false,
    logInStatus: checkLogIn.logInStatus,
  };
  const date = new Date()
  const sql =
    "SELECT `class`.`classPeopleLimit`,`class`.`classId`,`class`.`className`,`class`.`classImg`,`class`.`classTime` from `Class` WHERE `class`.`classTime` > ?";
  const bookSql =
    "SELECT `Book`.`bookQty`,`Book`.`classId`,`Book`.`bookStatus`,`Book`.`userId` from `Book`";
  const response = await db.query(sql, [date]);
  const bookSqlRes = await db.query(bookSql);

  response[0].forEach((element) => {
    element.classTime = moment(element.classTime).format("YYYY/MM/DD");
  });
  // ====================================================================================================== //
  // 確定課程剩餘人數
  response[0].forEach((resp) => {
    resp.remainingPeople = +res.classPeopleLimit;
    resp.countPeople = 0;
    bookSqlRes[0].forEach((book) => {
      if (book.bookStatus === "預約成功") {
        if (resp.classId === book.classId) {
          resp.countPeople += +book.bookQty;
        }
      }
      resp.remainingPeople = +resp.classPeopleLimit - resp.countPeople;
    });
  });
  // ====================================================================================================== //

  // 找到book userId 與 session userId 相等
  const booked = bookSqlRes[0].filter((i) => i.userId === req.session.userId);

  // 若登入,output.logInStatus則改變
  if (checkLogIn.logInStatus) {
    output.logInStatus = checkLogIn.logInStatus;
  }

  // 若得到課程,則把課程資訊及訂單資訊加到output
  if (response[0].length > 0) {
    output.classInfo = response[0];
    output.bookInfo = booked;
    output.success = true;
  }
  console.log(output);
  res.json(output);
});

// class detail query
router.get("/classdetail/:classid", async (req, res) => {
  const sql =
    "SELECT `ClassDescription`.`classId`,`ClassDescription`.`classContent`,`ClassDescription`.`classContent1`,`ClassDescription`.`classContent2`,`ClassDescription`.`classContent3`, `ClassDescription`.`classContent4`, `Class`.`className`,`Class`.`classImg`, `Class`.`classPrice`, `Class`.`classTime`, `Shop`.`shopName`, `Shop`.`shopAddress`, `Shop`.`shopPhone`FROM`ClassDescription` INNER JOIN`Class`ON`ClassDescription`.`classId` = `Class`.`classId` INNER JOIN`Shop` ON`ClassDescription`.`shopId` = `Shop`.`shopId` WHERE`ClassDescription`.`classId` = ? ";

  const response = await db.query(sql, [req.params.classid]);
  response[0].forEach((element) => {
    element.classTime = moment(element.classTime).format("YYYY/MM/DD");
  });
  res.json(response[0]);
});
// class detail popup
router.post("/classdetail/:classid", async (req, res) => {
  const checkLogIn = await checkLogin(req);
  const output = {
    success: false,
    logInStatus: checkLogIn.logInStatus,
    userInfo: checkLogIn.userInfo ? checkLogIn.userInfo : null,
  };

  // 判斷登入狀態
  if (output.logInStatus) {
    const data = {
      bookQty: req.body.bookQty,
      bookTime: req.body.bookTime,
      userId: req.session.userId,
      classId: req.body.classId,
      bookStatus: "預約成功",
      bookTotalPrice: req.body.bookTotalPrice,
    };
    // ================================== //
    // 情況1:課程人數已滿
    if (data.bookQty && data.bookTime) {
      let nowPeople = 0;
      // 取課程最大人數
      const limitPeople =
        "SELECT `Class`.`classPeopleLimit` FROM Class WHERE `Class`.`classId` = ?";
      // 取得預約人數
      const bookPeople =
        "SELECT `Book`.`bookQty`,`Book`.`bookStatus` FROM Book WHERE `Book`.`classId` = ?";
      const resLimitPeople = await db.query(limitPeople, [data.classId]);
      const resBookPeople = await db.query(bookPeople, [data.classId]);
      // 預約人數加總
      resBookPeople[0].forEach((item) => {
        if (item.bookStatus === "預約成功") nowPeople += +item.bookQty;
      });
      // 如果人數大於課程最大人數,output新增error屬性
      if (+data.bookQty + nowPeople > resLimitPeople[0][0].classPeopleLimit) {
        output.error = "人數超過上限";
      }
    }
    // ================================== //

    // 情況2:沒選時間
    if (!data.bookTime) output.error = "請選擇時間";
    // ================================== //
    //  情況3:沒選人數
    if (!data.bookQty) output.error = "請選擇人數";
    // ================================== //

    // 如果error不存在 則增加book
    if (!output.error) {
      // 增加book Id
      const sql = "INSERT INTO Book SET ?";
      const response = await db.query(sql, [data]);
      if (response[0].affectedRows > 0) {
        const sqlBookId = "UPDATE Book SET `bookId`= ? WHERE id = ?";
        const insertId = response[0].insertId.toString();
        await db.query(sqlBookId, [
          makeFormatedId(6, "B_", insertId),
          insertId,
        ]);
        output.success = true;
      }
    }
  }
  res.json(output);
});
module.exports = router;
