import React from "react";
import { adminApi, type Vehicle } from "./api";

export function AdminVehiclesPage() {
  const [items, setItems] = React.useState<Vehicle[]>([]);
  const [plate, setPlate] = React.useState("");
  const [vehicleType, setVehicleType] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setItems(await adminApi.vehicles.list());
    } catch (e: any) {
      setError(e?.message ?? "Araçlar yüklenemedi");
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
      await adminApi.vehicles.create({ plate, vehicle_type: vehicleType });
      setPlate("");
      setVehicleType("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Araç eklenemedi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="h1">Araçlar</div>
      {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

      <div className="card card-pad" style={{ marginBottom: 12 }}>
        <div className="h2">Yeni araç</div>
        <form onSubmit={create} className="row row-wrap">
          <input className="input" style={{ flex: 1, minWidth: 160 }} placeholder="Plaka" value={plate} onChange={(e) => setPlate(e.target.value)} required />
          <input className="input" style={{ flex: 1, minWidth: 160 }} placeholder="Tip (Kamyon vb.)" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} required />
          <button className="btn btn-primary" type="submit" disabled={busy}>
            Ekle
          </button>
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
          {items.map((v) => (
            <div key={v.id} className="card card-pad">
              <div className="row">
                <div>
                  <div className="h2">{v.plate}</div>
                  <div className="muted">{v.vehicle_type}</div>
                </div>
                <div className="spacer" />
                <div className="muted">{v.is_active ? "Aktif" : "Pasif"}</div>
              </div>
            </div>
          ))}
          {!items.length && !busy ? <div className="muted">Kayıt yok.</div> : null}
        </div>
      </div>
    </div>
  );
}

