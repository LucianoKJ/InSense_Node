var express = require("express");
const db = require(__dirname + "/db_connect");
var router = express.Router();
const checkLogin = require(__dirname + "/../libraries/checkLogin"); // 檢查login 狀態


router.get('/', (req, res) => {
  console.log('1111')
})
router.post('/', (req, res) => {

  const sql = 'INSERT INTO `OrderTb` SET ?'
})

router.get('/orderdetail', async (req, res) => {

  const checkLogIn = await checkLogin(req);
  console.log(req.session)
  const output = {
    success: false,
    logInStatus: checkLogIn.logInStatus,
    userInfo: checkLogIn.userInfo ? checkLogIn.userInfo : null
  }
  if (output.logInStatus) {
    const sql = 'SELECT `OrderTb`.`orderId`,`OrderTb`.`orderStatus`,`OrderTb`.`itemInfo`,`users`.`userFirstName`,`users`.`userLastName`,`users`.`userPostCode`,`users`.`userCity`,`users`.`userDistrict`,`users`.`userAddress` FROM `OrderTb` INNER JOIN `users` ON `OrderTb`.`userId` = `users`.`userId`'

    const response = await db.query(sql)
    const data = { ...response[0][0], "itemInfo": JSON.parse(response[0][0].itemInfo) }
    output.success = true
    output.data = data
  }
  console.log(output)
  res.json(output)
})


module.exports = router