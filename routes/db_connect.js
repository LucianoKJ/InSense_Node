const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "test@test",
    password: "test",
    database: "InSense",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = pool.promise();
