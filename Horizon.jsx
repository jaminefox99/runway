import { HORIZON, runwayMonths } from "../lib/runway.js";

const W = 620;
const H = 240;
const PAD = 12;

/**
 * One chart, one idea: the balance falls toward a horizon called zero.
 * Solid line = money you have. Dotted line = money you've been promised.
 */
export default function Horizon({ confirmed, projected, symbol }) {
  const all = [...confirmed, ...projected];
  const top = Math.max(...all, 0);
  const bottom = Math.min(...all, 0);
  const span = top - bottom || 1;

  const x = (i) => PAD + (i / HORIZON) * (W - PAD * 2);
  const y = (v) => PAD + ((top - v) / span) * (H - PAD * 2);
  const path = (s) => s.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");

  const zeroY = y(0);
  const cross = runwayMonths(confirmed);
  const crossX = Number.isFinite(cross) ? x(cross) : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label={`Cash balance over the next ${HORIZON} months, reaching zero at ${cross.toFixed(1)} months`}
    >
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--teal)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* below the horizon is water */}
      <rect x="0" y={zeroY} width={W} height={Math.max(H - zeroY, 0)} fill="var(--rust)" opacity="0.05" />
      <line x1="0" y1={zeroY} x2={W} y2={zeroY} stroke="var(--ink)" strokeWidth="1" />
      <text x={W - 4} y={zeroY - 7} textAnchor="end" fontSize="10" letterSpacing="1.4"
            fill="var(--mute)" fontFamily="var(--mono)">ZERO</text>

      <path d={`${path(confirmed)} L${x(HORIZON)},${zeroY} L${x(0)},${zeroY} Z`} fill="url(#fade)" />

      <path className="draw" d={path(projected)} fill="none" stroke="var(--teal)"
            strokeWidth="1.5" strokeDasharray="3 4" opacity="0.55" />
      <path className="draw" d={path(confirmed)} fill="none" stroke="var(--teal)"
            strokeWidth="2.5" strokeLinecap="round" />

      {crossX !== null && (
        <>
          <line x1={crossX} y1={PAD} x2={crossX} y2={zeroY} stroke="var(--rust)"
                strokeWidth="1" strokeDasharray="2 3" />
          <circle cx={crossX} cy={zeroY} r="4.5" fill="var(--rust)" />
        </>
      )}

      {[6, 12, 18].map((m) => (
        <text key={m} x={x(m)} y={H - 1} textAnchor="middle" fontSize="10"
              fill="var(--mute)" fontFamily="var(--mono)">{m}m</text>
      ))}

      <text x={PAD} y={y(confirmed[0]) - 10} fontSize="11" fill="var(--mute)" fontFamily="var(--mono)">
        {symbol}{Math.round(confirmed[0]).toLocaleString()}
      </text>
    </svg>
  );
}
