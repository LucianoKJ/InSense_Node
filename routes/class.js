var express = require("express");
const db = require(__dirname + "/db_connect");
var moment = require('moment');
var router = express.Router();

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
module.exports = router