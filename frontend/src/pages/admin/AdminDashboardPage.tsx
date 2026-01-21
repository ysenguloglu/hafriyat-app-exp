import React from "react";
import { DateRangeBar, type DateRange } from "../../components/DateRangeBar";
import { adminApi } from "./api";

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function AdminDashboardPage() {
  const [range, setRange] = React.useState<DateRange>(() => {
    const t = todayIso();
    return { start_date: t, end_date: t };
  });
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const d = await adminApi.dashboard(range);
      setData(d);
    } catch (e: any) {
      setError(e?.message ?? "Dashboard yüklenemedi");
    } finally {
      setBusy(false);
    }
  }, [range]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="container">
      <div className="h1">Özet</div>
      <DateRangeBar value={range} onChange={setRange} />

      <div style={{ height: 12 }} />

      <div className="row">
        <button className="btn btn-primary" onClick={load} disabled={busy}>
          {busy ? "Yükleniyor…" : "Yenile"}
        </button>
        <div className="spacer" />
        {error ? <div className="muted">{error}</div> : null}
      </div>

      <div style={{ height: 12 }} />

      <div className="grid grid-2">
        <div className="card card-pad">
          <div className="muted">Toplam sefer sayısı</div>
          <div className="h1">{data?.total_trip_count ?? "-"}</div>
        </div>
        <div className="card card-pad">
          <div className="muted">Toplam gider</div>
          <div className="h1">{data?.total_expense ?? "-"}</div>
        </div>
        <div className="card card-pad">
          <div className="muted">Aktif araç</div>
          <div className="h1">{data?.active_vehicle_count ?? "-"}</div>
        </div>
        <div className="card card-pad">
          <div className="muted">Net kâr</div>
          <div className="h1">{data?.net_profit ?? "—"}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {data?.total_income === null ? "Gelir takibi kapalı" : `Toplam gelir: ${data?.total_income ?? "-"}`}
          </div>
        </div>
      </div>
    </div>
  );
}

