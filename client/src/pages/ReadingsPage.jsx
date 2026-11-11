import EmptyState from "../components/EmptyState.jsx";
import ReadingForm from "../components/ReadingForm.jsx";
import ReadingHistoryRow from "../components/ReadingHistoryRow.jsx";
import { groupReadingsByDate } from "../utils/reading.js";

export default function ReadingsPage({
  date,
  readings,
  loading,
  editing,
  onAdd,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR HISTORY</p>
          <h1>Readings</h1>
        </div>
        <button className="primary" onClick={onAdd}>
          ＋ Add reading
        </button>
      </div>
      {editing && !editing.id && (
        <ReadingForm
          initial={editing}
          date={date}
          onSave={(data) => onSave(data, editing)}
          onCancel={onCancel}
        />
      )}
      {loading ? (
        <div className="skeleton" />
      ) : (
        groupReadingsByDate(readings).map(([readingDate, dayReadings]) => (
          <section className="history-day" key={readingDate}>
            <h2>
              {new Date(`${readingDate}T12:00:00`).toLocaleDateString("en", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h2>
            {dayReadings.map((reading) => (
              <ReadingHistoryRow
                key={reading.id}
                reading={reading}
                editing={editing}
                onEdit={onEdit}
                onDelete={onDelete}
                onSave={onSave}
                onCancel={onCancel}
              />
            ))}
          </section>
        ))
      )}
      {!loading && readings.length === 0 && <EmptyState />}
    </>
  );
}
