var express = require("express");
var bodyParser = require("body-parser");

var app = express();

const PORT = process.env.PORT || 5050;
var startPage = "index.html";

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./public"));

// routers
var addBookRouter = require("./utils/MariaAddBookUtil.js");
app.use("/api", addBookRouter);

// view
const { viewBook } = require("./utils/AlishaViewBookUtil.js");
app.get("/view-book", viewBook);

// delete
const { deleteBook } = require("./utils/AngelDeleteBookUtil.js");
app.delete("/delete-book/:id", deleteBook);

// home
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/" + startPage);
});

// ✅ Only start server when running `node index.js` directly (NOT during tests)
let server;
function startServer(port = PORT) {
  server = app.listen(port, function () {
    const address = server.address();
    const host = address.address == "::" ? "localhost" : address.address;
    const baseUrl = `http://${host}:${address.port}`;
    console.log(`Demo project at: ${baseUrl}`);
  });
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
