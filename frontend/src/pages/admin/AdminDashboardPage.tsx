import React from "react";
import { Link } from "react-router-dom";
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
      console.error("Dashboard yükleme hatası:", e);
      const errorMsg = e?.message ?? "Dashboard yüklenemedi";
      setError(errorMsg);
      setData(null); // Hata durumunda data'yı temizle
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
        {error ? (
          <div className="error" style={{ padding: "8px 12px", borderRadius: 4 }}>
            {error}
          </div>
        ) : null}
      </div>

      <div style={{ height: 12 }} />

      <div className="card card-pad" style={{ marginBottom: 12, backgroundColor: "var(--color-bg-secondary)" }}>
        <div className="h2" style={{ marginBottom: 10 }}>Başlamak İçin</div>
        <div className="muted" style={{ marginBottom: 12, fontSize: 14 }}>
          Önce araç ve şoför ekleyin, sonra iş ve gider kayıtları girebilirsiniz.
        </div>
        <div className="grid grid-2">
          <Link to="/admin/vehicles" style={{ textDecoration: "none" }}>
            <div className="card card-pad" style={{ cursor: "pointer", textAlign: "center", border: "2px solid var(--color-primary)" }}>
              <div className="h2">🚗</div>
              <div style={{ fontWeight: "bold", marginTop: 4 }}>Araçlar</div>
              <div className="muted" style={{ fontSize: 12 }}>Araç ekle</div>
            </div>
          </Link>
          <Link to="/admin/drivers" style={{ textDecoration: "none" }}>
            <div className="card card-pad" style={{ cursor: "pointer", textAlign: "center", border: "2px solid var(--color-primary)" }}>
              <div className="h2">👤</div>
              <div style={{ fontWeight: "bold", marginTop: 4 }}>Şoförler</div>
              <div className="muted" style={{ fontSize: 12 }}>Şoför ekle</div>
            </div>
          </Link>
        </div>
      </div>

      <div style={{ height: 12 }} />

      {busy && !data ? (
        <div className="card card-pad" style={{ textAlign: "center" }}>
          <div className="muted">Yükleniyor…</div>
        </div>
      ) : null}

      {!busy && data && (
        <div className="grid grid-2">
        <div className="card card-pad">
          <div className="muted">Toplam sefer sayısı</div>
          <div className="h1">{data?.total_trip_count ?? "-"}</div>
        </div>
        <div className="card card-pad">
          <div className="muted">Toplam gider</div>
          <div className="h1">
            {data?.total_expense 
              ? Number(data.total_expense).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })
              : "-"}
          </div>
        </div>
        <div className="card card-pad">
          <div className="muted">Aktif araç</div>
          <div className="h1">{data?.active_vehicle_count ?? "-"}</div>
        </div>
        <div className="card card-pad">
          <div className="muted">Net kâr</div>
          <div className="h1">
            {data?.net_profit 
              ? Number(data.net_profit).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })
              : "—"}
          </div>
          <div className="muted" style={{ fontSize: 12 }}>
            {data?.total_income === null 
              ? "Gelir takibi kapalı" 
              : data?.total_income != null
              ? `Toplam gelir: ${Number(data.total_income).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}`
              : null}
          </div>
        </div>
        {data?.total_work_hours != null ? (
          <div className="card card-pad">
            <div className="muted">Toplam çalışma süresi</div>
            <div className="h1">
              {Math.floor(data.total_work_hours)}sa {Math.round((data.total_work_hours % 1) * 60)}dk
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              ({data.total_work_hours.toFixed(2)} saat)
            </div>
          </div>
        ) : null}
        {data?.total_fuel_amount != null ? (
          <div className="card card-pad">
            <div className="muted">Toplam yakıt</div>
            <div className="h1">
              {Number(data.total_fuel_amount).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} litre
            </div>
          </div>
        ) : null}
        {data?.total_distance_km != null ? (
          <div className="card card-pad">
            <div className="muted">Toplam kilometre</div>
            <div className="h1">
              {data.total_distance_km.toLocaleString("tr-TR")} km
            </div>
          </div>
        ) : null}
        </div>
      )}

      {!busy && !data && !error ? (
        <div className="card card-pad" style={{ textAlign: "center" }}>
          <div className="muted">Veri yüklenemedi. Lütfen yenileyin.</div>
        </div>
      ) : null}
    </div>
  );
}

