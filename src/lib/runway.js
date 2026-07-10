// The whole product lives in this file. Everything else is presentation.

export const HORIZON = 24; // months we look ahead

/**
 * Walk the balance forward one month at a time.
 * Costs leave at the start of each month; invoices land in the month they're due.
 *
 * @param {number}  cash           Money in the bank today.
 * @param {number}  burn           Fixed monthly outgoings.
 * @param {Array}   invoices       [{ amount, month, confirmed }] — month is 1..12 from now.
 * @param {boolean} includeUnpaid  Count invoices that haven't been paid yet.
 * @param {object?} gig            Hypothetical job: { amount, month }.
 * @param {number}  taxRate        Fraction of incoming money set aside for tax (0–1).
 * @returns {number[]} balance at month 0, 1, 2 ... HORIZON
 */
export function simulate({ cash, burn, invoices = [], includeUnpaid = false, gig = null, taxRate = 0 }) {
  const net = (amount) => amount * (1 - taxRate);
  const series = [cash];
  let balance = cash;

  for (let m = 1; m <= HORIZON; m++) {
    balance -= burn;

    for (const inv of invoices) {
      if (inv.month !== m) continue;
      if (inv.confirmed || includeUnpaid) balance += net(inv.amount);
    }
    if (gig && gig.month === m) balance += net(gig.amount);

    series.push(balance);
  }
  return series;
}

/**
 * Where the balance first crosses zero, as a fractional number of months.
 * Returns 0 if already broke, Infinity if the line never crosses.
 *
 * We interpolate inside the month rather than rounding, because "3 months"
 * and "3.9 months" are different decisions.
 */
export function runwayMonths(series) {
  if (series[0] <= 0) return 0;

  for (let m = 1; m < series.length; m++) {
    if (series[m] <= 0) {
      const prev = series[m - 1];
      const drop = prev - series[m];
      return drop === 0 ? m - 1 : m - 1 + prev / drop;
    }
  }
  return Infinity;
}

/** Average monthly income implied by the invoices on the books. */
export function impliedIncome(invoices, includeUnpaid = true) {
  const relevant = invoices.filter((i) => i.confirmed || includeUnpaid);
  if (!relevant.length) return 0;
  const total = relevant.reduce((sum, i) => sum + i.amount, 0);
  const lastMonth = Math.max(...relevant.map((i) => i.month));
  return total / lastMonth;
}

/** Format for display: "4.2", or "∞" when the money never runs out. */
export function formatRunway(months) {
  return Number.isFinite(months) ? months.toFixed(1) : "∞";
}
