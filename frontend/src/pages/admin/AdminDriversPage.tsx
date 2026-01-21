import React from "react";
import { adminApi, type Driver } from "./api";

export function AdminDriversPage() {
  const [items, setItems] = React.useState<Driver[]>([]);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setItems(await adminApi.drivers.list());
    } catch (e: any) {
      setError(e?.message ?? "Şoförler yüklenemedi");
    } finally {
      setBusy(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminApi.drivers.create({ name, phone, password });
      setName("");
      setPhone("");
      setPassword("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Şoför eklenemedi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="h1">Şoförler</div>
      {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

      <div className="card card-pad" style={{ marginBottom: 12 }}>
        <div className="h2">Yeni şoför</div>
        <form onSubmit={create} className="grid grid-2">
          <input className="input" placeholder="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="input" placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <input className="input" type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn btn-primary" type="submit" disabled={busy}>
            Ekle
          </button>
        </form>
      </div>

      <div className="card card-pad">
        <div className="row" style={{ marginBottom: 10 }}>
          <div className="h2">Liste</div>
          <div className="spacer" />
          <button className="btn" onClick={load} disabled={busy}>
            Yenile
          </button>
        </div>
        <div className="grid">
          {items.map((d) => (
            <div key={d.id} className="card card-pad">
              <div className="row">
                <div>
                  <div className="h2">{d.name}</div>
                  <div className="muted">{d.phone}</div>
                </div>
                <div className="spacer" />
                <div className="muted">{d.is_active ? "Aktif" : "Pasif"}</div>
              </div>
            </div>
          ))}
          {!items.length && !busy ? <div className="muted">Kayıt yok.</div> : null}
        </div>
      </div>
    </div>
  );
}

