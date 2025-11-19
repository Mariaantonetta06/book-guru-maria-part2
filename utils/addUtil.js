const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// path to your JSON "database" in utils folder
const DB_PATH = path.join(__dirname, "library.json");

// read JSON file
function readDB() {
  const raw = fs.readFileSync(DB_PATH, "utf8");
  return JSON.parse(raw);
}

// write JSON file
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ------------------------------
// POST /api/add-book  → Add a new book
// ------------------------------
router.post("/add-book", (req, res) => {
  const { title, author, genre } = req.body;

  // basic validation (error case 1)
  if (!title || !author || !genre) {
    return res
      .status(400)
      .json({ success: false, message: "Title, author and genre are required." });
  }

  try {
    const db = readDB();

    const newBook = {
      bookId: "B" + Date.now(), // simple unique id
      title,
      author,
      genre,
      status: "Available",
    };

    db.books.push(newBook); // add to array
    writeDB(db);            // save back to file

    return res.status(201).json({ success: true, book: newBook });
  } catch (err) {
    console.error("Error adding book:", err);
    // error case 2: file / server problem
    return res
      .status(500)
      .json({ success: false, message: "Server error while adding book." });
  }
});

// let index.js use this router
module.exports = router;
