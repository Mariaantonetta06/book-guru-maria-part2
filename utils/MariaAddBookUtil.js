const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();

// Use same path style as DeleteBookUtil & ViewBookUtil
const BOOKS_FILE = path.join("utils", "library.json");

// Read database: always return { books: [] }
async function readDB() {
  try {
    const data = await fs.readFile(BOOKS_FILE, "utf8");
    const parsed = JSON.parse(data);
    return { books: parsed.books || [] };
  } catch (err) {
    // If file doesn't exist yet, start with empty books array
    if (err.code === "ENOENT") {
      return { books: [] };
    }
    throw err;
  }
}

// Write database: always store { books: [...] }
async function writeDB(books) {
  const payload = { books };
  await fs.writeFile(BOOKS_FILE, JSON.stringify(payload, null, 2), "utf8");
}

// POST /api/add-book → Add a new book
router.post("/add-book", async (req, res) => {
  const { title, author, genre } = req.body;

  // basic validation
  if (!title || !author || !genre) {
    return res
      .status(400)
      .json({ success: false, message: "Title, author and genre are required." });
  }

  try {
    const db = await readDB();
    const books = db.books;

    const newBook = {
      bookId: "B" + Date.now(), // simple unique id
      title,
      author,
      genre,
      status: "Available",
    };

    books.push(newBook);
    await writeDB(books);

    return res.status(201).json({
      success: true,
      message: "Book added successfully.",
      book: newBook,
    });
  } catch (err) {
    console.error("Error adding book:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error while adding book." });
  }
});

module.exports = router;
