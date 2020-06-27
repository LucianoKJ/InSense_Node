const express = require("express");
const { response } = require("express");
const db = require(__dirname + "/db_connect");
const router = express.Router();
const moment = require("moment");

//引入libraries中的函式
const makeFormatedId = require(__dirname + "/../libraries/makeFormatedId"); // 製作格式化的ID
const checkLogin = require(__dirname + "/../libraries/checkLogin"); // 檢查login 狀態

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

        // console.log("affectedRows", responseAddUser[0].affectedRows);

        if (responseAddUser[0].affectedRows > 0) {
            //插入userId sql
            const sqlAddUserId =
                "UPDATE `Users` SET `userId`= ? WHERE `id` = ?";

            //取得剛剛插入的id
            const insertId = responseAddUser[0].insertId.toString();
            // console.log(insertId);

            //插入userId
            const responseAddUserId = await db.query(sqlAddUserId, [
                makeFormatedId(5, "U", insertId),
                insertId,
            ]);

            //更改output
            output.insertUserId = makeFormatedId(5, "U", insertId);
            output.success = true;
            output.userInfo = { ...req.body, userMobile: "" };
            output.logInStatus = true;

            //若註冊成功，則自動生成登入session
            req.session.userEmail = req.body.userEmail;
            req.session.userPassword = req.body.userPassword;
            req.session.userId = output.insertUserId;
        }
    }

    //回傳值
    res.json(output);
});

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

// GET user class list
router.get("/classlist", async (req, res) => {
    const date = new Date().toLocaleDateString();
    const userId = req.session.userId;
    const sql =
        "SELECT `Book`.`bookTime`,`Book`.`bookQty`,`Book`.`bookStatus`,`Class`.`classTime`,`Class`.`className`,`Class`.`classPrice`,`ClassCategory`.`classCategoryName` FROM `Book` INNER JOIN `Class` ON `Book`.`classId` = `Class`.`classId` INNER JOIN `ClassCategory` ON `Class`.`classCategoryId` = `ClassCategory`.`classCategoryId` WHERE `Book`.`userId` = ? AND `Class`.`classTime` > ?";

    const data = await db.query(sql, [userId, date]);
    data[0].forEach((element) => {
        element.classTime = moment(element.classTime).format("YYYY/MM/DD");
    });
    res.json(data[0]);
});

// GET user all class list
router.get("/allclasslist", async (req, res) => {
    const userId = req.session.userId;
    const sql =
        "SELECT `Book`.`bookTime`,`Book`.`bookQty`,`Class`.`classTime`,`Class`.`className`,`Class`.`classPrice`,`ClassCategory`.`classCategoryName` FROM `Book` INNER JOIN `Class` ON `Book`.`classId` = `Class`.`classId` INNER JOIN `ClassCategory` ON `Class`.`classCategoryId` = `ClassCategory`.`classCategoryId` WHERE `Book`.`userId` = ? ";

    const data = await db.query(sql, [userId]);
    data[0].forEach((element) => {
        element.classTime = moment(element.classTime).format("YYYY/MM/DD");
    });
    res.json(data[0]);
});

/* GET users listing. */
router.get("/", function (req, res, next) {
    res.send("this is user page");
});

module.exports = router;
