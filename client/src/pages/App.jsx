import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import AuthPage from "../components/AuthPage.jsx";
import AppShell from "../components/AppShell.jsx";
import DeleteReadingDialog from "../components/DeleteReadingDialog.jsx";
import { todayInAppTimezone } from "../utils/reading.js";
import useReadings from "../hooks/useReadings.js";
import useReports from "../hooks/useReports.js";
import TodayPage from "./TodayPage.jsx";
import ReadingsPage from "./ReadingsPage.jsx";
import ReportsPage from "./ReportsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage signup />} />
      <Route path="*" element={<NotebookApp />} />
    </Routes>
  );
}

function NotebookApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("sweety_user") || "null"),
  );
  const [date, setDate] = useState(todayInAppTimezone());
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const isAuthenticated = Boolean(localStorage.getItem("sweety_token"));
  const {
    readings,
    loading: readingsLoading,
    error: readingsError,
    save: saveReading,
    remove: deleteReading,
  } = useReadings(isAuthenticated);
  const {
    reports,
    loading: reportsLoading,
    error: reportsError,
  } = useReports(location.pathname === "/reports" && isAuthenticated, date);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCurrentUser();

    async function fetchCurrentUser() {
      try {
        const result = await api("/auth/me");
        setUser(result.user);
        localStorage.setItem("sweety_user", JSON.stringify(result.user));
      } catch {
        // The request wrapper redirects to login if the token has expired.
      }
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  async function save(data, readingBeingEdited = editing) {
    try {
      await saveReading(data, readingBeingEdited);
      setEditing(null);
      showToast("Reading saved");
    } catch (error) {
      throw error;
    }
  }

  async function remove() {
    try {
      await deleteReading(confirmDelete.id);
      setConfirmDelete(null);
      showToast("Reading deleted");
    } catch (error) {
      setConfirmDelete(null);
      showToast(error?.error?.message || "Could not delete this reading.");
    }
  }

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  }

  function signOut() {
    localStorage.removeItem("sweety_token");
    localStorage.removeItem("sweety_user");
    setAccountMenuOpen(false);
    setUser(null);
    navigate("/login");
  }

  const pageProps = {
    date,
    onDateChange: setDate,
    readings,
    loading: readingsLoading,
    editing,
    onEdit: setEditing,
    onDelete: setConfirmDelete,
    onSave: save,
    onCancel: () => setEditing(null),
  };

  return (
    <AppShell
      user={user}
      toast={toast}
      accountMenuOpen={accountMenuOpen}
      onToggleAccountMenu={() => setAccountMenuOpen((open) => !open)}
      onSignOut={signOut}
    >
      {(readingsError || reportsError) && (
        <p className="error" role="alert">
          {readingsError || reportsError}
        </p>
      )}
      {location.pathname === "/" && <TodayPage {...pageProps} />}
      {location.pathname === "/readings" && (
        <ReadingsPage
          {...pageProps}
          onAdd={() => setEditing({ date, slot: "morning" })}
        />
      )}
      {location.pathname === "/reports" && (
        <ReportsPage
          date={date}
          onDateChange={setDate}
          reports={reports}
          loading={reportsLoading}
        />
      )}
      <DeleteReadingDialog
        reading={confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={remove}
      />
    </AppShell>
  );
}
