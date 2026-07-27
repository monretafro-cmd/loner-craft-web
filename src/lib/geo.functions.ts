import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Approximate, country-level visitor location from edge headers.
 * No precise/GPS location is ever requested.
 */
export const getVisitorCountry = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const headers = request.headers;
  const country =
    headers.get("cf-ipcountry") ??
    headers.get("x-vercel-ip-country") ??
    headers.get("x-country-code") ??
    headers.get("x-geo-country") ??
    null;

  return { country: country && country !== "XX" ? country.toUpperCase() : null };
});