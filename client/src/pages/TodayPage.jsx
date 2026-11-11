import DatePicker from "../components/DatePicker.jsx";
import ReadingSlotCard from "../components/ReadingSlotCard.jsx";
import { SLOTS } from "../utils/reading.js";

export default function TodayPage({
  date,
  onDateChange,
  readings,
  loading,
  editing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}) {
  const dayReadings = readings.filter((reading) => reading.date === date);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR DAILY NOTEBOOK</p>
          <h1>Today, gently.</h1>
        </div>
        <DatePicker label="Choose a date" value={date} onChange={onDateChange} />
      </div>
      <p className="progress-line">
        <strong>{dayReadings.length} of 4</strong> readings logged <span>·</span>{" "}
        Keep noticing, one check at a time.
      </p>
      {loading ? (
        <div className="skeleton" />
      ) : (
        <div className="slot-grid">
          {SLOTS.map((slot, index) => (
            <ReadingSlotCard
              key={slot}
              slot={slot}
              index={index}
              date={date}
              reading={dayReadings.find((reading) => reading.slot === slot)}
              editing={editing}
              onEdit={onEdit}
              onDelete={onDelete}
              onSave={onSave}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </>
  );
}
