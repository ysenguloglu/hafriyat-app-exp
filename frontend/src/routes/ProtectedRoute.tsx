import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import type { Role } from "../auth/types";

export function ProtectedRoute({
  children,
  allow
}: {
  children: React.ReactNode;
  allow: Role[];
}) {
  const { state } = useAuth();
  const loc = useLocation();

  if (state.status === "loading") {
    return (
      <div className="container">
        <div className="card card-pad">Yükleniyor…</div>
      </div>
    );
  }

  if (state.status !== "authed") {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  if (!allow.includes(state.user.role)) {
    return (
      <div className="container">
        <div className="error">Bu ekrana erişim yetkiniz yok.</div>
      </div>
    );
  }

  return <>{children}</>;
}

