const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");

//MySql
const MysqlStore = require("express-mysql-session")(session);
const db = require(__dirname + "/db_connect");

// const sessionFileStore = require("session-file-store"); //暫時本地端存儲

//Top-Level middleware
//parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

//parse application/json
app.use(express.json());

//cors
const whitelist = [
  undefined,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3030",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://127.0.0.1:5500",
];
const corsOptions = {
  credentials: true,
  origin: function (origin, cb) {
    // console.log(origin);
    if (whitelist.indexOf(origin) !== -1) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
};
app.use(cors(corsOptions));

//Session
// const FileStore = sessionFileStore(session); //暫時本地端存儲
const identityKey = "skey";

const sessionStore = new MysqlStore({}, db);
app.use(
  session({
    name: identityKey,
    secret: "SECRET", // 用來對session id相關的cookie進行簽名
    store: sessionStore,
    // store: new FileStore(), // 本地儲存session（純文字文件，也可以選擇其他store，例如redis的）
    saveUninitialized: false, // 是否自動儲存未初始化的會話，建議false
    resave: false, // 是否每次都重新儲存會話，建議false
    cookie: {
      maxAge: 1800000, // 30分鐘 有效期，單位是毫秒
      // domain:"localhost"
      // sameSite: false, // this may need to be false is you are accessing from another React app
      // httpOnly: false, // this must be false if you want to access the cookie
      // secure: process.env.NODE_ENV === "production",
    },
  })
);


// //設定ejs路徑(暫時用不到)
app.set("view engine", "ejs");
app.set("views", __dirname + "/../views");

// ================================== //
//各功能路由
//商品
app.use("/itemlist", require(__dirname + "/itemlist"));
app.use("/itemdetail", require(__dirname + "/itemdetail"));
//會員
app.use("/users", require(__dirname + "/users"));
//課程
app.use("/class", require(__dirname + "/class"));

//訂單
app.use("/orders", require(__dirname + "/orders"));
//faq
app.use('/faq', require(__dirname + '/faq'));

//coupon
app.use('/coupon', require(__dirname + '/coupon'));
//send mail test
app.use("/passwordissue", require(__dirname + "/passwordIssue"));

//測試Post
app.post("/echo", (req, res) => {
  // console.log(req.body)
  // console.log(db);
  req.session.my_var = req.session.my_var || 0;
  req.session.my_var++;
  // res.cookie("test", "test");
  res.json(req.session);
});

//測試Get
app.get("/main", (req, res) => {
  res.render("test");
});

app.get("/", (req, res) => {
  const output = {
    text: "ok from node",
    session: req.session,
  };
  res.json(output);
});

//靜態頁面
app.use(express.static("public"));

//404
app.use((req, res) => {
  res.type("text/html");
  res.status(404);
  res.send("<h1>404</h1><h1>Not Found</h1>");
});

//設定Port號
app.listen(3030, function () {
  console.log("Server Started");
});
