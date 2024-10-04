//******************************************************************************
//*** set up an HTTP server off port 3000
//******************************************************************************
const express = require("express");
const app = express();
const port = 3000;

//*** server waits indefinitely for incoming requests
app.listen(port, function () {
  console.log("NodeJS app listening on port " + port);
});

//*** create form parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


//******************************************************************************
//*** set up mysql connections
// ******************************************************************************
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "joon2023",  // use your own MySQL root password
  database: "examples"
});

//*** connect to the database
con.connect(function(err) {
  if (err)
      throw err;
  console.log("Connected to MySQL");
});



//******************************************************************************
//*** File system module used for accessing files in nodejs
//******************************************************************************

const fs = require("fs");

function readAndServe(path, res)
{
    fs.readFile(path,function(err, data) {

        res.setHeader('Content-Type', 'text/html');
        res.end(data);
    })
}

//******************************************************************************
//*** this routing table handles all the GET requests from the browser
//******************************************************************************
app.get("/", function (req, res) {
    readAndServe("./main.html",res)

});

app.get("/main", function (req, res) {
    readAndServe("./main.html",res)

});

app.get("/search", function (req, res) {
    readAndServe("./search.html",res)

});

app.get("/add", function (req, res) {
    readAndServe("./add.html",res)

});


//******************************************************************************
//*** this routing table handles all the POST requests from the browser
//******************************************************************************
app.post("/search", function (req, res) {
    var detail = req.body.detail;   // extract the strings received from the browser

    var sql_query = "select title, detail, credits, prereqs from courses where detail like '%" + detail + "%'";

    con.query(sql_query, function (err, result, fields) { // execute the SQL string
    if (err)
         throw err;                  // SQL error
    else {

                  //*** start creating the html body for the browser
			      var html_body = "<HTML><STYLE>body{font-family:arial}</STYLE>";
			      html_body = html_body + "<BODY>";
			      html_body = html_body + "<img src=https://www.sju.edu/sites/default/files/barbelin-aerial-sunrise-3200x1600.jpg width=800></img>";
			      html_body = html_body + "<TABLE BORDER=1 WIDTH=800>";

			      //*** print column headings
			      html_body = html_body + "<TR>";
				  for (var i = 0; i < fields.length; i++)
				    html_body = html_body + ("<TH style=\"color:Tomato\">" + fields[i].name.toUpperCase() + "</TH>");
				  html_body = html_body + "</TR>";

                  //*** prints rows of table data
				  for (var i = 0; i < result.length; i++)
				       html_body = html_body + ("<TR><TD style=\"vertical-align:top\">" + "<b>" + result[i].title + "</b>"+ "</TD>" +
				                                    "<TD style=\"vertical-align:top\">" + result[i].detail.replace(detail, "<b style=\"color:blue\">"+detail+"</b>") + "<BR><BR></TD>" +
				                                    "<TD style=\"vertical-align:top\">" + result[i].credits + "</TD>" +
				                                    "<TD style=\"vertical-align:top\">" + result[i].prereqs + "</TD></TR>");


                  html_body = html_body + "</TABLE>";

				  //** finish off the html body with a link back to the search page
				  html_body = html_body + "<BR><BR><BR><a href=http://localhost:3000/>Main Menu</a><BR><BR><BR>";
			      html_body = html_body + "</BODY></HTML>";

                console.log(html_body);             // send query results to the console
			    res.send(html_body);                // send query results back to the browser
	         }
    });
});




//******************************************************************************
//*** receive post register data from the client
//******************************************************************************
app.post("/add", function (req, res) {

	var title = req.body.title,       // extract the strings received from the browser
        detail = req.body.detail,
        credits = req.body.credits,
        prereqs = req.body.prereqs,
        attribute = req.body.attribute;

    var sql_query = "insert into courses values('" + title + "','" + detail + "','" + credits + "','" + prereqs + "','" + attribute + "')";

    con.query(sql_query, function (err, result, fields) { // execute the SQL string
    if (err)
        res.send("Illegal Query" + err);                  // SQL error

    else {
                console.log(sql_query);                                   // send query results to the console

			    res.redirect("http://localhost:3000/show?title="+title);   // redirect to the search page to show the new course
         }
    });
});


//******************************************************************************
//*** this handles a specific GET requests from the browser
//******************************************************************************
app.get("/show", function (req, res) {
    var title = req.query.title;   // extract the string received from the browser

    var sql_query = "select title, detail, credits, prereqs from courses where title = '" + title + "'";

    con.query(sql_query, function (err, result, fields) { // execute the SQL string
    if (err)
         throw err;                  // SQL error
    else {

                  //*** start creating the html body for the browser
			      var html_body = "<HTML><STYLE>body{font-family:arial}</STYLE>";
			      html_body = html_body + "<BODY>";
			      html_body = html_body + "<img src=https://www.sju.edu/sites/default/files/barbelin-aerial-sunrise-3200x1600.jpg width=800></img>";
			      html_body = html_body + "<TABLE BORDER=1 WIDTH=800>";

			      //*** print column headings
			      html_body = html_body + "<TR>";
				  for (var i = 0; i < fields.length; i++)
				    html_body = html_body + ("<TH style=\"color:Tomato\">" + fields[i].name.toUpperCase() + "</TH>");
				  html_body = html_body + "</TR>";

                  //*** prints rows of table data
				  for (var i = 0; i < result.length; i++)
				       html_body = html_body + ("<TR><TD style=\"vertical-align:top\">" + "<b>" + result[i].title + "</b>"+ "</TD>" +
				                                    "<TD style=\"vertical-align:top\">" + result[i].detail + "<BR><BR></TD>" +
				                                    "<TD style=\"vertical-align:top\">" + result[i].credits + "</TD>" +
				                                    "<TD style=\"vertical-align:top\">" + result[i].prereqs + "</TD></TR>");

                  html_body = html_body + "</TABLE>";

				  //** finish off the html body with a link back to the search page
				  html_body = html_body + "<BR><BR><BR><a href=http://localhost:3000/>Main Menu</a><BR><BR><BR>";
			      html_body = html_body + "</BODY></HTML>";

                console.log(html_body);             // send query results to the console
			    res.send(html_body);                // send query results back to the browser
	         }
    });
});






