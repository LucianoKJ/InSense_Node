const express = require("express");
const db = require(__dirname + "/db_connect");
const router = express.Router();

//商品詳細資訊
router.get("/:itemId?", async (req, res) => {
    //商品
    const getItemDetail =
        "SELECT `Items`.`itemId`, `Items`.`itemName`, `Items`.`itemImg`,`Items`.`itemImg2`,`Items`.`itemSize`,`Items`.`itemPrice`,`Items`.`itemQty`,`Items`.`discription`,`Items`.`fragranceDetails`,`Brand`.`brandName` FROM `Items` INNER JOIN `Brand` ON `Brand`.`brandId` = `Items`.`brandId`WHERE  `Items`.`itemId`=  ?";

    const itemsDetailResponse = await db.query(getItemDetail, [
        req.params.itemId,
    ]);
    res.json(itemsDetailResponse[0]);
});

router.get("/", (req, res) => {
    res.json("this is itemdetail");
});

module.exports = router;
