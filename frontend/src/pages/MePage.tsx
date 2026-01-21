import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export function MePage() {
  const { state, logout } = useAuth();
  const nav = useNavigate();

  if (state.status !== "authed") return null;

  return (
    <div className="container">
      <div className="card card-pad">
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
            <div>{state.user.role}</div>
          </div>
          <div className="card card-pad">
            <div className="muted">Company</div>
            <div>{state.user.company_id}</div>
          </div>
        </div>

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

