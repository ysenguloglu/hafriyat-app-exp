import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export function LoginPage() {
  const { state, login } = useAuth();
  const nav = useNavigate();
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (state.status === "authed") {
      nav("/", { replace: true });
    }
  }, [state.status, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login({ phone: phone.trim(), password });
      nav("/", { replace: true });
    } catch (err: any) {
      const msg = typeof err?.message === "string" ? err.message : "Giriş başarısız";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="card card-pad" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="h1">Giriş</div>

        {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 10 }}>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
              Telefon
            </div>
            <input
              className="input"
              inputMode="tel"
              placeholder="05xx..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
              Şifre
            </div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </form>

        <div style={{ marginTop: 14, textAlign: "center" }}>
          <Link to="/signup" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
            Hesabınız yok mu? Kayıt olun
          </Link>
        </div>
      </div>
    </div>
  );
}

