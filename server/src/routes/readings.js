import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { readingSchema, idParamsSchema } from "../validators/schemas.js";
import {
  saveReading,
  listReadings,
  deleteReading,
} from "../services/readings.js";
const r = Router();
r.use(requireAuth);
r.get("/", async (req, res, next) => {
  try {
    if (req.query.date && !/^\d{4}-\d{2}-\d{2}$/.test(req.query.date))
      return res
        .status(400)
        .json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Please enter a valid date.",
            field: "date",
          },
        });
    res.json(await listReadings(req.user.id, req.query));
  } catch (e) {
    next(e);
  }
});
r.post("/", validate(readingSchema), async (req, res) =>
  res.status(201).json({ reading: await saveReading(req.user.id, req.body) }),
);
r.put(
  "/:id",
  validate(idParamsSchema, "params"),
  validate(readingSchema),
  async (req, res) =>
    res.json({
      reading: await saveReading(req.user.id, req.body, req.params.id),
    }),
);
r.delete("/:id", validate(idParamsSchema, "params"), async (req, res) => {
  await deleteReading(req.user.id, req.params.id);
  res.status(204).end();
});
export default r;
