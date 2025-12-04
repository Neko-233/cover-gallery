const store = new Map<string, number[]>();

export function allow(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const from = now - windowMs;
  const arr = store.get(key) || [];
  const filtered = arr.filter((t) => t > from);
  if (filtered.length >= max) {
    store.set(key, filtered);
    return false;
  }
  filtered.push(now);
  store.set(key, filtered);
  return true;
}
