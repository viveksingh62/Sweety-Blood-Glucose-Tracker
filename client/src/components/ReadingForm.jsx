import { useState } from "react";
import { SLOT_LABELS, SLOTS, todayInAppTimezone } from "../utils/reading.js";

export default function ReadingForm({ initial, date, onSave, onCancel }) {
  const [data, setData] = useState({
    date: initial?.date || date,
    slot: initial?.slot || "morning",
    value: initial?.value ?? "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const value = Number(data.value);
    if (!data.value) return setError("Please enter a glucose value.");
    if (!Number.isInteger(value) || value < 40 || value > 600) {
      return setError("Value must be between 40 and 600 mg/dl.");
    }

    setError("");
    setBusy(true);
    try {
      await onSave({ ...data, value });
      onCancel();
    } catch (saveError) {
      setError(saveError?.error?.message || "Could not save this reading.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="reading-form" onSubmit={submit}>
      <label>
        Date
        <input
          aria-label="Reading date"
          type="date"
          max={todayInAppTimezone()}
          required
          value={data.date}
          onChange={(event) => setData({ ...data, date: event.target.value })}
        />
      </label>
      <label>
        Time of day
        <select
          aria-label="Reading slot"
          value={data.slot}
          onChange={(event) => setData({ ...data, slot: event.target.value })}
        >
          {SLOTS.map((slot) => (
            <option key={slot} value={slot}>
              {SLOT_LABELS[slot]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Glucose value <span className="muted">mg/dl</span>
        <input
          aria-label="Glucose value"
          inputMode="numeric"
          type="number"
          min="40"
          max="600"
          step="1"
          placeholder="e.g. 112"
          value={data.value}
          onChange={(event) => setData({ ...data, value: event.target.value })}
        />
        {error && (
          <span className="error" role="alert" aria-live="polite">
            {error}
          </span>
        )}
      </label>
      <div className="form-actions">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary" disabled={busy}>
          {busy ? "Saving…" : initial ? "Save changes" : "Save reading"}
        </button>
      </div>
    </form>
  );
}
