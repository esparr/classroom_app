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
    </article>
  );
}
