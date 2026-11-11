import { SLOT_LABELS } from "../utils/reading.js";
import StatusBadge from "./StatusBadge.jsx";
import ReadingForm from "./ReadingForm.jsx";

export default function ReadingSlotCard({
  slot,
  index,
  date,
  reading,
  editing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}) {
  return (
    <article className={`slot-card ${reading ? "filled" : "empty"}`}>
      <div className="slot-top">
        <span className="slot-index">{String(index + 1).padStart(2, "0")}</span>
        <span>{SLOT_LABELS[slot]}</span>
      </div>
      {reading ? (
        <>
          <div className="reading-value">
            {reading.value}
            <small> mg/dl</small>
          </div>
          <StatusBadge value={reading.value} />
          <div className="card-actions">
            <button className="text-button" onClick={() => onEdit(reading)}>
              Edit
            </button>
            <button
              className="text-button danger"
              onClick={() => onDelete(reading)}
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <div className="add-slot">
          <p>No reading yet</p>
          <button
            className="secondary"
            onClick={() => onEdit({ date, slot })}
          >
            ＋ &nbsp;Add reading
          </button>
        </div>
      )}
      {editing?.slot === slot && editing.date === date && (
        <ReadingForm
          key={`${editing.id || "new"}-${editing.slot}`}
          initial={editing.id ? editing : null}
          date={date}
          onSave={(data) => onSave(data, editing)}
          onCancel={onCancel}
        />
      )}
    </article>
  );
}
