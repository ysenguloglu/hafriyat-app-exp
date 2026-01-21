import React from "react";
import { Link } from "react-router-dom";
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
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editDate, setEditDate] = React.useState("");
  const [editVehicleId, setEditVehicleId] = React.useState("");
  const [editDriverId, setEditDriverId] = React.useState("");
  const [editJobType, setEditJobType] = React.useState("");
  const [editFromLocation, setEditFromLocation] = React.useState("");
  const [editToLocation, setEditToLocation] = React.useState("");
  const [editTripCount, setEditTripCount] = React.useState("1");
  const [editIncomeAmount, setEditIncomeAmount] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
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

  const startEdit = (j: Job) => {
    setEditingId(j.id);
    setEditDate(j.date);
    setEditVehicleId(String(j.vehicle_id));
    setEditDriverId(String(j.driver_id));
    setEditJobType(j.job_type);
    setEditFromLocation(j.from_location);
    setEditToLocation(j.to_location);
    setEditTripCount(String(j.trip_count));
    setEditIncomeAmount(j.income_amount || "");
    setEditDescription(j.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDate("");
    setEditVehicleId("");
    setEditDriverId("");
    setEditJobType("");
    setEditFromLocation("");
    setEditToLocation("");
    setEditTripCount("1");
    setEditIncomeAmount("");
    setEditDescription("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setBusy(true);
    setError(null);
    try {
      await adminApi.jobs.update(editingId, {
        date: editDate,
        vehicle_id: Number(editVehicleId),
        driver_id: Number(editDriverId),
        job_type: editJobType,
        from_location: editFromLocation,
        to_location: editToLocation,
        trip_count: Number(editTripCount),
        income_amount: editIncomeAmount.trim() ? Number(editIncomeAmount) : null,
        description: editDescription.trim() ? editDescription : null
      });
      cancelEdit();
      await loadJobs();
    } catch (e: any) {
      setError(e?.message ?? "İş güncellenemedi");
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
            {vehicles.length === 0 ? (
              <div>
                <select className="input" disabled>
                  <option>Araç yok - Önce araç ekleyin</option>
                </select>
                <div style={{ marginTop: 6 }}>
                  <Link to="/admin/vehicles" style={{ color: "var(--color-primary)", textDecoration: "none", fontSize: 12 }}>
                    → Araçlar sayfasına git
                  </Link>
                </div>
              </div>
            ) : (
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
            )}
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Şoför</div>
            {drivers.length === 0 ? (
              <div>
                <select className="input" disabled>
                  <option>Şoför yok - Önce şoför ekleyin</option>
                </select>
                <div style={{ marginTop: 6 }}>
                  <Link to="/admin/drivers" style={{ color: "var(--color-primary)", textDecoration: "none", fontSize: 12 }}>
                    → Şoförler sayfasına git
                  </Link>
                </div>
              </div>
            ) : (
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
            )}
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>İş Tipi</div>
            <input 
              className="input" 
              placeholder="Örn: Hafriyat" 
              value={jobType} 
              onChange={(e) => {
                const val = e.target.value;
                const titleCase = val.split(" ").map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(" ");
                setJobType(titleCase);
              }} 
              required 
            />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Nereden</div>
            <input 
              className="input" 
              placeholder="Başlangıç lokasyonu" 
              value={fromLocation} 
              onChange={(e) => {
                const val = e.target.value;
                const titleCase = val.split(" ").map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(" ");
                setFromLocation(titleCase);
              }} 
              required 
            />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Nereye</div>
            <input 
              className="input" 
              placeholder="Varış lokasyonu" 
              value={toLocation} 
              onChange={(e) => {
                const val = e.target.value;
                const titleCase = val.split(" ").map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(" ");
                setToLocation(titleCase);
              }} 
              required 
            />
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
            <input 
              className="input" 
              placeholder="Açıklama" 
              value={description} 
              onChange={(e) => {
                const val = e.target.value;
                const titleCase = val.split(" ").map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(" ");
                setDescription(titleCase);
              }} 
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
          <button className="btn" onClick={loadJobs} disabled={busy}>
            Yenile
          </button>
        </div>
        <div className="grid">
          {items.map((j) => {
            const vehicle = vehicles.find(v => v.id === j.vehicle_id);
            const driver = drivers.find(d => d.id === j.driver_id);
            
            if (editingId === j.id) {
              return (
                <div key={j.id} className="card card-pad">
                  <div className="row" style={{ marginBottom: 10 }}>
                    <div className="h2">Düzenle</div>
                    <div className="spacer" />
                    <button className="btn" onClick={cancelEdit} disabled={busy}>
                      İptal
                    </button>
                  </div>
                  <div className="grid grid-2">
                    <div>
                      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Tarih</div>
                      <input className="input" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
                    </div>
                    <div>
                      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Araç</div>
                      <select
                        className="input"
                        value={editVehicleId}
                        onChange={(e) => setEditVehicleId(e.target.value)}
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
                        value={editDriverId}
                        onChange={(e) => setEditDriverId(e.target.value)}
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
                      <input 
                        className="input" 
                        placeholder="Örn: Hafriyat" 
                        value={editJobType} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const titleCase = val.split(" ").map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(" ");
                          setEditJobType(titleCase);
                        }} 
                        required 
                      />
                    </div>
                    <div>
                      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Nereden</div>
                      <input 
                        className="input" 
                        placeholder="Başlangıç lokasyonu" 
                        value={editFromLocation} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const titleCase = val.split(" ").map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(" ");
                          setEditFromLocation(titleCase);
                        }} 
                        required 
                      />
                    </div>
                    <div>
                      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Nereye</div>
                      <input 
                        className="input" 
                        placeholder="Varış lokasyonu" 
                        value={editToLocation} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const titleCase = val.split(" ").map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(" ");
                          setEditToLocation(titleCase);
                        }} 
                        required 
                      />
                    </div>
                    <div>
                      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Sefer Sayısı</div>
                      <input
                        className="input"
                        inputMode="numeric"
                        value={editTripCount}
                        onChange={(e) => setEditTripCount(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Gelir (opsiyonel)</div>
                      <input
                        className="input"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={editIncomeAmount}
                        onChange={(e) => setEditIncomeAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Açıklama (opsiyonel)</div>
                      <input 
                        className="input" 
                        placeholder="Açıklama" 
                        value={editDescription} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const titleCase = val.split(" ").map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(" ");
                          setEditDescription(titleCase);
                        }} 
                      />
                    </div>
                    <div>
                      <div style={{ height: 20 }} />
                      <button className="btn btn-primary" onClick={saveEdit} disabled={busy}>
                        Kaydet
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
            
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                    <div className="muted">{j.income_amount === null ? "Gelir: —" : `Gelir: ${Number(j.income_amount).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}`}</div>
                    <button className="btn" onClick={() => startEdit(j)} disabled={busy}>
                      Düzenle
                    </button>
                  </div>
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

