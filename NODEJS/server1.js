//*** server1 shows how a simple CGI variables can be retrieved

const express = require("express");
const app = express();
const port = 3000;

//*** req.query contains the query string
app.get("/", function (req, res) {
  // extract the id CGI variables for the query string
  res.send('Received message: ' + req.query.message);
});

//*** wait indefinitely for incoming requests
app.listen(port, function () {
  console.log("Example app listening on port ${port}!");
});