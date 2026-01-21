import React from "react";
import { adminApi, type Vehicle } from "./api";

export function AdminVehiclesPage() {
  const [items, setItems] = React.useState<Vehicle[]>([]);
  const [plate, setPlate] = React.useState("");
  const [vehicleType, setVehicleType] = React.useState("");
  const [currentOdometer, setCurrentOdometer] = React.useState("");
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editPlate, setEditPlate] = React.useState("");
  const [editVehicleType, setEditVehicleType] = React.useState("");
  const [editCurrentOdometer, setEditCurrentOdometer] = React.useState("");
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
      await adminApi.vehicles.create({ 
        plate, 
        vehicle_type: vehicleType,
        current_odometer: currentOdometer.trim() ? Number(currentOdometer) : null
      });
      setPlate("");
      setVehicleType("");
      setCurrentOdometer("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Araç eklenemedi");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setEditPlate(v.plate);
    setEditVehicleType(v.vehicle_type);
    setEditCurrentOdometer(v.current_odometer ? String(v.current_odometer) : "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPlate("");
    setEditVehicleType("");
    setEditCurrentOdometer("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setBusy(true);
    setError(null);
    try {
      await adminApi.vehicles.update(editingId, {
        plate: editPlate,
        vehicle_type: editVehicleType,
        current_odometer: editCurrentOdometer.trim() ? Number(editCurrentOdometer) : null,
      });
      cancelEdit();
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Araç güncellenemedi");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    if (!confirm(currentStatus ? "Bu aracı pasif yapmak istediğinize emin misiniz?" : "Bu aracı aktif yapmak istediğinize emin misiniz?")) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await adminApi.vehicles.update(id, { is_active: !currentStatus });
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Araç durumu değiştirilemedi");
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
          <input 
            className="input" 
            style={{ flex: 1, minWidth: 160 }} 
            placeholder="Plaka (örn: 34ABC123)" 
            value={plate} 
            onChange={(e) => setPlate(e.target.value.toUpperCase().replace(/\s/g, ""))} 
            required 
          />
          <input 
            className="input" 
            style={{ flex: 1, minWidth: 160 }} 
            placeholder="Tip (Kamyon vb.)" 
            value={vehicleType} 
            onChange={(e) => {
              const val = e.target.value;
              // Title case: İlk harf büyük, diğerleri küçük
              const titleCase = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
              setVehicleType(titleCase);
            }} 
            required 
          />
          <input 
            className="input" 
            style={{ flex: 1, minWidth: 120 }} 
            inputMode="numeric"
            placeholder="Kilometre (opsiyonel)" 
            value={currentOdometer} 
            onChange={(e) => setCurrentOdometer(e.target.value)}
          />
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
              {editingId === v.id ? (
                <div>
                  <div className="row" style={{ marginBottom: 10 }}>
                    <div className="h2">Düzenle</div>
                    <div className="spacer" />
                    <button className="btn" onClick={cancelEdit} disabled={busy}>
                      İptal
                    </button>
                  </div>
                  <div className="grid grid-2" style={{ marginBottom: 10 }}>
                    <input
                      className="input"
                      placeholder="Plaka"
                      value={editPlate}
                      onChange={(e) => setEditPlate(e.target.value.toUpperCase().replace(/\s/g, ""))}
                    />
                    <input
                      className="input"
                      placeholder="Tip"
                      value={editVehicleType}
                      onChange={(e) => {
                        const val = e.target.value;
                        const titleCase = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
                        setEditVehicleType(titleCase);
                      }}
                    />
                    <input
                      className="input"
                      inputMode="numeric"
                      placeholder="Kilometre (opsiyonel)"
                      value={editCurrentOdometer}
                      onChange={(e) => setEditCurrentOdometer(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={saveEdit} disabled={busy}>
                    Kaydet
                  </button>
                </div>
              ) : (
                <div className="row">
                  <div>
                    <div className="h2">{v.plate}</div>
                    <div className="muted">{v.vehicle_type}</div>
                    {v.current_odometer !== null ? (
                      <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                        Mevcut Kilometre: {v.current_odometer.toLocaleString("tr-TR")} km
                      </div>
                    ) : null}
                  </div>
                  <div className="spacer" />
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div className="muted">{v.is_active ? "Aktif" : "Pasif"}</div>
                    <button className="btn" onClick={() => startEdit(v)} disabled={busy}>
                      Düzenle
                    </button>
                    <button
                      className="btn"
                      onClick={() => toggleActive(v.id, v.is_active)}
                      disabled={busy}
                      style={{ color: v.is_active ? "var(--color-danger)" : "var(--color-primary)" }}
                    >
                      {v.is_active ? "Pasif Yap" : "Aktif Yap"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!items.length && !busy ? <div className="muted">Kayıt yok.</div> : null}
        </div>
      </div>
    </div>
  );
}

