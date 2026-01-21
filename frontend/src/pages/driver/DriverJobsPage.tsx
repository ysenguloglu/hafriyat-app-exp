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
          {items.map((j) => {
            // Çalışma süresini hesapla
            let workDuration = null;
            if (j.start_time && j.end_time) {
              const start = new Date(`2000-01-01T${j.start_time}`);
              const end = new Date(`2000-01-01T${j.end_time}`);
              if (end < start) {
                end.setDate(end.getDate() + 1);
              }
              const diffMs = end.getTime() - start.getTime();
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
              if (diffHours > 0 || diffMinutes > 0) {
                workDuration = `${diffHours}sa ${diffMinutes}dk`;
              }
            }

            return (
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
                  <div className="muted">{j.income_amount === null ? "Gelir: —" : `Gelir: ${Number(j.income_amount).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}`}</div>
                </div>
                {j.start_time && j.end_time ? (
                  <div className="muted" style={{ marginTop: 6 }}>
                    Saat: {j.start_time} - {j.end_time} {workDuration ? `• Çalışma Süresi: ${workDuration}` : ""}
                  </div>
                ) : null}
                {j.fuel_amount ? (
                  <div className="muted" style={{ marginTop: 6 }}>
                    Yakıt: {Number(j.fuel_amount).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litre
                  </div>
                ) : null}
                {j.odometer_start && j.odometer_end ? (
                  <div className="muted" style={{ marginTop: 6 }}>
                    Kilometre: {j.odometer_start.toLocaleString("tr-TR")} - {j.odometer_end.toLocaleString("tr-TR")} km 
                    ({((j.odometer_end - j.odometer_start)).toLocaleString("tr-TR")} km)
                  </div>
                ) : j.odometer_end ? (
                  <div className="muted" style={{ marginTop: 6 }}>
                    Bitiş Kilometre: {j.odometer_end.toLocaleString("tr-TR")} km
                  </div>
                ) : null}
                {j.description ? <div className="muted" style={{ marginTop: 6 }}>{j.description}</div> : null}
              </div>
            );
          })}
          {!items.length && !busy ? <div className="muted">Kayıt yok.</div> : null}
        </div>
      </div>
    </div>
  );
}

