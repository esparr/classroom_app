import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export function useApi() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const request = useCallback(async (path, options = {}) => {
    const res = await fetch(`http://localhost:8000${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (res.status === 401) {
      logout();
      navigate("/login");
      return null;
    }

    return res;
  }, [token, logout, navigate]);

  return request;
}
