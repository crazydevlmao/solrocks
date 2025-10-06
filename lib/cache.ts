// Simple in-memory cache refreshed by your API every 5 s
type Entry<T> = { value: T; expiry: number };
const store = new Map<string, Entry<any>>();

export function getCache<T>(key: string): T | null {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() > e.expiry) { store.delete(key); return null; }
  return e.value as T;
}

export function setCache<T>(key: string, value: T, ttlMs: number) {
  store.set(key, { value, expiry: Date.now() + ttlMs });
}
