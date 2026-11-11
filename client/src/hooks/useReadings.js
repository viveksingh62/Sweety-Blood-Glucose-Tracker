import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function useReadings(enabled) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api("/readings?limit=100");
      setReadings(result.readings);
    } catch (requestError) {
      setError(requestError?.error?.message || "Could not load your readings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) refresh();
    else setLoading(false);
  }, [enabled, refresh]);

  const save = useCallback(
    async (reading, editing) => {
      await api(`/readings${editing?.id ? `/${editing.id}` : ""}`, {
        method: editing?.id ? "PUT" : "POST",
        body: JSON.stringify(reading),
      });
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id) => {
      await api(`/readings/${id}`, { method: "DELETE" });
      await refresh();
    },
    [refresh],
  );

  return { readings, loading, error, refresh, save, remove };
}
