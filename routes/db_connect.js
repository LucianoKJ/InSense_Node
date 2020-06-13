const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "test",
  password: "use2@localhost",
  database: "test",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool.promise();
