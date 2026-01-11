const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();

// ✅ Allow tests to override DB location (so you don't damage real utils/library.json)
const BOOKS_FILE = process.env.LIBRARY_PATH
  ? path.resolve(process.env.LIBRARY_PATH)
  : path.join(__dirname, "library.json");

// Read DB: always return { books: [] }
async function readDB() {
  try {
    const data = await fs.readFile(BOOKS_FILE, "utf8");
    const parsed = JSON.parse(data);
    return { books: parsed.books || [] };
  } catch (err) {
    if (err.code === "ENOENT") {
      return { books: [] };
    }
    throw err; // includes JSON parse errors
  }
}

// Write DB: always store { books: [...] }
async function writeDB(books) {
  const payload = { books };
  await fs.writeFile(BOOKS_FILE, JSON.stringify(payload, null, 2), "utf8");
}

// ✅ Exportable handler (for unit tests)
async function addBookHandler(req, res) {
  const { title, author, genre } = req.body;

  // basic validation
  if (!title || !author || !genre) {
    return res.status(400).json({
      success: false,
      message: "Title, author and genre are required.",
    });
  }

  try {
    const db = await readDB();
    const books = db.books;

    const newBook = {
      bookId: "B" + Date.now(),
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
    return res.status(500).json({
      success: false,
      message: "Server error while adding book.",
    });
  }
}

// Route
router.post("/add-book", addBookHandler);

// attach for tests (so require() still returns router)
router.addBookHandler = addBookHandler;

module.exports = router;
