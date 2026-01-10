const request = require("supertest");
const { app } = require("../index");

describe("POST /api/add-book", () => {
  test("returns 400 when missing required fields", async () => {
    const res = await request(app)
      .post("/api/add-book")
      .send({ title: "Test", author: "Maria" }); // genre missing

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
