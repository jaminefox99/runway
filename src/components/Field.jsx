export function Field({ label, value, onChange, prefix }) {
  return (
    <label>
      <span className="label">{label}</span>
      <div className="input-wrap">
        {prefix && <span className="prefix">{prefix}</span>}
        <input
          inputMode="decimal"
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}

export function Toggle({ on, onClick, children }) {
  return (
    <button className={`pill ${on ? "on" : ""}`} onClick={onClick} aria-pressed={on}>
      {children}
    </button>
  );
}
