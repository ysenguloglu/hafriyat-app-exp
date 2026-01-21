import React from "react";
import { driverApi, type Job } from "./api";

export function DriverJobsPage() {
  const [items, setItems] = React.useState<Job[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setItems(await driverApi.jobs.list());
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
      <div className="h1">İşlerim</div>
      {error ? (
        <div className="error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      ) : null}
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
              <div className="h2">
                {j.date} • {j.job_type}
              </div>
              <div className="muted">
                {j.from_location} → {j.to_location}
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <div className="muted">Sefer: {j.trip_count}</div>
                <div className="spacer" />
                <div className="muted">{j.income_amount === null ? "Gelir: —" : `Gelir: ${j.income_amount}`}</div>
              </div>
              {j.description ? <div className="muted" style={{ marginTop: 6 }}>{j.description}</div> : null}
            </div>
          ))}
          {!items.length && !busy ? <div className="muted">Kayıt yok.</div> : null}
        </div>
      </div>
    </div>
  );
}

