import QUOTATION_CONFIG from "../config";

export function getApiBase() {
  return QUOTATION_CONFIG.API.BASE_URL.replace(/\/$/, "");
}
