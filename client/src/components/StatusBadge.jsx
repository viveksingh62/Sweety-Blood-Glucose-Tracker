import { glucoseStatus } from "../utils/reading.js";

export default function StatusBadge({ value }) {
  const status = glucoseStatus(value);
  return (
    <span className={`status ${status.tone}`}>
      <i />
      {status.label}
    </span>
  );
}
