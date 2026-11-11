import { pool } from "../config/db.js";
import { todayInTimezone } from "../utils/dateRanges.js";
import { SLOT_LABELS } from "../utils/slots.js";
import { AppError } from "../utils/errors.js";
const invalid = (message, field = "value") =>
  new AppError(400, "VALIDATION_ERROR", message, field);
export async function saveReading(userId, data, id = null) {
  if (data.value === undefined || data.value === null || data.value === "")
    throw invalid("Please enter a glucose value.");
  const value =
    typeof data.value === "number" ? data.value : Number(data.value);
  if (!Number.isInteger(value) || value < 40 || value > 600)
    throw invalid("Value must be between 40 and 600 mg/dl.");
  const today = todayInTimezone(process.env.APP_TIMEZONE || "Asia/Kolkata");
  if (data.date > today) throw invalid("Date cannot be in the future.", "date");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [userId]);
    const existing = await client.query(
      "SELECT id FROM readings WHERE user_id=$1 AND reading_date=$2 AND slot=$3 AND ($4::int IS NULL OR id<>$4) FOR UPDATE",
      [userId, data.date, data.slot, id],
    );
    const count = await client.query(
      "SELECT count(*)::int AS n FROM readings WHERE user_id=$1 AND reading_date=$2 AND ($3::int IS NULL OR id<>$3)",
      [userId, data.date, id],
    );
    if (count.rows[0].n >= 4)
      throw new AppError(
        409,
        "DAILY_LIMIT",
        "You can add only 4 readings per day.",
        "date",
      );
    if (existing.rowCount)
      throw new AppError(
        409,
        "DUPLICATE_SLOT",
        `You already have an ${SLOT_LABELS[data.slot]} reading for this date.`,
        "slot",
      );
    let result;
    if (id) {
      result = await client.query(
        "UPDATE readings SET reading_date=$1,slot=$2,value=$3,updated_at=now() WHERE id=$4 AND user_id=$5 RETURNING id,reading_date AS date,slot,value",
        [data.date, data.slot, value, id, userId],
      );
      if (!result.rowCount)
        throw new AppError(404, "NOT_FOUND", "Reading not found.");
    } else
      result = await client.query(
        "INSERT INTO readings(user_id,reading_date,slot,value) VALUES($1,$2,$3,$4) RETURNING id,reading_date AS date,slot,value",
        [userId, data.date, data.slot, value],
      );
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505")
      throw new AppError(
        409,
        "DUPLICATE_SLOT",
        `You already have an ${SLOT_LABELS[data.slot]} reading for this date.`,
        "slot",
      );
    throw error;
  } finally {
    client.release();
  }
}
export async function listReadings(userId, { date, page = 1, limit = 20 }) {
  const size = Math.min(100, Math.max(1, Number(limit) || 20)),
    offset = (Math.max(1, Number(page) || 1) - 1) * size;
  const result = await pool.query(
    `SELECT id,reading_date AS date,slot,value FROM readings WHERE user_id=$1 AND ($2::date IS NULL OR reading_date=$2) ORDER BY reading_date DESC, array_position(ARRAY['morning','after_breakfast','after_lunch','after_dinner'],slot) LIMIT $3 OFFSET $4`,
    [userId, date || null, size, offset],
  );
  return {
    readings: result.rows,
    page: Math.max(1, Number(page) || 1),
    limit: size,
  };
}
export async function deleteReading(userId, id) {
  const r = await pool.query(
    "DELETE FROM readings WHERE user_id=$1 AND id=$2",
    [userId, id],
  );
  if (!r.rowCount) throw new AppError(404, "NOT_FOUND", "Reading not found.");
}
export async function getReport(userId, type, date) {
  const { getDateRange } = await import("../utils/dateRanges.js");
  const range = getDateRange(type, date);
  const [stats, readings] = await Promise.all([
    pool.query(
      "SELECT count(*)::int AS count,max(value)::int AS highest,min(value)::int AS lowest,round(avg(value),1)::float AS average FROM readings WHERE user_id=$1 AND reading_date BETWEEN $2 AND $3",
      [userId, range.from, range.to],
    ),
    type === "daily"
      ? pool.query(
          "SELECT id,reading_date AS date,slot,value FROM readings WHERE user_id=$1 AND reading_date=$2 ORDER BY array_position(ARRAY['morning','after_breakfast','after_lunch','after_dinner'],slot)",
          [userId, date],
        )
      : Promise.resolve({ rows: [] }),
  ]);
  const row = stats.rows[0];
  return {
    range,
    count: row.count,
    highest: row.highest,
    lowest: row.lowest,
    average: row.average,
    ...(type === "daily"
      ? {
          readings: readings.rows.map((r) => ({
            ...r,
            label: SLOT_LABELS[r.slot],
          })),
        }
      : {}),
  };
}
