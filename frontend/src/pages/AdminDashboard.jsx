import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const api = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role !== "admin") { navigate("/"); return; }
    api("/api/admin/dashboard/")
      .then((res) => res?.json())
      .then((d) => setData(d))
      .catch(() => setError("Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "var(--color-absent)" }}>{error}</p>;

  const totalInstructors = new Set(
    data.sessions_per_instructor.map((r) => r.created_by__id)
  ).size;

  return (
    <article>
      <h2>Admin Dashboard</h2>

      <section>
        <h3>Overview</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <article>
            <h4>Total Sessions</h4>
            <p style={{ fontSize: "2rem", margin: 0 }}>{data.total_sessions}</p>
          </article>
          <article>
            <h4>Active Students</h4>
            <p style={{ fontSize: "2rem", margin: 0 }}>{data.total_students}</p>
          </article>
          <article>
            <h4>Instructors</h4>
            <p style={{ fontSize: "2rem", margin: 0 }}>{totalInstructors}</p>
          </article>
        </div>
      </section>

      <section>
        <h3>Top 10 Attendees</h3>
        <table>
          <thead>
            <tr><th>Student Name</th><th>Sessions Attended</th></tr>
          </thead>
          <tbody>
            {data.top_attendees.length > 0 ? data.top_attendees.map((s) => (
              <tr key={s.student__id}>
                <td>{s.student__name}</td>
                <td>{s.sessions_attended}</td>
              </tr>
            )) : (
              <tr><td colSpan={2}>No data yet.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Needs Attention <small>(below 50% attendance)</small></h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Sessions Present</th>
              <th>Sessions Available</th>
              <th>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {data.low_attendance_students.length > 0 ? data.low_attendance_students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.sessions_present ?? "—"}</td>
                <td>{s.total_sessions ?? "—"}</td>
                <td className="attendance-danger">{s.attendance_percentage}%</td>
              </tr>
            )) : (
              <tr><td colSpan={4}>No students below 50%.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Sessions per Instructor</h3>
        <table>
          <thead>
            <tr><th>Instructor</th><th>Total Sessions</th></tr>
          </thead>
          <tbody>
            {data.sessions_per_instructor.length > 0 ? data.sessions_per_instructor.map((r) => (
              <tr key={r.created_by__id}>
                <td>{r.created_by__username}</td>
                <td>{r.session_count}</td>
              </tr>
            )) : (
              <tr><td colSpan={2}>No sessions yet.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </article>
  );
}
