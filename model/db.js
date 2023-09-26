require('dotenv').config()
const mysql = require('mysql2')
const connection = mysql.createConnection(process.env.DATABASE_URL)

connection.connect(error => {
    if (error) console.log("MySQL connection: " + error);
    else console.log("Successfully connected to the database.");
});
module.exports = connection;