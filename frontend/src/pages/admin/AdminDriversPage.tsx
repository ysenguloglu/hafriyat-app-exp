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
      // Validation
      if (!name.trim()) {
        setError("Ad gereklidir");
        setBusy(false);
        return;
      }
      if (name.trim().length > 200) {
        setError("Ad en fazla 200 karakter olabilir");
        setBusy(false);
        return;
      }
      if (!phone.trim()) {
        setError("Telefon gereklidir");
        setBusy(false);
        return;
      }
      if (phone.trim().length < 5 || phone.trim().length > 32) {
        setError("Telefon 5-32 karakter arasında olmalıdır");
        setBusy(false);
        return;
      }
      if (!password || password.length < 6) {
        setError("Şifre en az 6 karakter olmalıdır");
        setBusy(false);
        return;
      }
      if (password.length > 128) {
        setError("Şifre en fazla 128 karakter olabilir");
        setBusy(false);
        return;
      }

      await adminApi.drivers.create({ name: name.trim(), phone: phone.trim(), password });
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
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Ad Soyad</div>
            <input 
              className="input" 
              placeholder="Ad Soyad" 
              value={name} 
              onChange={(e) => {
                const val = e.target.value;
                // Title case: Her kelimenin ilk harfi büyük
                const titleCase = val.split(" ").map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(" ");
                setName(titleCase);
              }} 
              required 
            />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Telefon</div>
            <input 
              className="input" 
              placeholder="05xx..." 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required 
            />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
              Şifre <span style={{ color: "var(--color-muted)", fontSize: 11 }}>(En az 6 karakter)</span>
            </div>
            <input 
              className="input" 
              type="password" 
              placeholder="Şifre (min. 6 karakter)" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              minLength={6}
              required 
            />
          </div>
          <div>
            <div style={{ height: 20 }} />
            <button className="btn btn-primary" type="submit" disabled={busy}>
              Ekle
            </button>
          </div>
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

