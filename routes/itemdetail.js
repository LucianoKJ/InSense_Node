const express = require("express");
const db = require(__dirname + "/db_connect");
const router = express.Router();

//檢查登入狀態
const checkLogin = require(__dirname + "/../libraries/checkLogin"); // 檢查login 狀態

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

//取得願望清單
router.get("/wishlist/:itemId", async (req, res) => {
  //先檢查登入狀態，記得要有req引數
  const checkLogIn = await checkLogin(req); //使用checkLogin檢查
  //統一的output格式
  const output = {
    success: false,
    body: req.body,
    logInStatus: checkLogIn.logInStatus,
    userInfo: checkLogIn.userInfo ? checkLogIn.userInfo : null,
    itemWish: false,
  };

  console.log(
    req.session.userEmail,
    req.session.userPassword,
    req.session.userId,
    output.logInStatus
  );
  // ================================== //
  //如果有登入
  if (output.logInStatus) {
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
        // console.log("rawWishList", rawWishList);

        //後端先處理一次wishList（丟回符合該品牌的id）
        const existence = rawWishList.findIndex((item, index) => {
          return item === req.params.itemId;
        });
        // console.log("existence", existence);

        output.success = true;

        //若有找到
        if (existence >= 0) {
          output.itemWish = true;
        }
      }
    }
  }
  // ================================== //

  res.json(output);
});

//toggle bookmark
router.patch("/togglebookmark", async (req, res) => {
  // console.log(req.body);
  //先檢查登入狀態，記得要有req引數
  const checkLogIn = await checkLogin(req); //使用checkLogin檢查
  //統一的output格式
  const output = {
    success: false,
    body: req.body,
    logInStatus: checkLogIn.logInStatus,
    userInfo: checkLogIn.userInfo ? checkLogIn.userInfo : null,
  };
  if (output.logInStatus) {
    //取得該使用者wishlist
    const getWishList =
      "SELECT `itemId` FROM `WishList` WHERE `userId` = ?";
    const wishListResponse = await db.query(
      getWishList,
      req.session.userId
    );
    // console.log(wishListResponse);

    //如果已有欄位，才進行
    if (wishListResponse[0].length) {
      const wish = req.body.itemId;
      const rawData = wishListResponse[0][0].itemId;
      const rawWishList = JSON.parse(wishListResponse[0][0].itemId);
      // console.log("rawWishList:", rawWishList);

      const existence = rawWishList.findIndex((el) => {
        return el === wish;
      });
      // console.log(existence);

      //改變願望清單function
      const updateWishList = async (newWishList) => {
        const newWishListString = JSON.stringify(newWishList);
        const updateWish =
          "UPDATE `WishList` SET `itemId`= ? WHERE `userId`= ?";
        const newWishListResponse = await db.query(updateWish, [
          newWishListString,
          req.session.userId,
        ]);
        return newWishListResponse;
      };

      //若願望清單已有，則去除，反之增加
      if (existence >= 0) {
        const newWishList = rawWishList.filter((el) => {
          return el !== wish;
        });
        const newWishListResponse = await updateWishList(newWishList);
        console.log(newWishListResponse);
        if (newWishListResponse[0].affectedRows) {
          output.success = true;
          output.message = "WISH_REMOVE";
        }
      } else {
        const newWishList = [...rawWishList, wish];
        const newWishListResponse = await updateWishList(newWishList);
        console.log(newWishListResponse);
        if (newWishListResponse[0].affectedRows) {
          output.success = true;
          output.message = "WISH_ADD";
        }
      }
    }
  }
  res.json(output);
});

//default
router.get("/", (req, res) => {
  res.json("this is itemdetail");
});

module.exports = router;
