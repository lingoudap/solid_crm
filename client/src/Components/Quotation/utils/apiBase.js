export function getApiBase() {
  const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
  return base.replace(/\/$/, "");
}
