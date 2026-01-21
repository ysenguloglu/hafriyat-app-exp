import React from "react";
import { useNavigate } from "react-router-dom";
import { driverApi } from "./api";

export function DriverNewJobPage() {
  const nav = useNavigate();
  const [date, setDate] = React.useState("");
  const [vehicleId, setVehicleId] = React.useState("");
  const [jobType, setJobType] = React.useState("");
  const [fromLocation, setFromLocation] = React.useState("");
  const [toLocation, setToLocation] = React.useState("");
  const [tripCount, setTripCount] = React.useState("1");
  const [incomeAmount, setIncomeAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await driverApi.jobs.create({
        date,
        vehicle_id: Number(vehicleId),
        job_type: jobType,
        from_location: fromLocation,
        to_location: toLocation,
        trip_count: Number(tripCount),
        income_amount: incomeAmount.trim() ? Number(incomeAmount) : null,
        description: description.trim() ? description : null
      });
      nav("/driver/jobs", { replace: true });
    } catch (e: any) {
      setError(e?.message ?? "İş kaydı oluşturulamadı");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="h1">Yeni İş</div>
      <div className="muted" style={{ marginBottom: 10 }}>
        Eğer firma ayarlarında şoför iş girişi kapalıysa bu işlem 403 döner.
      </div>
      {error ? (
        <div className="error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      <div className="card card-pad">
        <form onSubmit={create} className="grid grid-2">
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
              Tarih
            </div>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
              Vehicle ID
            </div>
            <input
              className="input"
              inputMode="numeric"
              placeholder="Örn: 12"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
              İş tipi
            </div>
            <input className="input" value={jobType} onChange={(e) => setJobType(e.target.value)} required />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
              Sefer sayısı
            </div>
            <input
              className="input"
              inputMode="numeric"
              value={tripCount}
              onChange={(e) => setTripCount(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
              Nereden
            </div>
            <input className="input" value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} required />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
              Nereye
            </div>
            <input className="input" value={toLocation} onChange={(e) => setToLocation(e.target.value)} required />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
              Gelir (opsiyonel)
            </div>
            <input
              className="input"
              inputMode="decimal"
              placeholder="Gelir takibi kapalıysa hata alırsınız"
              value={incomeAmount}
              onChange={(e) => setIncomeAmount(e.target.value)}
            />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
              Açıklama (opsiyonel)
            </div>
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ gridColumn: "1 / -1" }}>
            {busy ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </form>
      </div>
    </div>
  );
}

