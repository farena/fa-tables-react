export function ucwords(str?: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/(^([a-zA-Z\p{M}]))|([ -][a-zA-Z\p{M}])/gu, (s) => s.toUpperCase());
}
