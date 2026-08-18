//*** Server3 is a secure application to query MySQL using prepared statements.
//*** This application prevents SQL Injection by using placeholders for user input.

const express = require("express");
const app = express();
const port = 3000;

//*** set up mysql connections using the modern 'mysql2/promise' driver
const mysql = require('mysql2/promise');

// 1. Requires the exported pool object from the local 'mysql.js' file
const pool = require('./mysql');

//*** receive the get request from the client using async function
// The user should pass an ID to search for, e.g., /?book_id=5
app.get("/", async (req, res) => {
    // 2. Safely extract only the expected parameter (e.g., an ID)
    const book_id = req.query.book_id; 

    // Input validation: Ensure the input exists
    if (!book_id) {
        return res.status(400).send("Error: Please provide a 'book_id' parameter.");
    }
    
    // 3. Define the query structure with a placeholder (?)
    // This is a fixed, safe query structure.
    const sqlQuery = "SELECT * FROM books WHERE book_id = ?"; 
    
    // The user's input is passed as a separate array [book_id]
    const params = [book_id]; 

    try {
        // 4. Execute the query using pool.execute()
        // The 'mysql2' driver automatically handles sanitization (escaping) 
        // of the 'book_id' parameter, preventing SQL injection.
        const [results, fields] = await pool.execute(sqlQuery, params);

        console.log(`Executed query: ${sqlQuery} with ID ${book_id}`);
        
        // Send the results back to the browser
        res.status(200).json(results); 

    } catch (err) {
        // Log the detailed error on the server
        console.error("Database error:", err.message);
        
        // Send a generic, non-revealing error to the client for security
        res.status(500).send("A database error occurred."); 
    }
});


//*** wait indefinitely in a loop
app.listen(port, function () {
    console.log(`Server 3 running on http://localhost:${port}`);
});