const express = require("express");
const db = require(__dirname + "/db_connect");
const router = express.Router();

//商品分類
router.get("/brand/:brand?", async (req, res) => {
  //   res.json(req.params.brand)
  const sql =
    "SELECT `Items`.`itemId`, `Items`.`itemName`, `Items`.`brandId`,`Brand`.`brandName` FROM `Items` INNER JOIN `Brand` ON `Items`.`brandId` = `Brand`.`brandId` WHERE `Brand`.`brandName`= ?";

  const response = await db.query(sql, [req.params.brand]);
  res.json(response[0]);
});

router.get("/", (req, res) => {
  res.json("this is itemslist");
});

module.exports = router;
