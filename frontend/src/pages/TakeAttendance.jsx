import { useState, useRef } from "react";
import { useApi } from "../hooks/useApi";

export default function TakeAttendance() {
  const api = useApi();
  const [description, setDescription] = useState("");
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  // Voice recording
  const [recording, setRecording] = useState(false);
  const [pendingNames, setPendingNames] = useState([]);
  const recognitionRef = useRef(null);

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
          { id: Date.now(), name: phrase },
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
            <ul>
              {pendingNames.map((entry) => (
                <li key={entry.id}>{entry.name}</li>
              ))}
            </ul>
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
