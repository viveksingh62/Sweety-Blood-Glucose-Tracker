import EmptyState from "./EmptyState.jsx";
import StatusBadge from "./StatusBadge.jsx";

export default function ReportSection({ eyebrow, title, report }) {
  return (
    <section className="report-section">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="muted">
        {report
          ? `${report.range.from} — ${report.range.to}`
          : "Choose a date to view this period"}
      </p>
      {report && report.count > 0 ? (
        <>
          <div className="stats">
            {[
              ["Highest", report.highest],
              ["Lowest", report.lowest],
              ["Average", report.average],
              ["Readings", report.count],
            ].map(([label, value]) => (
              <div className="stat" key={label}>
                <span>{label}</span>
                <strong>
                  {value}
                  {label !== "Readings" && <small> mg/dl</small>}
                </strong>
              </div>
            ))}
          </div>
          {report.readings?.map((reading) => (
            <div className="history-row" key={reading.id}>
              <span>{reading.label}</span>
              <strong>{reading.value} mg/dl</strong>
              <StatusBadge value={reading.value} />
            </div>
          ))}
        </>
      ) : (
        report && <EmptyState />
      )}
    </section>
  );
}
