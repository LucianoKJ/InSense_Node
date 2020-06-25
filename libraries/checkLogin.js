const db = require(__dirname + "/../routes/db_connect");

//每次向後端請求時，需驗證登入狀態
const checkLogin = async (req) => {
  const output = {
    logInStatus: false,
  };

  // console.log(req.session);
  if (req.session.userEmail && req.session.userPassword) {
    const sqlLogIn =
      "SELECT * FROM Users WHERE `userAccount` = ? AND `userPassword` = ?";

    const responseLogIn = await db.query(sqlLogIn, [
      req.session.userEmail,
      req.session.userPassword,
    ]);

    //若存在該使用者
    if (responseLogIn[0].length > 0) {
      output.userInfo = responseLogIn[0][0];
      output.logInStatus = true;
    } else {
      //若發生找不到該使用者
      delete req.session.userEmail;
      delete req.session.userPassword;
      delete req.session.userId;
    }
  }
  // console.log(output)
  return output;
};

module.exports = checkLogin;
