import { Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuth } from "./context/AdminAuthContext.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import Spinner from "./components/common/Spinner.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Doctors from "./pages/Doctors.jsx";
import AddDoctor from "./pages/AddDoctor.jsx";
import Appointments from "./pages/Appointments.jsx";
import Messages from "./pages/Messages.jsx";
import Departments from "./pages/Departments.jsx";
import Users from "./pages/Users.jsx";
import Reports from "./pages/Reports.jsx";

const PrivateRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();
  if (loading) return <Spinner fullScreen />;
  return admin ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/doctors/add" element={<AddDoctor />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/departments" element={<Departments />} />
                <Route path="/users" element={<Users />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </AdminLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
