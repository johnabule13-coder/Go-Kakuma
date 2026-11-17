export const km = (a, b) => {
  if (!a || !b) return null;
  const r = d => d * Math.PI / 180, R = 6371;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat/2)**2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
