import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, me } from "../controllers/auth.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/schemas.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
router.post("/register", limiter, validate(registerSchema), register);
router.post("/login", limiter, validate(loginSchema), login);
router.get("/me", requireAuth, me);
export default router;
