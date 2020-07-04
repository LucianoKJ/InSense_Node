const express = require("express");
const db = require(__dirname + "/db_connect");
const router = express.Router();

//檢查登入狀態
const checkLogin = require(__dirname + "/../libraries/checkLogin"); // 檢查login 狀態

//商品分類
//依品牌
router.get("/brand/:brand?/:filterlist?", async (req, res) => {
    //   res.json(req.params.brand)
    2;
    // console.log(req.params.brand);
    const filterList = req.params.filterlist ? req.params.filterlist : "";
    const filterArray = filterList.split(",");
    console.log(filterArray);

    //取得品牌資訊
    const getBrand =
        "SELECT `Brand`.`brandId`, `Brand`.`brandName`, `Brand`.`brandBanner`,`Brand`.`brandDiscription`,`Brand`.`brandCode` FROM `Brand` WHERE `Brand`.`brandCode`= ? ";

    const brandResponse = await db.query(getBrand, [req.params.brand]);

    //依據品牌，選定商品
    const getItems =
        "SELECT `Items`.`itemId`, `Items`.`itemName`, `Items`.`itemImg`,`Items`.`itemPrice`,`Items`.`itemCategoryId`, `Items`.`brandId`,`Items`.`fragranceId`,`Brand`.`brandName` FROM `Items` INNER JOIN `Brand` ON `Items`.`brandId` = `Brand`.`brandId` WHERE `Brand`.`brandCode`= ?";

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
        "SELECT `Items`.`itemId`, `Items`.`itemName`, `Items`.`itemImg`,`Items`.`itemPrice`, `Items`.`itemQty`, `Items`.`brandId`,`Items`.`fragranceId`,`ItemCategories`.`itemCategoryName` FROM `Items` INNER JOIN `ItemCategories` ON `Items`.`itemCategoryId` = `ItemCategories`.`itemCategoryId` WHERE `ItemCategories`.`itemCategoryCode`= ? ";

    const itemsResponse = await db.query(getItems, [req.params.category]);
    res.json([categoryResponse[0], itemsResponse[0]]);
});

//取得願望清單
router.get("/wishlist/:brandOrCategory/:name", async (req, res) => {
    //先檢查登入狀態，記得要有req引數
    const checkLogIn = await checkLogin(req); //使用checkLogin檢查
    //統一的output格式
    const output = {
        success: false,
        body: req.body,
        logInStatus: checkLogIn.logInStatus,
        userInfo: checkLogIn.userInfo ? checkLogIn.userInfo : null,
    };

    // console.log(
    //     req.session.userEmail,
    //     req.session.userPassword,
    //     req.session.userId,
    //     output.logInStatus
    // );
    // ================================== //
    //如果有登入
    if (output.logInStatus) {
        //取得該品牌商品清單

        const getSql = () => {
            if (req.params.brandOrCategory === "brand") {
                return "SELECT `Items`.`itemId` FROM `Items` INNER JOIN `Brand` ON `Items`.`brandId` = `Brand`.`brandId` WHERE `Brand`.`brandCode`= ?";
            } else if (req.params.brandOrCategory === "category") {
                return "SELECT `Items`.`itemId` FROM `Items` INNER JOIN `ItemCategories` ON `Items`.`itemCategoryId` = `ItemCategories`.`itemCategoryId` WHERE `ItemCategories`.`itemCategoryCode`= ? ";
            }
        };
        const getItems = getSql();

        const itemsResponse = await db.query(getItems, [req.params.name]);
        const itemList = itemsResponse[0];
        console.log(itemList);

        //取得該使用者wishlist
        const getWishList =
            "SELECT `itemId` FROM `WishList` WHERE `userId` = ?";
        const wishListResponse = await db.query(
            getWishList,
            req.session.userId
        );
        //確保已經有該會員的欄位
        if (wishListResponse[0].length) {
            const rawData = wishListResponse[0][0].itemId;

            //清單裡面有東西才做
            if (!!rawData && rawData.length > 2) {
                const rawWishList = JSON.parse(wishListResponse[0][0].itemId);
                console.log("rawWishList", rawWishList);

                //後端先處理一次wishList（丟回符合該品牌的id）
                const wishList = rawWishList.filter((wish, index) => {
                    const existence = itemList.findIndex((item, index) => {
                        return item.itemId === wish;
                    });
                    // console.log(existence);
                    return existence >= 0 ? true : false;
                });
                // console.log("wishList", wishList);
                output.success = true;
                output.wishList = wishList;
            } else {
                output.success = true;
                output.wishList = [];
            }
        }
    }
    // ================================== //

    res.json(output);
});

//default
router.get("/", (req, res) => {
    res.json("this is itemslist");
});

module.exports = router;
