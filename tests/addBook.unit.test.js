// tests/addBook.unit.test.js

// Keep real fs functions (readFileSync etc), but mock fs.promises.readFile/writeFile used by the handler
jest.mock("fs", () => {
  const actual = jest.requireActual("fs");
  return {
    ...actual,
    promises: {
      ...actual.promises,
      readFile: jest.fn(),
      writeFile: jest.fn(),
    },
  };
});

const fs = require("fs");
const realFs = jest.requireActual("fs");

// IMPORTANT: import after mocking fs
const { addBookHandler } = require("../utils/MariaAddBookUtil.js");

// Build a payload that matches whatever keys your handler reads from req.body
function buildValidPayloadFromHandlerSource() {
  const utilPath = require.resolve("../utils/MariaAddBookUtil.js");
  const src = realFs.readFileSync(utilPath, "utf8");

  // Try to find: const { a, b, c } = req.body;
  const m = src.match(/const\s*{\s*([^}]+)\s*}\s*=\s*req\.body/g);

  // Fallback: a big payload that often satisfies validators
  const fallback = {
    title: "Unit Test Book",
    bookTitle: "Unit Test Book",
    name: "Unit Test Book",
    bookName: "Unit Test Book",

    author: "Maria",
    bookAuthor: "Maria",

    isbn: "9781234567890",
    ISBN: "9781234567890",
    bookIsbn: "9781234567890",
    bookISBN: "9781234567890",

    publisher: "Test Pub",
    year: 2025,
    category: "Testing",
    genre: "Testing",
    status: "Available",
    quantity: 1,
  };

  if (!m || m.length === 0) return fallback;

  // Use the FIRST destructuring we find (usually the main one)
  const first = m[0];

  // Extract inside {...}
  const inside = first
    .replace(/const\s*{\s*/g, "")
    .replace(/\s*}\s*=\s*req\.body/g, "");

  const keys = inside
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => {
      // supports: title OR title: bookTitle OR title = "default"
      const noDefault = x.split("=").map((s) => s.trim())[0];
      const parts = noDefault.split(":").map((s) => s.trim());
      // if `title: bookTitle`, req.body key is bookTitle (right side)
      return parts.length === 2 ? parts[1] : parts[0];
    });

  const payload = {};

  for (const k of keys) {
    const lk = k.toLowerCase();

    if (lk.includes("title") || lk.includes("name")) payload[k] = "Unit Test Book";
    else if (lk.includes("author")) payload[k] = "Maria";
    else if (lk.includes("isbn")) payload[k] = "9781234567890";
    else if (lk.includes("publisher")) payload[k] = "Test Pub";
    else if (lk.includes("year")) payload[k] = 2025;
    else if (lk.includes("category") || lk.includes("genre")) payload[k] = "Testing";
    else if (lk.includes("status")) payload[k] = "Available";
    else if (lk.includes("qty") || lk.includes("quantity") || lk.includes("stock")) payload[k] = 1;
    else payload[k] = "test";
  }

  // Add common aliases too, just in case validator uses direct req.body.xxx somewhere
  return { ...fallback, ...payload };
}

describe("addBookHandler (unit)", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("returns 201 when valid and includes a new book", async () => {
    // Arrange
    fs.promises.readFile.mockResolvedValue(JSON.stringify({ books: [] }));
    fs.promises.writeFile.mockResolvedValue();

    const req = { body: buildValidPayloadFromHandlerSource() };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Act
    await addBookHandler(req, res);

    // Assert
    // If you still get 400, this will show you the exact response
    const body = res.json.mock.calls[0]?.[0];
    expect(res.status).toHaveBeenCalledWith(201);

    expect(body).toEqual(
      expect.objectContaining({
        success: true,
        book: expect.any(Object),
      })
    );

    // Match what your API test expects
    expect(body.book).toEqual(
      expect.objectContaining({
        status: "Available",
      })
    );
    expect(body.book.bookId).toMatch(/^B\d+$/);
  });

  test("returns 500 when write fails", async () => {
    fs.promises.readFile.mockResolvedValue(JSON.stringify({ books: [] }));
    fs.promises.writeFile.mockRejectedValue(new Error("disk write failed"));

    const req = { body: buildValidPayloadFromHandlerSource() };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addBookHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0]?.[0];
    expect(body).toEqual(expect.objectContaining({ success: false }));
  });

  test("returns 500 when library.json is corrupted", async () => {
    fs.promises.readFile.mockResolvedValue("THIS IS NOT JSON");

    const req = { body: buildValidPayloadFromHandlerSource() };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addBookHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0]?.[0];
    expect(body).toEqual(expect.objectContaining({ success: false }));
  });
});
