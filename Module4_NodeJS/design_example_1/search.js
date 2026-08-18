//******************************************************************************
//*** set up an HTTP server off port 3000
//******************************************************************************
const express = require("express");
const app = express(); 
const port = 3000;     

//******************************************************************************
//*** set up mysql connections - MODIFIED TO USE mysql2 AND A POOL
// ******************************************************************************
var mysql = require('mysql2');

// Requires the exported pool object from the local 'mysql.js' file
const pool = require('./mysql');


//*** server waits indefinitely for incoming requests
app.listen(port, function () {
    console.log("NodeJS app listening on port " + port);
});

//*** create form parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));



//******************************************************************************
//*** File system module used for accessing files in nodejs (using promises API)
//******************************************************************************
const fsp = require("fs").promises; // Using fs/promises for async/await

// Modified to be async and use await fsp.readFile
async function readAndServe(path, res) {
    try {
        const data = await fsp.readFile(path);
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
    } catch (err) {
        console.error("File Read Error:", err);
        res.status(404).send("<html><body><h1>404 Not Found</h1><p>The file " + path + " could not be served.</p></body></html>");
    }
}

//******************************************************************************
//*** receive the main page get requests from the client (using async/await)
//******************************************************************************
app.get("/search", async (req, res) => {
    // Await the file serving operation
    await readAndServe("./search.html", res);
});


//******************************************************************************
//*** receive post register data from the client (using async/await)
//******************************************************************************
app.post("/search", async (req, res) => {
    const desc = req.body.desc; // extract the strings received from the browser

    // Security Best Practice: Use prepared statements with '?'
    const sql_query = "SELECT title, description FROM film WHERE description LIKE ?";
    const search_term = '%' + desc + '%';

    try {
        // Await the promise from pool.execute. It returns [rows, fields].
        const [result, fields] = await pool.execute(sql_query, [search_term]);

        //*** start creating the html body for the browser
        let html_body = "<HTML><STYLE>body{font-family:arial}</STYLE>";
        html_body += "<BODY><TABLE BORDER=1>";

        //*** print column headings
        html_body += "<TR>";
        for (let i = 0; i < fields.length; i++) {
            html_body += (`<TH>${fields[i].name.toUpperCase()}</TH>`);
        }
        html_body += "</TR>";

        //*** prints rows of table data
        for (let i = 0; i < result.length; i++) {
            html_body += (`<TR><TD>${result[i].title}</TD>` + `<TD>${result[i].description}</TD></TR>`);
        }

        html_body += "</TABLE>";

        //** finish off the html body with a link back to the search page
        html_body += "<BR><BR><BR><a href=http://localhost:3000/search>Go Back To Search</a><BR><BR><BR>";
        html_body += "</BODY></HTML>";

        console.log("Results generated for search term:", desc);
        res.send(html_body); // send query results back to the browser

    } catch (err) {
        console.error("SQL Error:", err);
        // Catch and handle database errors cleanly
        res.status(500).send("<html><body><h1>Database Query Error</h1><p>An error occurred while fetching data.</p></body></html>");
    }
});
