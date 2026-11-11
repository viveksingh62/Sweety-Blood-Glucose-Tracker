import DatePicker from "../components/DatePicker.jsx";
import ReportSection from "../components/ReportSection.jsx";

const SECTIONS = [
  ["daily", "ONE DAY", "Daily"],
  ["month-to-date", "THIS MONTH SO FAR", "Month-to-date"],
  ["monthly", "LAST MONTH", "Monthly"],
];

export default function ReportsPage({
  date,
  onDateChange,
  reports,
  loading,
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">A WIDER VIEW</p>
          <h1>Your patterns</h1>
        </div>
        <DatePicker label="Through" value={date} onChange={onDateChange} />
      </div>
      {loading ? (
        <div className="skeleton" />
      ) : (
        SECTIONS.map(([type, eyebrow, title]) => (
          <ReportSection
            key={type}
            eyebrow={eyebrow}
            title={title}
            report={reports[type]}
          />
        ))
      )}
    </>
  );
}
