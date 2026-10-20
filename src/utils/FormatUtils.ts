/** "1 234 567 €" */
export const fmtMoney = (v: number) =>
  `${Math.round(v).toLocaleString("fr-FR")} €`;

/** Compact € for axis ticks and end labels: "500 k€", "1,2 M€". */
export const fmtAxis = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1e6) {
    return `${(v / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M€`;
  }
  if (abs >= 1e3) return `${Math.round(v / 1e3).toLocaleString("fr-FR")} k€`;
  return `${Math.round(v).toLocaleString("fr-FR")} €`;
};

/** "6,2 %" or "—" when unknown. */
export const fmtPct = (v: number | null) =>
  v === null
    ? "—"
    : `${v.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
