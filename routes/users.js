const express = require("express");
const { response } = require("express");
const db = require(__dirname + "/db_connect");
const router = express.Router();
const moment = require("moment");

//引入libraries中的函式
const makeFormatedId = require(__dirname + "/../libraries/makeFormatedId"); // 製作格式化的ID
const checkLogin = require(__dirname + "/../libraries/checkLogin"); // 檢查login 狀態
// ======================================================================================= //

//註冊會員
router.post("/registration", async (req, res) => {
  // console.log(req.body)

  //先檢查登入狀態，記得要有req引數
  const checkLogIn = await checkLogin(req); //使用checkLogin檢查
  //統一的output格式
  const output = {
    success: false,
    body: req.body,
    logInStatus: checkLogIn.logInStatus,
    userInfo: checkLogIn.userInfo ? checkLogIn.userInfo : null,
  };

  console.log(output);

  //無登入時，才可註冊會員
  if (!output.logInStatus) {
    //檢查有無重複註冊
    const sqlCheckAccount = "SELECT * FROM Users WHERE `userAccount` = ? ";
    const responseCheckAccount = await db.query(sqlCheckAccount, [
      req.body.userEmail,
    ]);

    if (responseCheckAccount[0].length) {
      output.errorMessage = "DUPLICATE_ACCOUNT";
    } else {
      //新增會員sql
      const sqlAddUser =
        "INSERT INTO `Users` (`userAccount`, `userPassword`, `userFirstName`, `userLastName`, `userEmail`, `userGender`, `userCity`, `userDistrict`, `userAddress`, `userPostCode`, `userBirthday`) VALUES (?, ? ,?, ?, ?, ? , ?, ?, ?, ?, ?)";

      const responseAddUser = await db.query(sqlAddUser, [
        req.body.userEmail,
        req.body.userPassword,
        req.body.userFirstName,
        req.body.userLastName,
        req.body.userEmail,
        req.body.userGender,
        req.body.userCity,
        req.body.userDistrict,
        req.body.userAddress,
        req.body.userPostCode,
        req.body.userBirthday,
      ]);

      if (responseAddUser[0].affectedRows > 0) {
        //插入userId sql
        const sqlAddUserId = "UPDATE `Users` SET `userId`= ? WHERE `id` = ?";

        //取得剛剛插入的id
        const insertId = responseAddUser[0].insertId.toString();
        // console.log(insertId);

        //插入userId
        const responseAddUserId = await db.query(sqlAddUserId, [
          makeFormatedId(5, "U", insertId),
          insertId,
        ]);

        const sqlAddWishList =
          "INSERT INTO `WishList` (`userId`, `itemId`) VALUES (?, ?)";

        const responseAddWishList = await db.query(sqlAddWishList, [
          makeFormatedId(5, "U", insertId),
          ["[]"],
        ]);

        //更改output
        output.insertUserId = makeFormatedId(5, "U", insertId);
        output.success = true;
        output.userInfo = {...req.body, userMobile: "" };
        output.logInStatus = true;

        //若註冊成功，則自動生成登入session
        req.session.userEmail = req.body.userEmail;
        req.session.userPassword = req.body.userPassword;
        req.session.userId = output.insertUserId;
      }
    }
  }

  //回傳值
  res.json(output);
});
// ======================================================================================= //

//會員資料修改
router.patch("/infomodify", async (req, res) => {
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
    const sqlModifyUser =
      "UPDATE `Users` SET `userAccount`= ?, `userFirstName`= ?, `userLastName` = ?,`userMobile` = ?, `userEmail` = ?, `userGender` = ?, `userCity` = ?, `userDistrict` = ?, `userAddress` = ?, `userPostCode` = ?, `userBirthday` = ? WHERE `userId` = ?";
    const responseModifyUser = await db.query(sqlModifyUser, [
      req.body.userEmail,
      req.body.userFirstName,
      req.body.userLastName,
      req.body.userMobile,
      req.body.userEmail,
      req.body.userGender,
      req.body.userCity,
      req.body.userDistrict,
      req.body.userAddress,
      req.body.userPostCode,
      req.body.userBirthday,
      req.session.userId,
    ]);

    // ================================== //
    // console.log(responseModifyUser[0].changedRows);
    //如果有修改資料
    if (responseModifyUser[0].changedRows) {
      //如果有更改email，要立即更改req.session.userEmail
      req.session.userEmail !== req.body.userEmail
        ? (req.session.userEmail = req.body.userEmail)
        : "";

      output.success = true;
      output.userInfo = {
        ...output.userInfo,
        ...req.body,
      };
    } else {
      output.message = "NO_CHANGE";
    }
    // ================================== //
  }

  res.json(output);
});
// ======================================================================================= //

//登入login
router.post("/login", async (req, res) => {
  // console.log("req.body", req.body);
  const output = {
    success: false,
    logInStatus: false,
    body: req.body,
  };

  const sqlLogIn =
    "SELECT * FROM Users WHERE `userAccount` = ? AND `userPassword` = ?";

  const responseLogIn = await db.query(sqlLogIn, [
    req.body.userEmail,
    req.body.userPassword,
  ]);

  // console.log("responseLogIn", responseLogIn[0][0]);
  // ================================== //

  if (responseLogIn[0].length > 0) {
    output.success = true;
    output.userInfo = responseLogIn[0][0];
    output.logInStatus = true;

    //紀錄帳密在Session
    req.session.userEmail = req.body.userEmail;
    req.session.userPassword = req.body.userPassword;
    req.session.userId = responseLogIn[0][0].userId;
  } else {
    output.errorMessage = "No_User_Found";
  }
  // ================================== //

  // console.log(req.session);
  res.json(output);
});
// ======================================================================================= //

//密碼更改
router.patch("/changepassword", async (req, res) => {
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
    //判斷舊密碼是否正確
    if (req.body.oldPassword === output.userInfo.userPassword) {
      console.log("password correct");
      const sqlChangePassword =
        "UPDATE `Users` SET `userPassword` = ? WHERE `userId` = ? ";
      const responseChangePassword = await db.query(sqlChangePassword, [
        req.body.newPassword,
        req.session.userId,
      ]);

      console.log(responseChangePassword[0]);
      if (responseChangePassword[0].affectedRows > 0) {
        output.success = true;
        output.userInfo = {
          ...output.userInfo,
          userPassword: req.body.userPassword,
        };
        //更改session密碼
        req.session.userPassword = req.body.newPassword;
      } else {
        output.errorMessage = "NO_CHANGE";
      }
    } else {
      console.log("password incorrect");
      output.errorMessage = "OLD_PASSWORD_INCORRECT";
    }
  }

  res.json(output);
});
// ======================================================================================= //

//登入login
router.post("/login", async (req, res) => {
  // console.log("req.body", req.body);
  const output = {
    success: false,
    logInStatus: false,
    body: req.body,
  };

  const sqlLogIn =
    "SELECT * FROM Users WHERE `userAccount` = ? AND `userPassword` = ?";

  const responseLogIn = await db.query(sqlLogIn, [
    req.body.userEmail,
    req.body.userPassword,
  ]);

  // console.log("responseLogIn", responseLogIn[0][0]);
  // ================================== //

  if (responseLogIn[0].length > 0) {
    output.success = true;
    output.userInfo = responseLogIn[0][0];
    output.logInStatus = true;

    //紀錄帳密在Session
    req.session.userEmail = req.body.userEmail;
    req.session.userPassword = req.body.userPassword;
    req.session.userId = responseLogIn[0][0].userId;
  } else {
    output.errorMessage = "No_User_Found";
  }
  // ================================== //

  // console.log(req.session);

  res.json(output);
});
// ======================================================================================= //

//登出logout
router.post("/logout", async (req, res) => {
  // console.log("req.body", req.body);
  delete req.session.userEmail;
  delete req.session.userPassword;
  delete req.session.userId;

  const output = {
    success: true,
    logOutStatus: req.session.userId ? false : true,
  };

  res.json(output);
});
// ======================================================================================= //

//初始檢查有無登入
router.post("/checklogin", async (req, res) => {
  const output = {
    logInStatus: false,
  };

  if (req.session.userEmail && req.session.userPassword) {
    const sqlLogIn =
      "SELECT * FROM Users WHERE `userAccount` = ? AND `userPassword` = ?";

    const responseLogIn = await db.query(sqlLogIn, [
      req.session.userEmail,
      req.session.userPassword,
    ]);

    if (responseLogIn[0].length > 0) {
      output.userInfo = responseLogIn[0][0];
      output.logInStatus = true;
    }
  }

  res.json(output);
});
// ======================================================================================= //

// GET user class list
router.get("/classlist", async (req, res) => {
  const date = new Date().toLocaleDateString();
  const userId = req.session.userId;
  const sql =
    "SELECT `Book`.`bookId`,`Book`.`bookTime`,`Book`.`bookQty`,`Book`.`bookStatus`,`Class`.`classTime`,`Class`.`className`,`Class`.`classPrice`,`ClassCategory`.`classCategoryName` FROM `Book` INNER JOIN `Class` ON `Book`.`classId` = `Class`.`classId` INNER JOIN `ClassCategory` ON `Class`.`classCategoryId` = `ClassCategory`.`classCategoryId` WHERE `Book`.`userId` = ? AND `Class`.`classTime` > ? AND `Book`.`bookStatus` = '預約成功'";

  const data = await db.query(sql, [userId, date]);
  data[0].forEach((element) => {
    element.classTime = moment(element.classTime).format("YYYY/MM/DD");
  });
  res.json(data[0]);
});
// ======================================================================================= //

// PATCH book status
router.patch("/classList", async (req, res) => {
  const output = {
    success: false,
  };
  // 取得傳來的預約編號
  const bookId = req.body.bookId;
  const sql =
    'UPDATE `Book` SET `Book`.`bookStatus` = "取消預約" WHERE `Book`.`bookId` = ? ';
  const data = await db.query(sql, [bookId]);
  // 如果有更新則output增加success及data屬性
  if (data[0].affectedRows > 0) {
    output.success = true;
    output.data = data[0];
  }
  res.json(output);
});
// ======================================================================================= //

// GET user all class list
router.get("/allclasslist", async (req, res) => {
  const userId = req.session.userId;
  const sql =
    "SELECT `Book`.`bookTime`,`Book`.`bookStatus`,`Book`.`bookQty`,`Class`.`classTime`,`Class`.`className`,`Class`.`classPrice`,`ClassCategory`.`classCategoryName` FROM `Book` INNER JOIN `Class` ON `Book`.`classId` = `Class`.`classId` INNER JOIN `ClassCategory` ON `Class`.`classCategoryId` = `ClassCategory`.`classCategoryId` WHERE `Book`.`userId` = ? ";

  const data = await db.query(sql, [userId]);
  data[0].forEach((element) => {
    element.classTime = moment(element.classTime).format("YYYY/MM/DD");
  });
  res.json(data[0]);
});
// ======================================================================================= //

//function: 取得信用卡資訊
const getCrediCardInfo = async (req) => {
  const sqlCreditCardInfo =
    "SELECT `id`, `association`, `cdMonth`, `cdYear`, `cdNumber`,`billAddressCity`, `billAddressPostCode`, `billAddressDistrict`, `billAddressStreet`, `isDefault` FROM `CreditCards` WHERE `userId` = ?";
  const responseCreditCardInfo = await db.query(sqlCreditCardInfo, [
    req.session.userId,
  ]);
  // console.log(responseCreditCardInfo)
  const creditCardList = responseCreditCardInfo[0];

  //將信用卡號換成後四碼
  creditCardList.forEach((el) => {
    el.cdLastFourNumber = el.cdNumber.split("-")[3];
    delete el.cdNumber;
  });

  return creditCardList;
};
// ======================================================================================= //

//已儲存信用卡資訊
router.get("/creditcardinfo", async (req, res) => {
  //先檢查登入狀態，記得要有req引數
  const checkLogIn = await checkLogin(req); //使用checkLogin檢查
  //統一的output格式
  const output = {
    success: false,
    body: req.body,
    logInStatus: checkLogIn.logInStatus,
    userInfo: checkLogIn.userInfo ? checkLogIn.userInfo : null,
  };
  //若有登入才進行
  if (output.logInStatus) {
    const creditCardList = await getCrediCardInfo(req);
    //output
    output.creditCardList = creditCardList;
    output.success = true;
  }

  res.json(output);
});
// ======================================================================================= //

//modify credit card address
router.patch("/creditcardmodify", async (req, res) => {
  //先檢查登入狀態，記得要有req引數
  const checkLogIn = await checkLogin(req); //使用checkLogin檢查
  //統一的output格式
  const output = {
    success: false,
    body: req.body,
    logInStatus: checkLogIn.logInStatus,
    userInfo: checkLogIn.userInfo ? checkLogIn.userInfo : null,
  };

  //若有登入才進行
  if (output.logInStatus) {
    // console.log(req.body);
    const sqlChangeCreditCard =
      "UPDATE `CreditCards` SET `billAddressCity` = ?, `billAddressPostCode` = ?, `billAddressDistrict` = ?, `billAddressStreet` = ? WHERE `userId` = ? AND `id`= ?";
    const responseChangeCreditCard = await db.query(sqlChangeCreditCard, [
      req.body.billAddressCity,
      req.body.billAddressPostCode,
      req.body.billAddressDistrict,
      req.body.billAddressStreet,
      req.session.userId,
      req.body.id,
    ]);

    // console.log(responseChangeCreditCard[0]);
    if (
      responseChangeCreditCard[0] &&
      responseChangeCreditCard[0].affectedRows
    ) {
      output.success = true;
      if (responseChangeCreditCard[0].changedRows) {
        // 順便回傳新的creditCardList
        const newCreditCardList = await getCrediCardInfo(req);
        console.log("newCreditCardList", newCreditCardList);
        output.newCreditCardList = newCreditCardList;
      } else {
        output.message = "NO_CHANGE";
      }
    }
  }

  res.json(output);
});
// ======================================================================================= //

//取得所有願望清單function
const getAllWishList = async (req) => {
  //取得該使用者wishlist
  const getAllWishList = "SELECT `itemId` FROM `WishList` WHERE `userId` = ?";
  const wishListResponse = await db.query(getAllWishList, req.session.userId);
  //取得願望清單
  const allWishList = JSON.parse(wishListResponse[0][0].itemId);
  return allWishList;
};

//取得wishlist
router.get("/wishlist", async (req, res) => {
  console.log("okokokok");
  //先檢查登入狀態，記得要有req引數
  const checkLogIn = await checkLogin(req); //使用checkLogin檢查
  //統一的output格式
  const output = {
    success: false,
    logInStatus: checkLogIn.logInStatus,
    userInfo: checkLogIn.userInfo ? checkLogIn.userInfo : null,
  };

  if (output.logInStatus) {
    //取得該使用者wishlist
    const allWishList = await getAllWishList(req);
    //生成問號
    const questionMark = () => {
      if (allWishList.length) {
        const newArray = allWishList.map((el) => {
          return "?";
        });
        return "WHERE `itemId` in (" + newArray.join(" , ") + ")";
      } else {
        return "WHERE `itemId` = '' ";
      }
    };
    // console.log(questionMark());
    const sqlItemsWished =
      "SELECT `Items`.`itemId`, `Items`.`itemName`, `Items`.`itemImg`,`Items`.`itemPrice`,`Items`.`itemSize` FROM `Items` " +
      questionMark();
    // console.log(getItemsWished);

    const itemsWishedResponse = await db.query(sqlItemsWished, allWishList);
    const itemsWished = itemsWishedResponse[0];

    output.itemsWished = itemsWished;
    output.success = true;
  } else {
    output.itemsWished = [];
  }
  // ================================== //

  res.json(output);
});
// ======================================================================================= //

//cancelWish
router.delete("/deletewish/:itemId", async (req, res) => {
  //先檢查登入狀態，記得要有req引數
  const checkLogIn = await checkLogin(req); //使用checkLogin檢查
  //統一的output格式
  const output = {
    success: false,
    logInStatus: checkLogIn.logInStatus,
    userInfo: checkLogIn.userInfo ? checkLogIn.userInfo : null,
  };
  const itemId = req.params.itemId;

  if (output.logInStatus) {
    //先取得原先陣列
    const originalWishList = await getAllWishList(req);
    const newWishList = originalWishList.filter((el) => {
      return itemId !== el ? true : false;
    });
    console.log(newWishList);

    const sqlCancelWish =
      "UPDATE `WishList` SET `itemId`= ? WHERE `userId` = ? ";
    const responseCancelWish = await db.query(sqlCancelWish, [
      JSON.stringify(newWishList),
      req.session.userId,
    ]);
    console.log(responseCancelWish[0]);

    if (responseCancelWish[0].affectedRows) {
      output.success = true;
    }
  }

  res.json(output);
});
// ======================================================================================= //

//新增信用卡
router.post("/creditcardadd", async (req, res) => {
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
    //新增會員sql
    const sqlAddCreditCard =
      "INSERT INTO `CreditCards` (`userId`, `association`,`cdHolder`, `cdMonth`, `cdYear`, `cdNumber`, `billAddressCity`, `billAddressPostCode`, `billAddressDistrict`, `billAddressStreet`) VALUES (?, ? ,?, ?, ?, ? , ?, ?, ?, ?)";

    const responseAddCreditCard = await db.query(sqlAddCreditCard, [
      req.session.userId,
      req.body.association,
      req.body.cdHolder,
      req.body.cdMonth,
      req.body.cdYear,
      req.body.cdNumber,
      req.body.billAddressCity,
      req.body.billAddressPostCode,
      req.body.billAddressDistrict,
      req.body.billAddressStreet,
    ]);
    // console.log(responseAddCreditCard[0]);

    //若新增成功
    if (responseAddCreditCard[0].affectedRows) {
      const newCreditCardList = await getCrediCardInfo(req);
      console.log("newCreditCardList", newCreditCardList);
      output.newCreditCardList = newCreditCardList;
      output.success = true;
    } else {
      output.message = "NOTHING_ADDED";
    }
  }

  res.json(output);
});
// ======================================================================================= //

//改變信用卡預設
router.patch("/creditcardchangedefault/:id", async (req, res) => {
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
    const sqlChangeDefault =
      "UPDATE `CreditCards` SET `isDefault`= CASE WHEN `id` NOT IN (?) THEN 0 WHEN `id` = ?  THEN 1 END WHERE `userId` = ? ";

    const response = await db.query(sqlChangeDefault, [
      req.params.id,
      req.params.id,
      req.session.userId,
    ]);
    console.log(response[0]);

    if (response[0].changedRows) {
      const newCreditCardList = await getCrediCardInfo(req);
      // console.log("newCreditCardList", newCreditCardList);
      output.newCreditCardList = newCreditCardList;
      output.success = true;
    } else {
      output.message = "NOTHING_CHANGED";
    }
  }
  res.json(output);
});
// ======================================================================================= //

//creditcarddelete
router.delete("/creditcarddelete/:id", async (req, res) => {
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
    const creditCardId = req.params.id;
    const sqlDeleteCard = "Delete FROM `CreditCards` WHERE `id` = ? ";

    const responseDeleteCard = await db.query(sqlDeleteCard, [req.params.id]);

    console.log(responseDeleteCard[0]);
    if (responseDeleteCard[0].affectedRows) {
      const newCreditCardList = await getCrediCardInfo(req);
      // console.log("newCreditCardList", newCreditCardList);
      output.newCreditCardList = newCreditCardList;
      output.success = true;
    } else {
      output.message = "DELETE_FAILED";
    }
  }

  res.json(output);
});
// ======================================================================================= //

//dashboard
router.get("/dashboard", async (req, res) => {
  //先檢查登入狀態，記得要有req引數
  const checkLogIn = await checkLogin(req); //使用checkLogin檢查
  //統一的output格式
  const output = {
    success: false,
    logInStatus: checkLogIn.logInStatus,
    userInfo: checkLogIn.userInfo ? checkLogIn.userInfo : null,
  };

  if (output.logInStatus) {
    const thisYear = new Date().getFullYear();
    const thisYearFirstDate = new Date(thisYear, 0, 1);
    console.log(thisYearFirstDate);

    const sqlAnnualAmount =
      "SELECT `totalPrice` FROM `OrderTb` WHERE `orderStatus` NOT IN ('已取消') AND `userID` = ? AND `created_at` >= ?";
    const [responseAnnualAmount] = await db.query(sqlAnnualAmount, [
      req.session.userId,
      thisYearFirstDate,
    ]);
    console.log(responseAnnualAmount);

    //初始化totalAmount
    output.totalAmount = 0;
    output.level = 0;
    //若有任何訂單
    if (responseAnnualAmount.length) {
      responseAnnualAmount.forEach((el) => {
        console.log(el.totalPrice);
        output.totalAmount += Number(el.totalPrice);
      });

      output.level = output.totalAmount >= 50000 ? 1 : 0;
      output.success = true;
    }
  }

  res.json(output);
});


router.get('/orderhistory', async (req, res) => {

  const checkLogIn = await checkLogin(req); //使用checkLogin檢查

  const output = {
    success: false,
    logInStatus: checkLogIn.logInStatus,
    userInfo: checkLogIn.userInfo ? checkLogIn.userInfo : null,
  };
  //後端撈取訂單資料
  if (output.logInStatus) {
    const userId = checkLogIn.userInfo.userId
    const orderHistorySql = "SELECT `OrderTb`.`orderId`,`OrderTb`.`totalPrice`,`OrderTb`.`orderStatus`,`OrderTb`.`created_at` FROM `OrderTb` WHERE `userId`= ?"
    const [orderHistoryData] = await db.query(orderHistorySql, [userId])
    
    //改變時間格式
    orderHistoryData.forEach((element) => {
      element.created_at = moment(element.created_at).format("YYYY/MM/DD");
    });
    
    console.log(orderHistoryData)
    //後端撈取寄送資訊
    const deliverySql = "SELECT `deliveryId`,`orderId` FROM `ordercheckoutpage` WHERE `userId`= ?"
    const [deliveryData] = await db.query(deliverySql, [userId])

    //取得訂單裡的items
    const orderItemSql = "SELECT `brand`.`brandName`,`orderitemlist`.`itemId`,`orderitemlist`.`itemimg`,`orderitemlist`.`itemPrice`,`orderitemlist`.`itemName`,`orderitemlist`.`orderId` FROM `orderitemlist` INNER JOIN `items` ON `orderitemlist`.`itemId` = `items`.`itemId` INNER JOIN `brand` ON `items`.`brandId` = `brand`.`brandId` WHERE `userId`= ?"
    const [orderItemData] = await db.query(orderItemSql, [userId])

    //將與訂單編號相同的deliveryId 加入 orderHistory陣列裡
    const orderHistory = []
    orderHistoryData.forEach(el => {
      deliveryData.forEach(i => {
        if (el.orderId === i.orderId) {
          el.deliveryId = i.deliveryId
          orderHistory.push(el)
        }
      })
    })
    //將與訂單編號相同的商品加入 orderHistory的陣列裡
    orderHistory.forEach((el) => {
      orderItemData.forEach((i, index) => {
        if (el.orderId === i.orderId) {
          el.itemId = i.itemId
          el[i.itemId] = { itemBrand: i.brandName, itemimg: i.itemimg, itemPrice: i.itemPrice, itemName: i.itemName }
        }
      })
    })
    output.orderHistory = orderHistory
    output.success = true
  }
  // console.log(output)
  res.json(output)
})

// ========================================== //
// 取消訂單
router.patch('/orderhistory/:orderId', async (req, res) => {

  const orderId = req.body.orderId
  const output = {
    success: false
  }
  const orderSql = 'UPDATE `OrderTb` SET `orderStatus` = "已取消" WHERE `orderId` = ?'
  const response = await db.query(orderSql, [orderId])
  if (response[0].affectedRows > 0) {
    output.success = true
  }
  res.json(output)
})

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("this is user page");
});

module.exports = router;
