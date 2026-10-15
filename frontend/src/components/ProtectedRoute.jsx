import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="section container center">
        <p>Loading…</p>
      </div>
    );
  }

  return user ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: loc.pathname }} />
  );
}