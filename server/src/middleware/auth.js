import jwt from "jsonwebtoken";
import { AppError } from "../utils/errors.js";
export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  try {
    if (!token) throw new Error();
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new AppError(401, "UNAUTHORIZED", "Please log in to continue."));
  }
}
