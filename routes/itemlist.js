const express = require("express");
const db = require(__dirname + "/db_connect");
const router = express.Router();

//商品分類
//依品牌
router.get("/brand/:brand?", async (req, res) => {
    //   res.json(req.params.brand)

    console.log(req.params.brand);

    //取得品牌資訊
    const getBrand =
        "SELECT `Brand`.`brandId`, `Brand`.`brandName`, `Brand`.`brandBanner`,`Brand`.`brandDiscription`,`Brand`.`brandCode` FROM `Brand` WHERE `Brand`.`brandCode`= ? ";

    const brandResponse = await db.query(getBrand, [req.params.brand]);

    //依據品牌，選定商品
    const getItems =
        "SELECT `Items`.`itemId`, `Items`.`itemName`, `Items`.`itemImg`,`Items`.`itemPrice`,`Brand`.`brandName` FROM `Items` INNER JOIN `Brand` ON `Items`.`brandId` = `Brand`.`brandId` WHERE `Brand`.`brandCode`= ?";

    const itemsResponse = await db.query(getItems, [req.params.brand]);
    res.json([brandResponse[0], itemsResponse[0]]);
});

//依分類
router.get("/category/:category?", async (req, res) => {
    //   res.json(req.params.brand)

    // console.log(req.params.brand);

    //取得分類資訊
    const getCategory =
        "SELECT `IC`.`itemCategoryId`,`IC`.`itemCategoryName`, `IC`.`itemCategoryBanner` FROM `itemCategories` AS `IC` WHERE `IC`.`itemCategoryCode`=  ? ";

    const categoryResponse = await db.query(getCategory, [req.params.category]);

    //依據分類，選定商品
    const getItems =
        "SELECT `Items`.`itemId`, `Items`.`itemName`, `Items`.`itemImg`,`Items`.`itemPrice`, `Items`.`itemQty`, `ItemCategories`.`itemCategoryName` FROM `Items` INNER JOIN `ItemCategories` ON `Items`.`itemCategoryId` = `ItemCategories`.`itemCategoryId` WHERE `ItemCategories`.`itemCategoryCode`= ? ";

    const itemsResponse = await db.query(getItems, [req.params.category]);
    res.json([categoryResponse[0], itemsResponse[0]]);
});
router.get("/", (req, res) => {
    res.json("this is itemslist");
});

module.exports = router;
