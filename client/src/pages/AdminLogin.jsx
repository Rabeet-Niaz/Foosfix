import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api, auth } from "../api/api.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Already logged in? Go straight to the dashboard.
  if (auth.get()) return <Navigate to="/admin/dashboard" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { token } = await api.adminLogin(username.trim(), password);
      auth.set(token);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="app">
      <div className="center">
        <form className="card login" onSubmit={onSubmit}>
          <h1>Admin</h1>

          <div className="field">
            <label htmlFor="user">Username</label>
            <input
              id="user"
              className="input"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="pass">Password</label>
            <input
              id="pass"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <span className="hint error">{error}</span>}

          <button className="btn" type="submit" disabled={busy || !username || !password}>
            {busy ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}