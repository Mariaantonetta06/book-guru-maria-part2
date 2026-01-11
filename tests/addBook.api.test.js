// tests/addBook.api.test.js
const request = require("supertest");
const fs = require("fs");
const path = require("path");

const { app } = require("../index.js");

describe("POST /api/add-book", () => {
  const LIBRARY_PATH = path.join(__dirname, "..", "utils", "library.json");

  let originalLibraryJson = null;
  let consoleErrorSpy = null;

  beforeAll(() => {
    // silence expected errors (corrupted JSON test)
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // backup original file
    originalLibraryJson = fs.readFileSync(LIBRARY_PATH, "utf8");
  });

  afterAll(() => {
    // restore library.json
    if (originalLibraryJson !== null) {
      fs.writeFileSync(LIBRARY_PATH, originalLibraryJson, "utf8");
    }
    if (consoleErrorSpy) consoleErrorSpy.mockRestore();
  });

  test("returns 400 when missing required fields", async () => {
    const res = await request(app).post("/api/add-book").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("returns 201 when valid and includes a new book", async () => {
    const validBook = {
      title: "Test Book",
      author: "Test Author",
      genre: "Fiction",
    };

    const res = await request(app).post("/api/add-book").send(validBook);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    expect(res.body.book.status).toBe("Available");
    expect(res.body.book.bookId).toMatch(/^B\d+$/);
  });

  test("returns 500 when library.json is corrupted", async () => {
    // corrupt file
    fs.writeFileSync(LIBRARY_PATH, "THIS IS NOT JSON", "utf8");

    const res = await request(app).post("/api/add-book").send({
      title: "Will Fail",
      author: "X",
      genre: "Fiction",
    });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);

    // restore immediately so it doesn't affect other stuff
    fs.writeFileSync(LIBRARY_PATH, originalLibraryJson, "utf8");
  });
});
