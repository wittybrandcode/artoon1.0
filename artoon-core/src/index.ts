export function escapeHtml(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
export function sanitizeUrl(u: string): string {
  if (!u) return '';
  const t = u.trim();
  if (t.match(/^(javascript|vbscript):/i)) return 'about:blank';
  if (t.match(/^data:/i) && !t.match(/^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/i)) return 'about:blank';
  return t;
}
export function generateId(p: string = 'block'): string {
  return `${p}-${Math.random().toString(36).substring(2, 9)}-${Date.now().toString(36)}`;
}
