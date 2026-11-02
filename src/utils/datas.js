


export function paraIso(dataBr) {
  if (!dataBr || dataBr.length !== 10) return null;
  const [d, m, a] = dataBr.split("/");
  return `${a}-${m}-${d}`;
}

// "2026-11-05" -> "05/11/2026"
export function paraBr(dataIso) {
  if (!dataIso) return "";
  const [a, m, d] = String(dataIso).split("-");
  return `${d}/${m}/${a}`;
}


export function partesData(dataIso) {
  if (!dataIso) return { dia: "", mes: "", completa: "" };
  const [a, m, d] = String(dataIso).split("-");
  return { dia: d, mes: m, completa: `${d}/${m}/${a}` };
}
