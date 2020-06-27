const db = require(__dirname + "/db_connect");
// //404頁面
// const HttpError = require("../models/http-error");
const express = require("express");
const router = express.Router();
const moment = require("moment");

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
    "SELECT * FROM `orderitemlist` INNER JOIN `orders` WHERE `orders`.`created_at` = `orderitemlist`.`create_time`";

  const [r2] = await db.query(sql);
  if (r2) output.rows = r2;
  for (let i of r2) {
    // console.log(i.created_at)
    i.created_at = moment(i.created_at).format("YYYY-MM-DD");
  }
  return output;
};

//test route
router.get("/api/test", async (req, res) => {
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

router.post("/api/orderList", async (req, res) => {
  const orderId = req.session.orderId;
  const sql = "INSERT INTO `OrderTb` set ?";
  const [data] = await db.query(sql, [req.body]);
  // data[0].forEach((element) => {
  //   element.classTime = moment(element.classTime).format("YYYY/MM/DD");
  // });
  res.json(data);
});

module.exports = router;
