import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

export default function AuthPage({ signup = false }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await api(`/auth/${signup ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form)),
      });
      localStorage.setItem("sweety_token", result.token);
      localStorage.setItem("sweety_user", JSON.stringify(result.user));
      navigate("/");
    } catch (requestError) {
      setError(requestError?.error?.message || "Unable to sign in. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <section className="auth-note">
        <Link className="brand" to="/">
          sweety<span>·</span>
        </Link>
        <p className="eyebrow">YOUR HEALTH, IN YOUR HANDS</p>
        <h1>A little notebook for the numbers that matter.</h1>
        <p>
          A calm place to track your blood sugar and notice your patterns, one
          day at a time.
        </p>
      </section>
      <form className="auth-form" onSubmit={submit}>
        <p className="eyebrow">
          {signup ? "CREATE YOUR ACCOUNT" : "WELCOME TO SWEETY"}
        </p>
        <h2>{signup ? "Start your notebook" : "Sign in"}</h2>
        {signup && (
          <label>
            Your name
            <input name="name" required autoComplete="name" />
          </label>
        )}
        <label>
          Email address
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <div className="password">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength="8"
              autoComplete={signup ? "new-password" : "current-password"}
            />
            <button
              type="button"
              className="text-button"
              onClick={() => setShowPassword((shown) => !shown)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="primary full" disabled={busy}>
          {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
        </button>
        <p className="switch-auth">
          {signup ? "Already have an account?" : "New to Sweety?"}{" "}
          <Link to={signup ? "/login" : "/signup"}>
            {signup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </form>
    </main>
  );
}
