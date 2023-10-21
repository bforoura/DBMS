//*** server 2 shows how a SQL statement received by the server can be executed in
//*** MySQL; the results are send back to the browser via the response command

//*** set up an HTTP server off port 3000
const express = require("express");
const app = express();
const port = 3000;

//*** set up mysql connections
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "******",  // use your own MySQL root password
  database: "examples"
});

//*** connect to the database
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


//*** the GET string received from the browser will be stored here
var user_string = "";


//*** receive the get request from the client
app.get("/", function (req, res) {
    msg = req.query.user_string;  // extract the CGI variable(s) (SQL query) received from the browser

    con.query(msg, function (err, result, fields) { // execute the SQL string
		if (err) throw err;
	    console.log(msg);    // send results to the terminal
	    res.send(result);    // send results to the browser
    });
});


//*** wait indefinitely in a loop
app.listen(port, function () {
  console.log("Example app listening on port ${port}!");
});



