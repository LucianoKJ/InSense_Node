const db = require(__dirname + "/db_connect");
// //404頁面
// const HttpError = require("../models/http-error");
const express = require("express");
const router = express.Router();
const moment = require("moment");

const makeFormatedId = require(__dirname + "/../libraries/makeFormatedId"); // 製作格式化的ID

//history order required
const GetApi = async (req) => {
  const perPage = 5;
  let page = parseInt(req.params.page) || 1;
  const output = {
    // page: page,
    perPage: perPage,
    totalRows: 0, // 總共有幾筆資料
    totalPages: 0, //總共有幾頁
    rows: [],
  };
  const [r1] = await db.query("SELECT COUNT(1) num FROM orders");
  output.totalRows = r1[0].num;
  output.totalPages = Math.ceil(output.totalRows / perPage);
  if (page < 1) page = 1;
  if (page > output.totalPages) page = output.totalPages;
  if (output.totalPages === 0) page = 0;
  output.page = page;

  if (!output.page) {
    return output;
  }
  const sql =
    "SELECT * FROM orderitemlist INNER JOIN orders WHERE `orders`.`created_at` = `orderitemlist`.`create_time`";

  const [r2] = await db.query(sql);
  if (r2) output.rows = r2;
  for (let i of r2) {
    // console.log(i.created_at)
    i.created_at = moment(i.created_at).format("YYYY-MM-DD");
  }
  return output;
};

//test route
router.get("/test", async (req, res) => {
  console.log(req.body);
  const output = {
    success: false,
  };
  const sql = "SELECT * FROM `OrderTb`";
  db.query(sql).then(([r]) => {
    output.results = r;
    if (r.affectedRows && r.insertId) {
      output.success = true;
    }
    res.json(output);
  });
});

router.post("/orderList", async (req, res) => {

  const output = {
    success: false,
    orderId: ''
  }
  //新增訂單
  const orderDetaildata = {
    userId: req.body.paymentdata.userId,
    orderStatus: '處理中'
  }

  const orderSQL = 'INSERT INTO `OrderTb` SET ?'
  const [orderDetail] = await db.query(orderSQL, [orderDetaildata])

  //增加orderId
  if (orderDetail.affectedRows > 0) {
    const sqlOrderId = "UPDATE `OrderTb` SET `orderId` = ? WHERE id = ? "
    const insertOrderId = orderDetail.insertId.toString()
    //取得orderId
    output.orderId = makeFormatedId(6, "O_", insertOrderId)
    await db.query(sqlOrderId, [output.orderId, insertOrderId])
  }

  for (let i of req.body.selectCartItems) {
    i.Total = req.body.selectCartTotal;
  }
  // console.log(req.body.selectCartItems)
  // console.log(Items)
  // const orderId = req.session.orderId;
  const creditcardSQL = "INSERT INTO creditcards SET ?";
  const [creditcarddata] = await db.query(creditcardSQL, [
    req.body.paymentdata,
  ]);

  //增加寄送資訊  
  const orderDeliverySQL = "INSERT INTO ordercheckoutpage SET ?";
  const orderDeliveryData = req.body.orderDelivery.data
  orderDeliveryData.orderId = output.orderId
  const [orderDelivery] = await db.query(orderDeliverySQL, [
    orderDeliveryData,
  ]);

  //增加購買的商品列表
  const orderItemSQL = "INSERT INTO orderitemlist SET ?";
  const [orderItems] = await req.body.selectCartItems.forEach((el) => {
    el.orderId = output.orderId
    db.query(orderItemSQL, [el]);
  });

  // 組長寫的
  // data[0].forEach((element) => {
  //   element.classTime = moment(element.classTime).format("YYYY/MM/DD");
  // });
  // res.json(data);
});



module.exports = router;
