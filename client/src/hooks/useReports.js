import { useEffect, useState } from "react";
import { api } from "../api/client.js";

const REPORT_TYPES = ["daily", "month-to-date", "monthly"];

export default function useReports(enabled, date) {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) return undefined;

    let current = true;
    setLoading(true);
    setError("");
    Promise.all(
      REPORT_TYPES.map(async (type) => [
        type,
        await api(`/reports/${type}?date=${date}`),
      ]),
    )
      .then((entries) => {
        if (current) setReports(Object.fromEntries(entries));
      })
      .catch((requestError) => {
        if (current)
          setError(requestError?.error?.message || "Could not load your reports.");
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [enabled, date]);

  return { reports, loading, error };
}
