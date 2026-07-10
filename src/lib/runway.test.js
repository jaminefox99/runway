import { describe, it, expect } from "vitest";
import { simulate, runwayMonths, formatRunway } from "./runway.js";

const base = { cash: 10000, burn: 2000, invoices: [] };

describe("simulate", () => {
  it("drains by the burn each month", () => {
    const s = simulate(base);
    expect(s[0]).toBe(10000);
    expect(s[1]).toBe(8000);
    expect(s[5]).toBe(0);
  });

  it("ignores unpaid invoices unless asked", () => {
    const invoices = [{ amount: 5000, month: 1, confirmed: false }];
    expect(simulate({ ...base, invoices })[1]).toBe(8000);
    expect(simulate({ ...base, invoices, includeUnpaid: true })[1]).toBe(13000);
  });

  it("sets tax aside on incoming money only", () => {
    const invoices = [{ amount: 1000, month: 1, confirmed: true }];
    // 10000 - 2000 + (1000 * 0.8) = 8800
    expect(simulate({ ...base, invoices, taxRate: 0.2 })[1]).toBe(8800);
  });
});

describe("runwayMonths", () => {
  it("interpolates inside the month", () => {
    // 5000 cash, 2000/mo → crosses zero at 2.5 months
    expect(runwayMonths(simulate({ cash: 5000, burn: 2000 }))).toBeCloseTo(2.5);
  });

  it("returns 0 when already broke", () => {
    expect(runwayMonths([-1, -2])).toBe(0);
  });

  it("returns Infinity when income covers the burn", () => {
    expect(runwayMonths(simulate({ cash: 1000, burn: 0 }))).toBe(Infinity);
  });
});

describe("formatRunway", () => {
  it("renders infinity as a symbol", () => {
    expect(formatRunway(Infinity)).toBe("∞");
    expect(formatRunway(4.24)).toBe("4.2");
  });
});
