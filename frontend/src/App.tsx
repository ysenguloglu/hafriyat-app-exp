import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { BottomNav } from "./components/BottomNav";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { MePage } from "./pages/MePage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminVehiclesPage } from "./pages/admin/AdminVehiclesPage";
import { AdminDriversPage } from "./pages/admin/AdminDriversPage";
import { AdminJobsPage } from "./pages/admin/AdminJobsPage";
import { AdminExpensesPage } from "./pages/admin/AdminExpensesPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { DriverJobsPage } from "./pages/driver/DriverJobsPage";
import { DriverNewJobPage } from "./pages/driver/DriverNewJobPage";

export function App() {
  const { state } = useAuth();
  const role = state.status === "authed" ? state.user.role : null;

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/me"
          element={
            <ProtectedRoute allow={["admin", "driver"]}>
              <MePage />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vehicles"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminVehiclesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/drivers"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminDriversPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/expenses"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Driver */}
        <Route
          path="/driver/jobs"
          element={
            <ProtectedRoute allow={["driver"]}>
              <DriverJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/new-job"
          element={
            <ProtectedRoute allow={["driver"]}>
              <DriverNewJobPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            role === "admin" ? (
              <Navigate to="/admin/dashboard" replace />
            ) : role === "driver" ? (
              <Navigate to="/driver/jobs" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {role ? <BottomNav role={role} /> : null}
    </>
  );
}

