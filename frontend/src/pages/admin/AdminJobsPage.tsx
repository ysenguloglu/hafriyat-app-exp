import React from "react";
import { adminApi, type Job, type Vehicle, type Driver } from "./api";

export function AdminJobsPage() {
  const [items, setItems] = React.useState<Job[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [drivers, setDrivers] = React.useState<Driver[]>([]);
  const [date, setDate] = React.useState("");
  const [vehicleId, setVehicleId] = React.useState("");
  const [driverId, setDriverId] = React.useState("");
  const [jobType, setJobType] = React.useState("");
  const [fromLocation, setFromLocation] = React.useState("");
  const [toLocation, setToLocation] = React.useState("");
  const [tripCount, setTripCount] = React.useState("1");
  const [incomeAmount, setIncomeAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const loadJobs = React.useCallback(async () => {
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

  const loadVehicles = React.useCallback(async () => {
    try {
      const vs = await adminApi.vehicles.list();
      setVehicles(vs.filter(v => v.is_active));
    } catch (e: any) {
      setError(e?.message ?? "Araçlar yüklenemedi");
    }
  }, []);

  const loadDrivers = React.useCallback(async () => {
    try {
      const ds = await adminApi.drivers.list();
      setDrivers(ds.filter(d => d.is_active));
    } catch (e: any) {
      setError(e?.message ?? "Şoförler yüklenemedi");
    }
  }, []);

  React.useEffect(() => {
    void loadJobs();
    void loadVehicles();
    void loadDrivers();
  }, [loadJobs, loadVehicles, loadDrivers]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminApi.jobs.create({
        date,
        vehicle_id: Number(vehicleId),
        driver_id: Number(driverId),
        job_type: jobType,
        from_location: fromLocation,
        to_location: toLocation,
        trip_count: Number(tripCount),
        income_amount: incomeAmount.trim() ? Number(incomeAmount) : null,
        description: description.trim() ? description : null
      });
      setDate("");
      setVehicleId("");
      setDriverId("");
      setJobType("");
      setFromLocation("");
      setToLocation("");
      setTripCount("1");
      setIncomeAmount("");
      setDescription("");
      await loadJobs();
    } catch (e: any) {
      setError(e?.message ?? "İş kaydı oluşturulamadı");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="h1">İşler</div>
      {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

      <div className="card card-pad" style={{ marginBottom: 12 }}>
        <div className="h2">Yeni iş</div>
        <form onSubmit={create} className="grid grid-2">
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Tarih</div>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Araç</div>
            <select
              className="input"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
            >
              <option value="">Seçiniz...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.plate} - {v.vehicle_type}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Şoför</div>
            <select
              className="input"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              required
            >
              <option value="">Seçiniz...</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
              ))}
            </select>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>İş Tipi</div>
            <input className="input" placeholder="Örn: Hafriyat" value={jobType} onChange={(e) => setJobType(e.target.value)} required />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Nereden</div>
            <input className="input" placeholder="Başlangıç lokasyonu" value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} required />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Nereye</div>
            <input className="input" placeholder="Varış lokasyonu" value={toLocation} onChange={(e) => setToLocation(e.target.value)} required />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Sefer Sayısı</div>
            <input
              className="input"
              inputMode="numeric"
              value={tripCount}
              onChange={(e) => setTripCount(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Gelir (opsiyonel)</div>
            <input
              className="input"
              inputMode="decimal"
              placeholder="0.00"
              value={incomeAmount}
              onChange={(e) => setIncomeAmount(e.target.value)}
            />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Açıklama (opsiyonel)</div>
            <input className="input" placeholder="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} />
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
          <button className="btn" onClick={loadJobs} disabled={busy}>
            Yenile
          </button>
        </div>
        <div className="grid">
          {items.map((j) => {
            const vehicle = vehicles.find(v => v.id === j.vehicle_id);
            const driver = drivers.find(d => d.id === j.driver_id);
            return (
              <div key={j.id} className="card card-pad">
                <div className="row">
                  <div>
                    <div className="h2">
                      {j.date} • {j.job_type}
                    </div>
                    <div className="muted">
                      {j.from_location} → {j.to_location} • Sefer: {j.trip_count}
                    </div>
                    <div className="muted">
                      {vehicle ? `${vehicle.plate} - ${vehicle.vehicle_type}` : `Araç: ${j.vehicle_id}`} • {driver ? driver.name : `Şoför: ${j.driver_id}`}
                    </div>
                    {j.description ? <div className="muted">{j.description}</div> : null}
                  </div>
                  <div className="spacer" />
                  <div className="muted">{j.income_amount === null ? "Gelir: —" : `Gelir: ${Number(j.income_amount).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}`}</div>
                </div>
              </div>
            );
          })}
          {!items.length && !busy ? <div className="muted">Kayıt yok.</div> : null}
        </div>
      </div>
    </div>
  );
}

