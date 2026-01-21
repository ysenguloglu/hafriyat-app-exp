import React from "react";
import { adminApi, type Job } from "./api";

export function AdminJobsPage() {
  const [items, setItems] = React.useState<Job[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setItems(await adminApi.jobs.list());
    } catch (e: any) {
      setError(e?.message ?? "İşler yüklenemedi");
    } finally {
      setBusy(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="container">
      <div className="h1">İşler (Admin)</div>
      <div className="muted" style={{ marginBottom: 10 }}>
        Admin için job oluşturma/güncelleme ekranı bir sonraki iterasyonda genişletilebilir; şu an listeleme var.
      </div>
      {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}
      <div className="card card-pad">
        <div className="row" style={{ marginBottom: 10 }}>
          <div className="h2">Liste</div>
          <div className="spacer" />
          <button className="btn" onClick={load} disabled={busy}>
            Yenile
          </button>
        </div>
        <div className="grid">
          {items.map((j) => (
            <div key={j.id} className="card card-pad">
              <div className="row">
                <div>
                  <div className="h2">
                    {j.date} • {j.job_type}
                  </div>
                  <div className="muted">
                    {j.from_location} → {j.to_location} • Sefer: {j.trip_count}
                  </div>
                  <div className="muted">Araç ID: {j.vehicle_id} • Şoför ID: {j.driver_id}</div>
                </div>
                <div className="spacer" />
                <div className="muted">{j.income_amount === null ? "Gelir: —" : `Gelir: ${j.income_amount}`}</div>
              </div>
            </div>
          ))}
          {!items.length && !busy ? <div className="muted">Kayıt yok.</div> : null}
        </div>
      </div>
    </div>
  );
}

