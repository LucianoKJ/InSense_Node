const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "test",
    password: "test",
    database: "Insense",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = pool.promise();
