import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Spinner from "./Spinner.jsx";

const ProtectedRoute = ({ role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner fullScreen text="Loading..." />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
