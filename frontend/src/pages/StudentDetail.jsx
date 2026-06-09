import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";

const CONCERN_COLORS = {
  none:   "attendance-present",
  low:    "attendance-warning",
  medium: "attendance-warning",
  high:   "attendance-danger",
};

export default function StudentDetail() {
  const { id } = useParams();
  const api = useApi();
  const [student, setStudent] = useState(null);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [history, setHistory] = useState([]);
  const [trend, setTrend] = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api(`/api/students/${id}/`).then((res) => res?.json()),
      api(`/api/students/${id}/note/`).then((res) => res?.json()),
      api(`/api/students/${id}/attendance/`)
        .then((res) => (res?.ok ? res.json() : []))
        .catch(() => []),
    ])
      .then(([studentData, noteData, historyData]) => {
        setStudent(studentData);
        setNote(noteData?.content ?? "");
        setHistory(historyData ?? []);
      })
      .catch(() => setError("Failed to load student."))
      .finally(() => setLoading(false));
  }, [id, api]);

  async function handleNoteBlur() {
    const res = await api(`/api/students/${id}/note/update/`, {
      method: "PATCH",
      body: JSON.stringify({ content: note }),
    });
    if (res?.ok) {
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    }
  }

  async function handleSummarize() {
    setSummarizing(true);
    setSummary(null);
    const res = await api(`/api/students/${id}/summarize-note/`, { method: "POST" });
    if (res?.ok) setSummary(await res.json());
    setSummarizing(false);
  }

  async function handleTrend() {
    setTrendLoading(true);
    setTrend(null);
    const res = await api(`/api/students/${id}/attendance-trend/`);
    if (res?.ok) setTrend(await res.json());
    setTrendLoading(false);
  }

  if (loading) return <p>Loading…</p>;
  if (error || !student) {
    return <p style={{ color: "var(--color-absent)" }}>{error ?? "Student not found."}</p>;
  }

  const { attendance_summary: att } = student;
  const attPct = att?.attendance_percentage ?? 0;
  const attClass =
    attPct < 50 ? "attendance-danger" :
    attPct < 75 ? "attendance-warning" :
    "attendance-present";

  return (
    <article>
      <h2>{student.name}</h2>
      {student.profile?.bio && <p>{student.profile.bio}</p>}

      <section>
        <h3>Attendance Summary</h3>
        <dl>
          <dt>Sessions attended</dt>
          <dd>{att?.sessions_present ?? 0} / {att?.total_sessions ?? 0}</dd>
          <dt>Attendance rate</dt>
          <dd className={attClass}>{attPct}%</dd>
        </dl>
      </section>

      <section>
        <h3>Attendance History</h3>
        {history.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Session</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr
                  key={record.session_id}
                  className={record.status === "present" ? "attendance-present" : "attendance-absent"}
                >
                  <td>#{record.session_id}</td>
                  <td>{record.started_at ? new Date(record.started_at).toLocaleDateString() : "—"}</td>
                  <td style={{ textTransform: "capitalize" }}>{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No attendance history available.</p>
        )}

        <button onClick={handleTrend} disabled={trendLoading}>
          {trendLoading ? "Analyzing…" : "View Attendance Trend"}
        </button>

        {trend && (
          <aside>
            <h4>Attendance Trend</h4>
            <p>{trend.trend_summary}</p>
            <p>
              Concern level:{" "}
              <strong className={CONCERN_COLORS[trend.concern_flag] ?? "attendance-warning"}>
                {trend.concern_flag}
              </strong>
            </p>
          </aside>
        )}
      </section>

      <section>
        <h3>Private Note</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={handleNoteBlur}
          rows={5}
          placeholder="Write a private note about this student…"
        />
        {noteSaved && <p style={{ color: "var(--color-present)" }}>Saved.</p>}
        <button onClick={handleSummarize} disabled={summarizing || !note.trim()}>
          {summarizing ? "Summarizing…" : "Summarize Note"}
        </button>

        {summary && (
          <aside>
            <h4>AI Summary</h4>
            <p>{summary.summary}</p>
            {summary.key_points?.length > 0 && (
              <ul>
                {summary.key_points.map((pt, i) => <li key={i}>{pt}</li>)}
              </ul>
            )}
          </aside>
        )}
      </section>
    </article>
  );
}
