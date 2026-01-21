import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export function MePage() {
  const { state, logout } = useAuth();
  const nav = useNavigate();

  if (state.status !== "authed") return null;

  return (
    <div className="container">
      <div className="card card-pad" style={{ marginBottom: 12 }}>
        <div className="h1">Profil</div>
        <div className="grid grid-2">
          <div className="card card-pad">
            <div className="muted">Ad</div>
            <div>{state.user.name}</div>
          </div>
          <div className="card card-pad">
            <div className="muted">Telefon</div>
            <div>{state.user.phone}</div>
          </div>
          <div className="card card-pad">
            <div className="muted">Rol</div>
            <div>{state.user.role === "admin" ? "Yönetici" : "Şoför"}</div>
          </div>
          <div className="card card-pad">
            <div className="muted">Firma ID</div>
            <div>{state.user.company_id}</div>
          </div>
        </div>

        {state.user.role === "admin" && (
          <div style={{ marginTop: 14 }}>
            <div className="h2" style={{ marginBottom: 10 }}>Yönetim</div>
            <div className="grid grid-2">
              <Link to="/admin/vehicles" style={{ textDecoration: "none" }}>
                <div className="card card-pad" style={{ cursor: "pointer", textAlign: "center" }}>
                  <div className="h2">🚗</div>
                  <div className="muted">Araçlar</div>
                </div>
              </Link>
              <Link to="/admin/drivers" style={{ textDecoration: "none" }}>
                <div className="card card-pad" style={{ cursor: "pointer", textAlign: "center" }}>
                  <div className="h2">👤</div>
                  <div className="muted">Şoförler</div>
                </div>
              </Link>
            </div>
          </div>
        )}

        <div className="row" style={{ marginTop: 14 }}>
          <button
            className="btn btn-danger"
            onClick={() => {
              logout();
              nav("/login", { replace: true });
            }}
          >
            Çıkış yap
          </button>
        </div>
      </div>
    </div>
  );
}

