import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <nav>
        <ul>
          <li><NavLink to="/">Take Attendance</NavLink></li>
          <li><NavLink to="/students">Students</NavLink></li>
          {user?.role === "admin" && (
            <li><NavLink to="/admin/dashboard">Dashboard</NavLink></li>
          )}
        </ul>
        <ul>
          <li><span>{user?.username}</span></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}
