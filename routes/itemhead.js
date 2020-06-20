const express = require("express");
const db = require(__dirname + "/db_connect");
const router = express.Router();

//itemlist 頭
router.get("/brand/:brand?", async (req, res) => {
    //   res.json(req.params.brand)
    const getBrand =
        "SELECT `Brand`.`brandId`, `Brand`.`brandName`, `Brand`.`brandBanner`FROM `Brand` WHERE `Brand`.`brandName`= ? ";

    const response = await db.query(getBrand, [req.params.brand]);
    res.json(response[0]);
});

router.get("/", (req, res) => {
    res.json("this is list");
});

module.exports = router;
