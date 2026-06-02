import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

const API_BASE = "http://localhost:8000";

export function useApi() {
  const { token, logout, updateToken } = useAuth();
  const navigate = useNavigate();

  const request = useCallback(async (path, options = {}) => {
    const makeRequest = (accessToken) =>
      fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...options.headers,
        },
      });

    let res = await makeRequest(token);

    if (res.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE}/api/auth/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          if (refreshRes.ok) {
            const { access } = await refreshRes.json();
            updateToken(access);
            res = await makeRequest(access);
            if (res.status !== 401) return res;
          }
        } catch {
          // refresh failed, fall through to logout
        }
      }
      logout();
      navigate("/login");
      return null;
    }

    return res;
  }, [token, logout, navigate, updateToken]);

  return request;
}
