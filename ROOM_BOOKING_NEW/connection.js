const mysql = require('mysql');

var mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12481A@04c0',
  database: 'room_booking',
  multipleStatements: true,
});

module.exports = mysqlConnection;
