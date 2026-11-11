import { SLOT_LABELS } from "../utils/reading.js";

export default function DeleteReadingDialog({ reading, onCancel, onConfirm }) {
  if (!reading) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) =>
        event.target === event.currentTarget && onCancel()
      }
    >
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
      >
        <p className="eyebrow">REMOVE READING</p>
        <h2 id="delete-title">Delete this reading?</h2>
        <p className="muted">
          {SLOT_LABELS[reading.slot]} · {reading.value} mg/dl
        </p>
        <div className="form-actions">
          <button className="secondary" onClick={onCancel}>
            Keep it
          </button>
          <button className="primary delete-action" onClick={onConfirm}>
            Delete reading
          </button>
        </div>
      </section>
    </div>
  );
}
