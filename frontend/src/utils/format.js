export const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));

export const shortDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};
