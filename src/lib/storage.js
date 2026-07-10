// Data never leaves the device. No account, no server, no bank connection.
// localStorage throws in private-browsing modes, so everything is guarded.

const KEY = "runway:v1";

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false; // full, blocked, or private mode — the app still works, it just forgets
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}
