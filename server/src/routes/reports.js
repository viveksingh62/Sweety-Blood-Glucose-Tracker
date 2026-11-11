import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getReport } from "../services/readings.js";
import { todayInTimezone } from "../utils/dateRanges.js";
import { AppError } from "../utils/errors.js";
const r = Router();
r.use(requireAuth);
for (const [path, type] of [
  ["daily", "daily"],
  ["month-to-date", "month-to-date"],
  ["monthly", "monthly"],
])
  r.get(`/${path}`, async (req, res, next) => {
    try {
      const date =
        req.query.date ||
        todayInTimezone(process.env.APP_TIMEZONE || "Asia/Kolkata");
      const parsed = new Date(`${date}T00:00:00Z`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(parsed.getTime()) ||
        parsed.toISOString().slice(0, 10) !== date
      )
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "Please enter a valid date.",
          "date",
        );
      if (date > todayInTimezone(process.env.APP_TIMEZONE || "Asia/Kolkata"))
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          "Date cannot be in the future.",
          "date",
        );
      res.json(await getReport(req.user.id, type, date));
    } catch (e) {
      next(e);
    }
  });
export default r;
