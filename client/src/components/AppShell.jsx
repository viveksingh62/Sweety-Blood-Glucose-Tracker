import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  ["/", "Today"],
  ["/readings", "Readings"],
  ["/reports", "Reports"],
];

export default function AppShell({
  user,
  children,
  toast,
  accountMenuOpen,
  onToggleAccountMenu,
  onSignOut,
}) {
  const location = useLocation();

  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" to="/">
          sweety<span>·</span>
        </Link>
        <nav aria-label="Main navigation">
          {NAV_ITEMS.map(([path, label]) => (
            <Link
              key={path}
              className={location.pathname === path ? "active" : ""}
              to={path}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="account-wrap">
          <button
            className="user-menu"
            onClick={onToggleAccountMenu}
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
          >
            {user?.name?.split(" ")[0] || "Account"}{" "}
            <span className="avatar">
              {user?.name?.[0]?.toUpperCase() || "S"}
            </span>
          </button>
          {accountMenuOpen && (
            <div className="account-popover" role="menu">
              <span className="account-email">{user?.email}</span>
              <button role="menuitem" onClick={onSignOut}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="content">{children}</main>
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
      <footer className="footer">
        A quieter way to keep track. <span>Sweety ·</span>
      </footer>
    </div>
  );
}
