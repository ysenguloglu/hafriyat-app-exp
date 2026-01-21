import React from "react";
import { adminApi, type Expense } from "./api";

export function AdminExpensesPage() {
  const [items, setItems] = React.useState<Expense[]>([]);
  const [date, setDate] = React.useState("");
  const [vehicleId, setVehicleId] = React.useState("");
  const [expenseType, setExpenseType] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
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

  React.useEffect(() => {
    void load();
  }, [load]);

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
      await load();
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
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <input
            className="input"
            inputMode="numeric"
            placeholder="Vehicle ID"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            required
          />
          <input className="input" placeholder="Gider tipi" value={expenseType} onChange={(e) => setExpenseType(e.target.value)} required />
          <input
            className="input"
            inputMode="decimal"
            placeholder="Tutar"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <input className="input" placeholder="Açıklama (opsiyonel)" value={description} onChange={(e) => setDescription(e.target.value)} />
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
          {items.map((x) => (
            <div key={x.id} className="card card-pad">
              <div className="row">
                <div>
                  <div className="h2">
                    {x.date} • {x.expense_type}
                  </div>
                  <div className="muted">Araç ID: {x.vehicle_id}</div>
                  {x.description ? <div className="muted">{x.description}</div> : null}
                </div>
                <div className="spacer" />
                <div className="h2">{x.amount}</div>
              </div>
            </div>
          ))}
          {!items.length && !busy ? <div className="muted">Kayıt yok.</div> : null}
        </div>
      </div>
    </div>
  );
}

