//******************************************************************************
//*** set up an HTTP server off port 3000
//******************************************************************************
const express = require('express');
const app = express();
const PORT = 3000; 
const fsp = require("fs").promises; // Use fs/promises for async/await file operations

// Requires the exported pool object from the local 'mysql.js' file
const pool = require('./mysql'); 

//*** create form parser
// Using express's built-in body parser for simplicity and consistency
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//******************************************************************************
//*** File system module used for accessing files in nodejs (using promises API)
//******************************************************************************

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
//*** This routing table handles all the GET requests from the browser
//******************************************************************************

// All GET handlers now use async/await by calling the async readAndServe utility
app.get("/", async (req, res) => {
    await readAndServe("./main.html", res);
});

app.get("/main", async (req, res) => {
    await readAndServe("./main.html", res);
});

app.get("/search", async (req, res) => {
    await readAndServe("./search.html", res);
});

app.get("/add", async (req, res) => {
    await readAndServe("./add.html", res);
});


//******************************************************************************
//*** This routing table handles all the POST requests from the browser
//******************************************************************************

app.post("/search", async (req, res) => {
    // Extract the strings received from the browser
    const detail = req.body.detail; 

    // SECURITY FIX: Use prepared statements (the '?' placeholder)
    const sql_query = "SELECT title, detail, credits, prereqs FROM courses WHERE detail LIKE ?";
    const search_term = '%' + detail + '%';

    try {
        // Await the promise from pool.execute. It returns [result, fields].
        const [result, fields] = await pool.execute(sql_query, [search_term]);

        //*** start creating the html body for the browser
        let html_body = "<HTML><STYLE>body{font-family:arial}</STYLE>";
        html_body += "<BODY>";
        html_body += "<img src=https://www.sju.edu/sites/default/files/barbelin-aerial-sunrise-3200x1600.jpg width=800></img>";
        html_body += "<TABLE BORDER=1 WIDTH=800>";

        //*** print column headings
        html_body += "<TR>";
        // Use fields array from mysql2 for column names
        for (let i = 0; i < fields.length; i++) {
            html_body += (`<TH style="color:Tomato">${fields[i].name.toUpperCase()}</TH>`);
        }
        html_body += "</TR>";

        //*** prints rows of table data
        for (let i = 0; i < result.length; i++) {
            const row = result[i];
            // Replaced old variable declarations with modern const/let
            html_body += (`<TR>
                <TD style="vertical-align:top"><b>${row.title}</b></TD>
                <TD style="vertical-align:top">${row.detail.replace(detail, "<b style=\"color:blue\">" + detail + "</b>")}<BR><BR></TD>
                <TD style="vertical-align:top">${row.credits}</TD>
                <TD style="vertical-align:top">${row.prereqs}</TD>
            </TR>`);
        }

        html_body += "</TABLE>";

        //** finish off the html body with a link back to the search page
        html_body += "<BR><BR><BR><a href=http://localhost:3000/>Main Menu</a><BR><BR><BR>";
        html_body += "</BODY></HTML>";

        console.log("Results generated for search term:", detail);
        res.send(html_body); // send query results back to the browser

    } catch (err) {
        // Catch and handle database errors cleanly
        console.error("SQL Error in /search POST:", err);
        res.status(500).send("<html><body><h1>Database Query Error</h1><p>An error occurred while fetching data: " + err.message + "</p></body></html>");
    }
});


//******************************************************************************
//*** receive post register data from the client (ADD)
//******************************************************************************
app.post("/add", async (req, res) => {

    const { title, detail, credits, prereqs, attribute } = req.body; 

    // SECURITY FIX: Use prepared statements (the '?' placeholder)
    const sql_query = "INSERT INTO courses (title, detail, credits, prereqs, attribute) VALUES (?, ?, ?, ?, ?)";
    const params = [title, detail, credits, prereqs, attribute];

    try {
        // Await pool.execute to run the insert query
        await pool.execute(sql_query, params); 

        console.log("SQL Insert Query successful:", sql_query); 
        
        // Redirect after successful insert
        res.redirect(`http://localhost:${PORT}/show?title=${encodeURIComponent(title)}`); 

    } catch (err) {
        // Catch and handle database errors cleanly
        console.error("SQL Error in /add POST:", err);
        res.status(500).send("<html><body><h1>Illegal Query</h1><p>The insert failed: " + err.message + "</p></body></html>");
    }
});


//******************************************************************************
//*** this handles a specific GET requests from the browser (SHOW)
//******************************************************************************
app.get("/show", async (req, res) => {
    // extract the string received from the browser
    const title = req.query.title; 

    // SECURITY FIX: Use prepared statements (the '?' placeholder)
    const sql_query = "SELECT title, detail, credits, prereqs FROM courses WHERE title = ?";

    try {
        // Await the promise from pool.execute. It returns [result, fields].
        const [result, fields] = await pool.execute(sql_query, [title]);

        if (result.length === 0) {
            return res.status(404).send("<html><body><h1>Course Not Found</h1><p>The course title specified does not exist.</p></body></html>");
        }
        
        //*** start creating the html body for the browser
        let html_body = "<HTML><STYLE>body{font-family:arial}</STYLE>";
        html_body += "<BODY>";
        html_body += "<img src=https://www.sju.edu/sites/default/files/barbelin-aerial-sunrise-3200x1600.jpg width=800></img>";
        html_body += "<TABLE BORDER=1 WIDTH=800>";

        //*** print column headings
        html_body += "<TR>";
        for (let i = 0; i < fields.length; i++) {
            html_body += (`<TH style="color:Tomato">${fields[i].name.toUpperCase()}</TH>`);
        }
        html_body += "</TR>";

        //*** prints rows of table data (only one expected row)
        for (let i = 0; i < result.length; i++) {
            const row = result[i];
            html_body += (`<TR>
                <TD style="vertical-align:top"><b>${row.title}</b></TD>
                <TD style="vertical-align:top">${row.detail}<BR><BR></TD>
                <TD style="vertical-align:top">${row.credits}</TD>
                <TD style="vertical-align:top">${row.prereqs}</TD>
            </TR>`);
        }

        html_body += "</TABLE>";

        //** finish off the html body with a link back to the search page
        html_body += "<BR><BR><BR><a href=http://localhost:3000/>Main Menu</a><BR><BR><BR>";
        html_body += "</BODY></HTML>";

        console.log("Show query executed for title:", title);
        res.send(html_body); // send query results back to the browser

    } catch (err) {
        // Catch and handle database errors cleanly
        console.error("SQL Error in /show GET:", err);
        res.status(500).send("<html><body><h1>Database Query Error</h1><p>An error occurred while fetching data: " + err.message + "</p></body></html>");
    }
});


// --- Global Error Handler Middleware ---
// Kept as a fallback for non-route-specific errors or errors passed by next()
app.use((err, req, res, next) => {
    // Log the error stack for debugging purposes
    console.error(err.stack);
    res.status(500).json({ error: 'An unexpected server error occurred.', details: err.message });
});


//*** set up an HTTP server off port 3000
app.listen(PORT, function () {
    console.log("NodeJS app listening on port " + PORT);
});
