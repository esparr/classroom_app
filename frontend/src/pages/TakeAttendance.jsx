import { useState, useRef } from "react";
import { useApi } from "../hooks/useApi";

const STATUS_STYLES = {
  matched:    { label: "Matched",     color: "var(--color-present)" },
  new:        { label: "New Student", color: "#2196f3" },
  review:     { label: "Review",      color: "var(--color-warning)" },
};

export default function TakeAttendance() {
  const api = useApi();
  const [description, setDescription] = useState("");
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  // Voice recording
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Name review list: [{ id, name, status }]
  const [pendingNames, setPendingNames] = useState([]);

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

  function startRecording() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const phrase = lastResult[0].transcript.trim();
      if (phrase) {
        setPendingNames((prev) => [
          ...prev,
          { id: Date.now(), name: phrase, status: "review" },
        ]);
      }
    };

    recognition.onerror = (event) => {
      setError(`Speech error: ${event.error}`);
      setRecording(false);
    };

    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setRecording(false);
  }

  function updateName(id, newName) {
    setPendingNames((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, name: newName } : entry))
    );
  }

  function updateStatus(id, newStatus) {
    setPendingNames((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, status: newStatus } : entry))
    );
  }

  function removeName(id) {
    setPendingNames((prev) => prev.filter((entry) => entry.id !== id));
  }

  if (session) {
    return (
      <article>
        <header>
          <h2>Session #{session.id}</h2>
          {session.description && <p>{session.description}</p>}
        </header>

        <section>
          <h3>Voice Recording</h3>
          {error && <p style={{ color: "var(--color-absent)" }}>{error}</p>}
          <button onClick={recording ? stopRecording : startRecording}>
            {recording ? "⏹ Stop Recording" : "🎤 Start Recording"}
          </button>
          {recording && <p><em>Listening… speak a name after each pause.</em></p>}
        </section>

        {pendingNames.length > 0 && (
          <section>
            <h3>Captured Names ({pendingNames.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pendingNames.map((entry) => {
                  const style = STATUS_STYLES[entry.status] || STATUS_STYLES.review;
                  return (
                    <tr key={entry.id}>
                      <td>
                        <input
                          type="text"
                          value={entry.name}
                          onChange={(e) => updateName(entry.id, e.target.value)}
                        />
                      </td>
                      <td>
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
                      <td>
                        <button onClick={() => removeName(entry.id)}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}
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
