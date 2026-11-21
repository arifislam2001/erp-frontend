import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ScreenLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#0c1210] text-stone-300">
      <div className="flex items-center gap-3 text-sm tracking-wide">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#d6a15d]" />
        Opening workspace
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <ScreenLoading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <ScreenLoading />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <ScreenLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
