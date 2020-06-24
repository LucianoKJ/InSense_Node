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
  // console.log(req)
  const output = await checkLogin(req);
  if (output.logInStatus) {
    const data = {
      bookQty: req.body.bookQty,
      bookTime: req.body.bookTime,
      // userId: output.Session.userId,
      classId: req.body.classId,
      bookStatus: '成功',
      bookTotalPrice: req.body.bookTotalPrice
    }
    console.log(data)
    const sql = 'INSERT INTO `Book` SET ?'
    const response = await db.query(sql, [data])
    console.log(response[0])

    res.json(response[0])
  }

})
module.exports = router