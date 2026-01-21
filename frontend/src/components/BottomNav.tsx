import { NavLink } from "react-router-dom";
import type { Role } from "../auth/types";

export function BottomNav({ role }: { role: Role }) {
  if (role === "admin") {
    return (
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to="/admin/dashboard">
            Özet
          </NavLink>
          <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to="/admin/jobs">
            İşler
          </NavLink>
          <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to="/admin/expenses">
            Gider
          </NavLink>
          <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to="/admin/reports">
            Rapor
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="bottom-nav">
      <div className="bottom-nav-inner">
        <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to="/driver/jobs">
          İşlerim
        </NavLink>
        <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to="/driver/new-job">
          Yeni İş
        </NavLink>
        <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to="/me">
          Profil
        </NavLink>
        <div className="nav-item" />
      </div>
    </div>
  );
}

