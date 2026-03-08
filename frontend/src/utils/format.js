export const money = (value) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(Number(value || 0));

export const shortDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
};
