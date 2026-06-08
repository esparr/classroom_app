import { useState, useRef } from "react";
import { useApi } from "../hooks/useApi";

const STATUS_STYLES = {
  matched: { label: "Matched",     color: "var(--color-present)" },
  new:     { label: "New Student", color: "#2196f3" },
  review:  { label: "Review",      color: "var(--color-warning)" },
};

const MAX_RETRIES = 3;

export default function TakeAttendance() {
  const api = useApi();
  const [description, setDescription] = useState("");
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  // Voice recording
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);
  const retryCountRef = useRef(0);

  // Manual name entry
  const [manualName, setManualName] = useState("");

  // Name review list: [{ id, name, status }]
  const [pendingNames, setPendingNames] = useState([]);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [closing, setClosing] = useState(false);

  function addName(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPendingNames((prev) => [
      ...prev,
      { id: Date.now(), name: trimmed, status: "review" },
    ]);
  }

  async function handleStartSession() {
    setError(null);
    setStarting(true);
    try {
      const res = await api("/api/sessions/create/", {
        method: "POST",
        body: JSON.stringify({ description }),
      });
      if (!res || !res.ok) { setError("Failed to start session."); return; }
      const data = await res.json();
      setSession(data);
      setDescription("");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setStarting(false);
    }
  }

  function buildRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      retryCountRef.current = 0;
      const phrase = event.results[event.results.length - 1][0].transcript.trim();
      if (phrase) addName(phrase);
    };

    recognition.onerror = (event) => {
      if (event.error === "network" && retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        setError(`Speech network error — retrying (${retryCountRef.current}/${MAX_RETRIES})…`);
        setTimeout(() => {
          if (recognitionRef.current) {
            try { recognitionRef.current.start(); } catch {}
          }
        }, 1000);
      } else {
        setError(
          event.error === "network"
            ? "Speech recognition unavailable. Use the text field below to add names."
            : `Speech error: ${event.error}`
        );
        setRecording(false);
      }
    };

    recognition.onend = () => {
      // Only mark as stopped if we're not mid-retry
      if (retryCountRef.current === 0) setRecording(false);
    };

    return recognition;
  }

  function startRecording() {
    const recognition = buildRecognition();
    if (!recognition) {
      setError("Speech recognition is not supported in this browser. Use the text field below.");
      return;
    }
    setError(null);
    retryCountRef.current = 0;
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  function stopRecording() {
    retryCountRef.current = 0;
    recognitionRef.current?.stop();
    setRecording(false);
  }

  function handleManualAdd(e) {
    e.preventDefault();
    addName(manualName);
    setManualName("");
  }

  function updateName(id, newName) {
    setPendingNames((prev) =>
      prev.map((e) => (e.id === id ? { ...e, name: newName } : e))
    );
  }

  function updateStatus(id, newStatus) {
    setPendingNames((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );
  }

  function removeName(id) {
    setPendingNames((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleSubmitAttendance() {
    if (!pendingNames.length) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await api(`/api/sessions/${session.id}/attendance/bulk/`, {
        method: "POST",
        body: JSON.stringify({ names: pendingNames.map((e) => e.name) }),
      });
      if (!res || !res.ok) { setError("Failed to submit attendance."); return; }
      const data = await res.json();
      setSummary(data);
      setPendingNames([]);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCloseSession() {
    setError(null);
    setClosing(true);
    try {
      const res = await api(`/api/sessions/${session.id}/close/`, {
        method: "PATCH",
      });
      if (!res || !res.ok) { setError("Failed to close session."); return; }
      setSession(null);
      setPendingNames([]);
      setSummary(null);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setClosing(false);
    }
  }

  if (session) {
    return (
      <article>
        <header>
          <h2>Session #{session.id}</h2>
          {session.description && <p>{session.description}</p>}
        </header>

        <section>
          <h3>Add Names</h3>
          {error && <p style={{ color: "var(--color-absent)" }}>{error}</p>}

          <button onClick={recording ? stopRecording : startRecording}>
            {recording ? "⏹ Stop Recording" : "🎤 Start Recording"}
          </button>
          {recording && <p><em>Listening… speak a name after each pause.</em></p>}

          <form onSubmit={handleManualAdd} style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Type a name and press Enter"
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={!manualName.trim()}>Add</button>
          </form>
        </section>

        {pendingNames.length > 0 && (
          <section>
            <h3>Captured Names ({pendingNames.length})</h3>
            <table className="table-cards">
              <thead>
                <tr><th>Name</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {pendingNames.map((entry) => {
                  const style = STATUS_STYLES[entry.status] || STATUS_STYLES.review;
                  return (
                    <tr key={entry.id}>
                      <td data-label="Name">
                        <input
                          type="text"
                          value={entry.name}
                          onChange={(e) => updateName(entry.id, e.target.value)}
                        />
                      </td>
                      <td data-label="Status">
                        <select
                          value={entry.status}
                          onChange={(e) => updateStatus(entry.id, e.target.value)}
                          style={{ color: style.color, fontWeight: "bold" }}
                        >
                          {Object.entries(STATUS_STYLES).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                          ))}
                        </select>
                      </td>
                      <td data-label="Remove">
                        <button onClick={() => removeName(entry.id)}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button onClick={handleSubmitAttendance} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Attendance"}
            </button>
          </section>
        )}

        {summary && (
          <section>
            <h3>Attendance Submitted</h3>
            <p>
              <span style={{ color: "var(--color-present)" }}>
                ✓ {summary.matched?.length ?? 0} matched
              </span>
              {" · "}
              <span style={{ color: "#2196f3" }}>
                + {summary.created?.length ?? 0} new profiles created
              </span>
            </p>
            {summary.created?.length > 0 && (
              <details>
                <summary>New students added</summary>
                <ul>
                  {summary.created.map((name) => <li key={name}>{name}</li>)}
                </ul>
              </details>
            )}
          </section>
        )}

        <footer>
          <button onClick={handleCloseSession} disabled={closing}>
            {closing ? "Closing…" : "Close Session"}
          </button>
        </footer>
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
