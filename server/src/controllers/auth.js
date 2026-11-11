import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { AppError } from "../utils/errors.js";
const tokenFor = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
export async function register(req, res) {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const r = await pool.query(
      "INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email",
      [name, email, hash],
    );
    res.status(201).json({ user: r.rows[0], token: tokenFor(r.rows[0]) });
  } catch (e) {
    if (e.code === "23505")
      throw new AppError(
        409,
        "EMAIL_TAKEN",
        "An account with this email already exists.",
        "email",
      );
    throw e;
  }
}
export async function login(req, res) {
  const r = await pool.query(
    "SELECT id,name,email,password_hash FROM users WHERE email=$1",
    [req.body.email],
  );
  const u = r.rows[0];
  if (!u || !(await bcrypt.compare(req.body.password, u.password_hash)))
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Email or password is incorrect.",
    );
  const { password_hash, ...user } = u;
  res.json({ user, token: tokenFor(user) });
}
export async function me(req, res) {
  const r = await pool.query("SELECT id,name,email FROM users WHERE id=$1", [
    req.user.id,
  ]);
  if (!r.rowCount)
    throw new AppError(401, "UNAUTHORIZED", "Please log in to continue.");
  res.json({ user: r.rows[0] });
}
