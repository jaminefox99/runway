import { useState, useEffect, useMemo } from "react";
import { simulate, runwayMonths, formatRunway } from "./lib/runway.js";
import { load, save } from "./lib/storage.js";
import Horizon from "./components/Horizon.jsx";
import { Field, Toggle } from "./components/Field.jsx";

const CURRENCIES = { GBP: "£", USD: "$", EUR: "€" };

// A worked example, so the first screen is never empty.
const SEED = {
  ccy: "GBP",
  cash: "8400",
  burn: "2600",
  taxRate: 0,
  invoices: [
    { id: 1, label: "Ridgeway rebrand", amount: 3200, month: 1, confirmed: true },
    { id: 2, label: "Halcyon retainer", amount: 1500, month: 2, confirmed: false },
  ],
};

const toNumber = (v) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;

export default function App() {
  const [state, setState] = useState(() => load() ?? SEED);
  const [gigOn, setGigOn] = useState(false);
  const [gigAmount, setGigAmount] = useState(3000);
  const [gigMonth, setGigMonth] = useState(2);

  const { ccy, cash, burn, taxRate, invoices } = state;
  const patch = (fields) => setState((s) => ({ ...s, ...fields }));

  // Debounced so typing doesn't hammer the disk.
  useEffect(() => {
    const t = setTimeout(() => save(state), 400);
    return () => clearTimeout(t);
  }, [state]);

  const symbol = CURRENCIES[ccy];
  const base = { cash: toNumber(cash), burn: toNumber(burn), invoices, taxRate };
  const gig = gigOn ? { amount: gigAmount, month: gigMonth } : null;

  const confirmed = useMemo(() => simulate({ ...base, includeUnpaid: false, gig }), [state, gigOn, gigAmount, gigMonth]);
  const projected = useMemo(() => simulate({ ...base, includeUnpaid: true, gig }), [state, gigOn, gigAmount, gigMonth]);

  const months = runwayMonths(confirmed);
  const without = runwayMonths(simulate({ ...base, includeUnpaid: false, gig: null }));
  const delta = Number.isFinite(months) && Number.isFinite(without) ? months - without : null;

  const setInvoices = (fn) => patch({ invoices: fn(invoices) });
  const editInvoice = (id, key, value) =>
    setInvoices((list) => list.map((i) => (i.id === id ? { ...i, [key]: value } : i)));

  return (
    <div className="page">
      <header className="header">
        <span className="wordmark">Runway</span>
        <select value={ccy} onChange={(e) => patch({ ccy: e.target.value })} aria-label="Currency">
          {Object.keys(CURRENCIES).map((k) => <option key={k}>{k}</option>)}
        </select>
      </header>

      <section>
        <div className={`figure ${months < 3 ? "low" : ""}`}>
          {formatRunway(months)}
          {Number.isFinite(months) && <span className="unit">months</span>}
        </div>
        <p className="sub">
          {months < 3
            ? "You hit zero before the quarter is out."
            : "Until your balance reaches zero at the current burn."}
        </p>

        <Horizon confirmed={confirmed} projected={projected} symbol={symbol} />
        <p className="legend">Solid: money you have. Dotted: money you've been promised.</p>
      </section>

      <section className="grid">
        <Field label="Cash on hand" value={cash} onChange={(v) => patch({ cash: v })} prefix={symbol} />
        <Field label="Monthly costs" value={burn} onChange={(v) => patch({ burn: v })} prefix={symbol} />
      </section>

      <section className="card">
        <div className="row-head">
          <h2>Invoices out</h2>
          <button
            className="ghost"
            onClick={() =>
              setInvoices((l) => [...l, { id: Date.now(), label: "New invoice", amount: 1000, month: 1, confirmed: false }])
            }
          >
            Add invoice
          </button>
        </div>

        {invoices.length === 0 && <p className="empty">Nothing owed to you. Add an invoice to extend the line.</p>}

        {invoices.map((inv) => (
          <div className="invoice" key={inv.id}>
            <input className="bare" value={inv.label} onChange={(e) => editInvoice(inv.id, "label", e.target.value)} />
            <input
              className="amount"
              inputMode="decimal"
              value={inv.amount}
              onChange={(e) => editInvoice(inv.id, "amount", toNumber(e.target.value))}
            />
            <select value={inv.month} onChange={(e) => editInvoice(inv.id, "month", +e.target.value)} aria-label="Due in">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>+{m}m</option>
              ))}
            </select>
            <Toggle on={inv.confirmed} onClick={() => editInvoice(inv.id, "confirmed", !inv.confirmed)}>
              {inv.confirmed ? "Paid" : "Unpaid"}
            </Toggle>
            <button
              className="remove"
              onClick={() => setInvoices((l) => l.filter((i) => i.id !== inv.id))}
              aria-label={`Remove ${inv.label}`}
            >
              ×
            </button>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="row-head">
          <h2>Set aside for tax</h2>
          <span className="prefix">{Math.round(taxRate * 100)}%</span>
        </div>
        <input
          type="range" min="0" max="0.5" step="0.05" value={taxRate}
          onChange={(e) => patch({ taxRate: +e.target.value })}
          aria-label="Tax rate"
        />
      </section>

      <section className="card">
        <div className="row-head">
          <h2>What if I take this gig?</h2>
          <Toggle on={gigOn} onClick={() => setGigOn((v) => !v)}>{gigOn ? "On" : "Off"}</Toggle>
        </div>

        <div className={gigOn ? "" : "disabled"}>
          <label className="label">Fee — {symbol}{gigAmount.toLocaleString()}</label>
          <input type="range" min="500" max="20000" step="500" value={gigAmount}
                 onChange={(e) => setGigAmount(+e.target.value)} />

          <label className="label">Paid in {gigMonth} month{gigMonth > 1 ? "s" : ""}</label>
          <input type="range" min="1" max="12" value={gigMonth}
                 onChange={(e) => setGigMonth(+e.target.value)} />

          {delta !== null && (
            <p className={`delta ${delta < 0 ? "negative" : ""}`}>
              {delta >= 0 ? "+" : ""}{delta.toFixed(1)} months
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
