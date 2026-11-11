import { SLOT_LABELS } from "../utils/reading.js";
import StatusBadge from "./StatusBadge.jsx";
import ReadingForm from "./ReadingForm.jsx";

export default function ReadingHistoryRow({
  reading,
  editing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}) {
  return (
    <div className="history-row" key={reading.id}>
      <span className="history-slot">{SLOT_LABELS[reading.slot]}</span>
      <strong>
        {reading.value}
        <small> mg/dl</small>
      </strong>
      <StatusBadge value={reading.value} />
      <button className="text-button" onClick={() => onEdit(reading)}>
        Edit
      </button>
      <button
        className="text-button danger"
        onClick={() => onDelete(reading)}
      >
        Delete
      </button>
      {editing?.id === reading.id && (
        <ReadingForm
          initial={editing}
          date={reading.date}
          onSave={(data) => onSave(data, editing)}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}
