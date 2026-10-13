export function normalizeAssetPath(p?: string | null) {
  if (!p) return "";
  // remove leading slashes so paths are relative to index.html in the app bundle
  return p.replace(/^\/+/, "");
}

