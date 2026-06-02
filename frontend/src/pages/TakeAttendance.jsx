import { useState } from "react";
import { useApi } from "../hooks/useApi";

export default function TakeAttendance() {
  const api = useApi();
  const [description, setDescription] = useState("");
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  async function handleStartSession() {
    setError(null);
    setStarting(true);
    try {
      const res = await api("/api/sessions/create/", {
        method: "POST",
        body: JSON.stringify({ description }),
      });
      if (!res || !res.ok) {
        setError("Failed to start session.");
        return;
      }
      const data = await res.json();
      setSession(data);
      setDescription("");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setStarting(false);
    }
  }

  if (session) {
    return (
      <article>
        <header>
          <h2>Session #{session.id}</h2>
          {session.description && <p>{session.description}</p>}
        </header>
        <p>Session started. Recording and attendance coming next.</p>
      </article>
    );
  }

  return (
    <article>
      <h2>Take Attendance</h2>
      <label>
        Description (optional)
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Monday 6am class"
        />
      </label>
      {error && <p style={{ color: "var(--color-absent)" }}>{error}</p>}
      <button onClick={handleStartSession} disabled={starting}>
        {starting ? "Starting…" : "Start Session"}
      </button>
    </article>
  );
}
