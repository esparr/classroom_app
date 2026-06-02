import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";

export default function StudentDetail() {
  const { id } = useParams();
  const api = useApi();
  const [student, setStudent] = useState(null);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api(`/api/students/${id}/`).then((res) => res?.json()),
      api(`/api/students/${id}/note/`).then((res) => res?.json()),
    ])
      .then(([studentData, noteData]) => {
        setStudent(studentData);
        setNote(noteData?.content ?? "");
      })
      .catch(() => setError("Failed to load student."))
      .finally(() => setLoading(false));
  }, [id]);

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
