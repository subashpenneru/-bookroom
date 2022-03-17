const mysql = require("mysql");

var mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password@123",
  database: "room_booking",
  multipleStatements: true,
});

module.exports = mysqlConnection;
