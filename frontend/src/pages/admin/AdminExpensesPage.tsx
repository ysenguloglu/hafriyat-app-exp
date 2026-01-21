import React from "react";
import { Link } from "react-router-dom";
import { adminApi, type Expense, type Vehicle } from "./api";

const EXPENSE_TYPES = ["Yakıt", "Bakım", "Yedek Parça", "Vergi", "Sigorta", "Diğer"];

export function AdminExpensesPage() {
  const [items, setItems] = React.useState<Expense[]>([]);
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [date, setDate] = React.useState("");
  const [vehicleId, setVehicleId] = React.useState("");
  const [expenseType, setExpenseType] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const loadExpenses = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setItems(await adminApi.expenses.list());
    } catch (e: any) {
      setError(e?.message ?? "Giderler yüklenemedi");
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

  React.useEffect(() => {
    void loadExpenses();
    void loadVehicles();
  }, [loadExpenses, loadVehicles]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminApi.expenses.create({
        date,
        vehicle_id: Number(vehicleId),
        expense_type: expenseType,
        amount: Number(amount),
        description: description || null
      });
      setDate("");
      setVehicleId("");
      setExpenseType("");
      setAmount("");
      setDescription("");
      await loadExpenses();
    } catch (e: any) {
      setError(e?.message ?? "Gider eklenemedi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="h1">Giderler</div>
      {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

      <div className="card card-pad" style={{ marginBottom: 12 }}>
        <div className="h2">Yeni gider</div>
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
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Masraf Tipi</div>
            <select
              className="input"
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value)}
              required
            >
              <option value="">Seçiniz...</option>
              {EXPENSE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Tutar</div>
            <input
              className="input"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
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
          <button className="btn" onClick={loadExpenses} disabled={busy}>
            Yenile
          </button>
        </div>
        <div className="grid">
          {items.map((x) => {
            const vehicle = vehicles.find(v => v.id === x.vehicle_id);
            return (
              <div key={x.id} className="card card-pad">
                <div className="row">
                  <div>
                    <div className="h2">
                      {x.date} • {x.expense_type}
                    </div>
                    <div className="muted">{vehicle ? `${vehicle.plate} - ${vehicle.vehicle_type}` : `Araç: ${x.vehicle_id}`}</div>
                    {x.description ? <div className="muted">{x.description}</div> : null}
                  </div>
                  <div className="spacer" />
                  <div className="h2">{Number(x.amount).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</div>
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

