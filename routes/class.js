var express = require("express");
const db = require(__dirname + "/db_connect");
var moment = require('moment');
var router = express.Router();

const makeFormatedId = require(__dirname + "/../libraries/makeFormatedId"); // 製作格式化的ID
const checkLogin = require(__dirname + "/../libraries/checkLogin"); // 檢查login 狀態


// class list query
router.get('/', async (req, res) => {
  const sql = 'SELECT `class`.`classId`,`class`.`className`,`class`.`classImg`,`class`.`classTime` from `Class`'
  // const response = await db.query(sql, [req.params.brand]);
  const response = await db.query(sql)
  response[0].forEach(element => {
    element.classTime = moment(element.classTime).format('YYYY/MM/DD')
  });
  res.json(response[0])
})

// class detail query
router.get('/classdetail/:classid', async (req, res) => {
  const sql = 'SELECT `ClassDescription`.`classId`,`ClassDescription`.`classContent`,`ClassDescription`.`classContent1`,`ClassDescription`.`classContent2`,`ClassDescription`.`classContent3`, `ClassDescription`.`classContent4`, `Class`.`className`,`Class`.`classImg`, `Class`.`classPrice`, `Class`.`classTime`, `Shop`.`shopName`, `Shop`.`shopAddress`, `Shop`.`shopPhone`FROM`ClassDescription` INNER JOIN`Class`ON`ClassDescription`.`classId` = `Class`.`classId` INNER JOIN`Shop` ON`ClassDescription`.`shopId` = `Shop`.`shopId` WHERE`ClassDescription`.`classId` = ? '

  const response = await db.query(sql, [req.params.classid])
  response[0].forEach(element => {
    element.classTime = moment(element.classTime).format('YYYY/MM/DD')
  });
  res.json(response[0])
})
// class detail popup
router.post('/classdetail/:classid', async (req, res) => {
  const checkLogIn = await checkLogin(req);
  const output = {
    success: false,
    logInStatus: checkLogIn.logInStatus,
    userInfo: checkLogIn.userInfo ? checkLogIn.userInfo : null
  }

  // 判斷登入狀態
  if (output.logInStatus) {
    const data = {
      bookQty: req.body.bookQty,
      bookTime: req.body.bookTime,
      userId: req.session.userId,
      classId: req.body.classId,
      bookStatus: '成功',
      bookTotalPrice: req.body.bookTotalPrice
    }
    // ================================== //
    // 情況1:課程人數已滿
    if (data.bookQty && data.bookTime) {
      let nowPeople = 0
      // 取課程最大人數
      const limitPeople = 'SELECT `Class`.`classPeopleLimit` FROM `Class` WHERE `Class`.`classId` = ?'
      // 取得預約人數
      const bookPeople = 'SELECT `Book`.`bookQty` FROM `Book` WHERE `Book`.`classId` = ?'
      const resLimitPeople = await db.query(limitPeople, [data.classId])
      const resBookPeople = await db.query(bookPeople, [data.classId])
      // 預約人數加總
      resBookPeople[0].forEach(item => nowPeople += +item.bookQty)
      // 如果人數大於課程最大人數,output新增error屬性 
      if ((+data.bookQty + nowPeople) > resLimitPeople[0][0].classPeopleLimit) {
        output.error = '人數超過上限'
      }
    }

    // ================================== //

    // 情況2:沒選時間
    if (!data.bookTime) output.error = '請選擇時間'
    // ================================== //
    // 情況3:沒選人數
    if (!data.bookQty) output.error = '請選擇人數'
    // ================================== //



    // 如果error存在 回傳output給前端
    if (output.error) {
      res.json(output)
    }
    else {
      // 增加book Id 
      const sql = 'INSERT INTO `Book` SET ?'
      const response = await db.query(sql, [data])
      if (response[0].affectedRows > 0) {
        const sqlBookId = "UPDATE `Book` SET `bookId`= ? WHERE `id` = ?";
        const insertId = response[0].insertId.toString()
        await db.query(sqlBookId, [
          makeFormatedId(6, 'B_', insertId), insertId
        ])
        output.success = true
        res.json(output)
      }
    }
  }
  res.json(output)
})
module.exports = router