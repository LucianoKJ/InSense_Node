const express = require("express");
const db = require(__dirname + "/db_connect");
const router = express.Router();

//商品分類
router.get("/brand/:brand?", async (req, res) => {
    //   res.json(req.params.brand)

    console.log(req.params.brand);

    //取得品牌資訊
    const getBrand =
        "SELECT `Brand`.`brandId`, `Brand`.`brandName`, `Brand`.`brandbanner`,`Brand`.`brandDiscription`,`Brand`.`brandCode` FROM `Brand` WHERE `Brand`.`brandCode`= ? ";

    const brandResponse = await db.query(getBrand, [req.params.brand]);

    //依據品牌，選定商品
    const getItems =
        "SELECT `Items`.`itemId`, `Items`.`itemName`, `Items`.`itemimg`,`Items`.`itemPrice`,`Brand`.`brandName` FROM `Items` INNER JOIN `Brand` ON `Items`.`brandId` = `Brand`.`brandId` WHERE `Brand`.`brandCode`= ?";

    const itemsResponse = await db.query(getItems, [req.params.brand]);
    res.json([brandResponse[0], itemsResponse[0]]);
});

router.get("/", (req, res) => {
    res.json("this is itemslist");
});

module.exports = router;
