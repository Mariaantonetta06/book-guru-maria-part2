require("./playwright-coverage");
const { test, expect } = require("@playwright/test");

const APP_URL = process.env.APP_URL || "http://localhost:5050";

test.describe("Frontend - Maria Add Book (coverage)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL, { waitUntil: "domcontentloaded" });
    
    // Click "Add Book" nav button to show the form
    await page.click('button.nav-btn:has-text("Add Book")');
    
    // Wait for the add section to become visible
    await page.waitForSelector('#add.section.active', { state: 'visible', timeout: 5000 });
    
    // Also wait for the form itself
    await page.waitForSelector('#addBookForm', { state: 'visible' });
  });

  test("Add Book success path triggers fetch + success handler", async ({ page }) => {
    // Mock backend API success
    await page.route("**/api/add-book", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Book added successfully",
          book: { 
            bookId: "B1234567890",
            title: "Atomic Habits", 
            author: "James Clear", 
            genre: "Self-Help",
            status: "Available"
          },
        }),
      });
    });

    // Fill the form fields
    await page.fill("#title", "Atomic Habits");
    await page.fill("#author", "James Clear");
    await page.fill("#genre", "Self-Help");

    // Wait for the submit button and click it
    const submitBtn = page.locator('#addBookForm button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    
    const reqPromise = page.waitForRequest("**/api/add-book");
    await submitBtn.click();

    // Verify the fetch was made with correct data
    const req = await reqPromise;
    const payload = req.postDataJSON();
    expect(payload).toEqual({
      title: "Atomic Habits",
      author: "James Clear",
      genre: "Self-Help",
    });

    // Wait for success alert
    await expect(page.locator('.alert-success, .alert.alert-success')).toBeVisible({ timeout: 3000 });
  });

  test("Validation path (missing required fields) blocks fetch", async ({ page }) => {
    let apiCalled = false;

    await page.route("**/api/add-book", async (route) => {
      apiCalled = true;
      await route.fulfill({ status: 201, contentType: "application/json", body: "{}" });
    });

    // ✅ Disable HTML5 validation so our JS validation runs
    await page.evaluate(() => {
      document.getElementById('title').removeAttribute('required');
      document.getElementById('author').removeAttribute('required');
      document.getElementById('genre').removeAttribute('required');
    });

    // Get the submit button
    const submitBtn = page.locator('#addBookForm button[type="submit"]');
    
    // Click submit WITHOUT filling fields
    await submitBtn.click();

    // Wait a bit to ensure validation runs
    await page.waitForTimeout(500);

    // Verify no API call was made
    expect(apiCalled).toBe(false);

    // Check for validation error message
    await expect(page.locator('text=Please fill all fields')).toBeVisible({ timeout: 3000 });
  });

  test("Server error path triggers error handler (500)", async ({ page }) => {
    // Mock backend 500 error
    await page.route("**/api/add-book", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ 
          success: false, 
          message: "Server error while adding book" 
        }),
      });
    });

    // Fill valid data
    await page.fill("#title", "Test Book");
    await page.fill("#author", "Test Author");
    await page.fill("#genre", "Test Genre");

    // Submit the form
    const submitBtn = page.locator('#addBookForm button[type="submit"]');
    await submitBtn.click();

    // Check for error alert
    await expect(page.locator('.alert-error, .alert.alert-error')).toBeVisible({ timeout: 3000 });
  });
});