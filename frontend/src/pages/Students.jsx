import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";

export default function Students() {
  const api = useApi();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api("/api/students/")
      .then((res) => res?.json())
      .then((data) => setStudents(data ?? []))
      .catch(() => setError("Failed to load students."))
      .finally(() => setLoading(false));
  }, [api]);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDeactivate(id) {
    if (!confirm("Deactivate this student?")) return;
    const res = await api(`/api/students/${id}/deactivate/`, { method: "PATCH" });
    if (res?.ok) {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: false } : s))
      );
    }
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "var(--color-absent)" }}>{error}</p>;

  return (
    <article>
      <h2>Students</h2>
      <label>
        Search
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name…"
        />
      </label>
      <table className="table-cards">
        <thead>
          <tr>
            <th>Name</th>
            <th>Active</th>
            <th>Sessions Attended</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((student) => (
            <tr key={student.id}>
              <td data-label="Name">{student.name}</td>
              <td data-label="Active">
                <span className={student.is_active ? "attendance-present" : "attendance-absent"}>
                  {student.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td data-label="Sessions Attended">{student.total_sessions_attended}</td>
              <td data-label="Actions">
                <Link to={`/students/${student.id}`}>View Profile</Link>
                {user?.role === "admin" && student.is_active && (
                  <> &middot; <button onClick={() => handleDeactivate(student.id)}>Deactivate</button></>
                )}
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={4}>No students found.</td></tr>
          )}
        </tbody>
      </table>
    </article>
  );
}
