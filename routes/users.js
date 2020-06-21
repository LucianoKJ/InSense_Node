var express = require("express");
const db = require(__dirname + "/db_connect");
var router = express.Router();

router.post("/users/registration?", async (req, res) => {
  const sql = "";
  // const response = await db.query(sql, [req.params.brand]);
  res.json();
});

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("this is user page");
});

module.exports = router;
