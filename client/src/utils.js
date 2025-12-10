// Converts objects materialised path to a string for display
export const getMaterialisedPathAsString = (path) => {
  if (!path || path.length === 0) return "—";
  return path.map((p) => p.description).join(" > ");
};

// Convert saved iso dates to format used to display date
export function formatDateForDisplay(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB");
}
