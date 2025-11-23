var express = require('express');
var bodyParser = require("body-parser");
var app = express();
var addBookRouter = require("./utils/MariaAddBookUtil.js");


const PORT = process.env.PORT || 5050
var startPage = "index.html";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./public"));
app.use("/api", addBookRouter);


const { viewBook } = require('./utils/AlishaViewBookUtil.js')
app.get('/view-book', viewBook)

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/" + startPage);
})

server = app.listen(PORT, function () {
    const address = server.address();
    const baseUrl = `http://${address.address == "::" ? 'localhost' :
address.address}:${address.port}`;
    console.log(`Demo project at: ${baseUrl}`);
});


// import utils
const { deleteBook } = require('./utils/AngelDeleteBookUtil.js');

// delete path
app.delete('/delete-book/:id', deleteBook);


module.exports = {app, server}