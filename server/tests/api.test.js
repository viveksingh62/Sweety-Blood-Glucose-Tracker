import "../src/config/env.js";
import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
const hasTestDb = !!process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = "test";
if (hasTestDb) process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const [{ default: app }, { pool }] = await Promise.all([
  import("../src/index.js"),
  import("../src/config/db.js"),
]);
let token, otherToken;
before(async () => {
  if (!hasTestDb) return;
  await pool.query("DELETE FROM users WHERE email LIKE $1", [
    "test-%@sweety.test",
  ]);
  const a = await request(app)
    .post("/auth/register")
    .send({
      name: "Test User",
      email: "test-one@sweety.test",
      password: "Testing123",
    });
  assert.equal(a.status, 201);
  token = a.body.token;
  const b = await request(app)
    .post("/auth/register")
    .send({
      name: "Other User",
      email: "test-two@sweety.test",
      password: "Testing123",
    });
  assert.equal(b.status, 201);
  otherToken = b.body.token;
});
after(async () => {
  if (hasTestDb) {
    await pool.query("DELETE FROM users WHERE email LIKE $1", [
      "test-%@sweety.test",
    ]);
    await pool.end();
  }
});
test(
  "register, login and reject invalid credentials",
  { skip: !hasTestDb },
  async () => {
    const login = await request(app)
      .post("/auth/login")
      .send({ email: "test-one@sweety.test", password: "Testing123" });
    assert.equal(login.status, 200);
    assert.equal(
      (
        await request(app)
          .post("/auth/login")
          .send({ email: "test-one@sweety.test", password: "wrong-pass" })
      ).body.error.message,
      "Email or password is incorrect.",
    );
  },
);
test(
  "readings stay private and validation checks value, future date, daily limit and duplicate slot",
  { skip: !hasTestDb },
  async () => {
    const post = (body) =>
      request(app)
        .post("/readings")
        .set("Authorization", `Bearer ${token}`)
        .send(body);
    assert.equal(
      (await post({ date: "2026-10-20", slot: "morning" })).body.error.message,
      "Please enter a glucose value.",
    );
    assert.equal(
      (await post({ date: "2026-10-20", slot: "morning", value: 39 })).body
        .error.message,
      "Value must be between 40 and 600 mg/dl.",
    );
    assert.equal(
      (await post({ date: "2999-01-01", slot: "morning", value: 100 })).body
        .error.message,
      "Date cannot be in the future.",
    );
    const date = "2020-01-02",
      made = [];
    for (const slot of ["morning", "after_breakfast", "after_lunch"])
      made.push((await post({ date, slot, value: 100 })).body.reading);
    assert.equal(
      (await post({ date, slot: "morning", value: 101 })).body.error.message,
      "You already have an Morning (fasting) reading for this date.",
    );
    made.push(
      (await post({ date, slot: "after_dinner", value: 100 })).body.reading,
    );
    assert.equal(
      (await post({ date: "2020-01-02", slot: "morning", value: 101 })).body
        .error.message,
      "You can add only 4 readings per day.",
    );
    assert.equal(
      (
        await request(app)
          .get("/readings")
          .set("Authorization", `Bearer ${otherToken}`)
      ).body.readings.length,
      0,
    );
    assert.equal(
      (
        await request(app)
          .put(`/readings/${made[0].id}`)
          .set("Authorization", `Bearer ${otherToken}`)
          .send({ date, slot: "morning", value: 120 })
      ).status,
      404,
    );
    assert.equal(
      (
        await request(app)
          .delete(`/readings/${made[0].id}`)
          .set("Authorization", `Bearer ${otherToken}`)
      ).status,
      404,
    );
    const edit = await request(app)
      .put(`/readings/${made[0].id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ date, slot: "morning", value: 120 });
    assert.equal(edit.status, 200);
  },
);
test(
  "daily report numbers and empty report are correct",
  { skip: !hasTestDb },
  async () => {
    const auth = { Authorization: `Bearer ${token}` };
    const result = await request(app)
      .get("/reports/daily?date=2020-01-02")
      .set(auth);
    assert.equal(result.body.count, 4);
    assert.equal(result.body.highest, 120);
    assert.equal(result.body.lowest, 100);
    assert.equal(result.body.average, 105);
    assert.equal(result.body.readings.length, 4);
    const empty = await request(app)
      .get("/reports/daily?date=2020-01-04")
      .set(auth);
    assert.equal(empty.body.count, 0);
    assert.equal(empty.body.highest, null);
    assert.equal(empty.body.lowest, null);
    assert.equal(empty.body.average, null);
  },
);
