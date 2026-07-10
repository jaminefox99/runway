# Runway

How many months until you run out.

A runway calculator for freelancers. Not "where did my money go last month" — the other question, the one you ask in the shower.

---

## Run it

Requires **Node.js 20+**.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # runs the math tests
npm run build    # production build into dist/
npm run preview  # serve the build locally
```

## Ship it

```bash
git init && git add -A && git commit -m "Runway"
gh repo create runway --public --push --source=.
```

Then import the repo at **vercel.com/new**. Framework preset: Vite. No environment variables, no build config to change. Every push to `main` deploys.

Once it's live over HTTPS, open it on a phone and choose *Add to Home Screen*. It installs, gets its own icon, and runs offline.

## Before you ship

- [ ] Export `public/icon-192.png` and `public/icon-512.png` from `public/favicon.svg`
- [ ] Change the seed data in `src/App.jsx` (`SEED`) or leave it as a worked example

---

## Files

```
index.html              Fonts, theme colour, mount point
vite.config.js          Vite + PWA manifest and offline precaching
src/
  main.jsx              Mounts React
  App.jsx               State, layout, the what-if panel
  styles.css            Design tokens and every style rule
  lib/
    runway.js           The product. simulate() and runwayMonths()
    runway.test.js      Tests for the above
    storage.js          localStorage, guarded
  components/
    Horizon.jsx         The chart
    Field.jsx           Input and toggle
```

## How the math works

`simulate()` walks the balance forward one month at a time for two years. Fixed costs leave at the start of each month. Invoices land in the month they're due. It returns an array of 25 balances.

It runs **twice**, producing two lines:

| Line | Includes | Drawn as |
|---|---|---|
| Confirmed | Cash + invoices already paid | Solid |
| Projected | Cash + all invoices, paid or not | Dotted |

Unpaid invoices are Schrödinger's money. Showing them as solid is how freelancers talk themselves into trouble, so they get a dotted line and no more.

`runwayMonths()` finds where the confirmed line crosses zero and **interpolates inside the month**. Rounding to whole months would be a lie: 3.0 months and 3.9 months are different decisions.

Tax is withheld from incoming money only, never from the cash you already hold — you've presumably already paid tax on that.

## Design decisions

**One number.** The hero is `4.2 months`, not a pie chart. If the app told you anything else first it would be a different app.

**The horizon.** Zero is drawn as a hard rule across the chart with the water below it. The line falls toward it. The crossing point is marked in rust. Nothing else on the chart competes for attention.

**No bank connection.** v1 stores everything in `localStorage` on the device. No account, no server, no open banking API, no financial-data compliance obligations. Add aggregation (Plaid, TrueLayer, GoCardless) later, if people ask — the calculation is the value, not the plumbing.

**Type.** Figures are set in IBM Plex Mono with tabular numerals, because money belongs in a ledger face and numbers shouldn't shuffle sideways as they change. Everything else is Space Grotesk.

## Where to take it next

- **Irregular income** — model a distribution of past months rather than a flat burn
- **Target date** — "I need to survive until March. What must I bill?"
- **Multiple scenarios** — save and compare what-ifs side by side
- **Export** — a CSV your accountant will actually accept

## Wrapping it as a native app

The same codebase, no rewrite:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init Runway com.yourname.runway
npm install @capacitor/ios @capacitor/android
npm run build && npx cap add ios && npx cap add android
```

Do this only when you have a reason. An App Store listing costs $99/year and a review queue; a PWA costs nothing and updates instantly.
