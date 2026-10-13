export function normalizeAssetPath(p?: string | null) {
  if (!p) return "";
  return p.replace(/^\/+/, "");
}
