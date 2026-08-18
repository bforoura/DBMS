//*** Server 2 shows how a SQL statement received by the server can be executed in
//*** MySQL; the results are sent back to the browser via the response command

//*** set up an HTTP server off port 3000
const express = require("express");
const app = express();
const port = 3000;

//*** set up mysql connections using the modern 'mysql2/promise' driver
const mysql = require('mysql2/promise');

// *** IMPORT THE POOL ***
// Requires the exported pool object from the local 'mysql.js' file
const pool = require('./mysql');

//*** receive the get request from the client using async function
app.get("/", async (req, res) => {
    // CRITICAL SECURITY RISK: Directly using user input as the SQL query
    const user_sql_command = req.query.user_string; 
    
    // Check if the user actually sent a command
    if (!user_sql_command) {
        return res.status(400).send("Please provide an SQL command via the 'user_string' parameter.");
    }
    
    try {
        // Use pool.query() to execute the raw SQL string.
        // This is where the SQL Injection vulnerability occurs.
        const [results, fields] = await pool.query(user_sql_command);

        console.log(`Executed command: ${user_sql_command}`);
        
        // Return the raw results from the database.
        res.send(results); 
        
    } catch (err) {
        // Since this is a console-like app, we might display the SQL error
        // to the user so they can debug their command.
        console.error("SQL Execution Error:", err.message);
        res.status(400).send(`SQL Error: ${err.message}`);
    }
});


//*** wait indefinitely in a loop
app.listen(port, function () {
    console.log("Server 2 listening on port " + port);
});