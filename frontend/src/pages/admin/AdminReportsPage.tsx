import React from "react";
import { DateRangeBar, type DateRange } from "../../components/DateRangeBar";
import { adminApi, type DriverReportRow, type TimeSeriesRow, type VehicleReportRow } from "./api";

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function AdminReportsPage() {
  const [range, setRange] = React.useState<DateRange>(() => {
    const t = todayIso();
    return { start_date: t, end_date: t };
  });
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const [vehicles, setVehicles] = React.useState<VehicleReportRow[]>([]);
  const [drivers, setDrivers] = React.useState<DriverReportRow[]>([]);
  const [ts, setTs] = React.useState<TimeSeriesRow[]>([]);
  const [granularity, setGranularity] = React.useState<"daily" | "weekly" | "monthly">("daily");

  const load = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const [v, d, t] = await Promise.all([
        adminApi.reports.vehicles(range),
        adminApi.reports.drivers(range),
        adminApi.reports.timeSeries({ ...range, granularity })
      ]);
      setVehicles(v);
      setDrivers(d);
      setTs(t);
    } catch (e: any) {
      setError(e?.message ?? "Raporlar yüklenemedi (enable_advanced_reports kapalı olabilir)");
      setVehicles([]);
      setDrivers([]);
      setTs([]);
    } finally {
      setBusy(false);
    }
  }, [range, granularity]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="container">
      <div className="h1">Raporlar</div>
      <DateRangeBar value={range} onChange={setRange} />

      <div style={{ height: 12 }} />

      <div className="row row-wrap">
        <select className="input" style={{ maxWidth: 240 }} value={granularity} onChange={(e) => setGranularity(e.target.value as any)}>
          <option value="daily">Günlük</option>
          <option value="weekly">Haftalık</option>
          <option value="monthly">Aylık</option>
        </select>
        <button className="btn btn-primary" onClick={load} disabled={busy}>
          {busy ? "Yükleniyor…" : "Yenile"}
        </button>
      </div>

      {error ? <div className="error" style={{ marginTop: 12 }}>{error}</div> : null}

      <div style={{ height: 12 }} />

      <div className="card card-pad" style={{ marginBottom: 12 }}>
        <div className="h2">Araç bazlı gelir & gider</div>
        <div className="grid">
          {vehicles.map((r) => (
            <div key={r.vehicle_id} className="card card-pad">
              <div className="row">
                <div>
                  <div className="h2">{r.plate}</div>
                  <div className="muted">{r.vehicle_type}</div>
                  <div className="muted">Sefer: {r.total_trip_count}</div>
                </div>
                <div className="spacer" />
                <div style={{ textAlign: "right" }}>
                  <div className="muted">Gider: {r.total_expense}</div>
                  <div className="muted">Gelir: {r.total_income ?? "—"}</div>
                  <div className="h2">Net: {r.net_profit ?? "—"}</div>
                </div>
              </div>
            </div>
          ))}
          {!vehicles.length ? <div className="muted">Kayıt yok.</div> : null}
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 12 }}>
        <div className="h2">Şoför bazlı iş özeti</div>
        <div className="grid">
          {drivers.map((r) => (
            <div key={r.driver_id} className="card card-pad">
              <div className="row">
                <div>
                  <div className="h2">{r.name}</div>
                  <div className="muted">{r.phone}</div>
                </div>
                <div className="spacer" />
                <div style={{ textAlign: "right" }}>
                  <div className="muted">İş: {r.job_count}</div>
                  <div className="muted">Sefer: {r.total_trip_count}</div>
                  <div className="muted">Gelir: {r.total_income ?? "—"}</div>
                </div>
              </div>
            </div>
          ))}
          {!drivers.length ? <div className="muted">Kayıt yok.</div> : null}
        </div>
      </div>

      <div className="card card-pad">
        <div className="h2">Zaman serisi</div>
        <div className="grid">
          {ts.map((r) => (
            <div key={`${r.period_start}-${r.granularity}`} className="card card-pad">
              <div className="row">
                <div>
                  <div className="h2">
                    {r.period_start} → {r.period_end}
                  </div>
                  <div className="muted">Sefer: {r.total_trip_count}</div>
                </div>
                <div className="spacer" />
                <div style={{ textAlign: "right" }}>
                  <div className="muted">Gider: {r.total_expense}</div>
                  <div className="muted">Gelir: {r.total_income ?? "—"}</div>
                  <div className="h2">Net: {r.net_profit ?? "—"}</div>
                </div>
              </div>
            </div>
          ))}
          {!ts.length ? <div className="muted">Kayıt yok.</div> : null}
        </div>
      </div>
    </div>
  );
}

