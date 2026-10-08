/**
 * Cookie-based persistence for the global year/quarter/department filter.
 * Expires after 2 days.
 */

const COOKIE_NAME = "srap_filters";
const EXPIRY_DAYS = 2;

/** Write filter values to the cookie */
export const saveFilterCookie = ({ year, quarter, department } = {}) => {
  const existing = readFilterCookie();
  const merged = {
    ...existing,
    ...(year !== undefined && { year }),
    ...(quarter !== undefined && { quarter }),
    ...(department !== undefined && { department }),
  };

  const expires = new Date();
  expires.setDate(expires.getDate() + EXPIRY_DAYS);

  document.cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(merged))}`,
    `expires=${expires.toUTCString()}`,
    "path=/",
    "SameSite=Lax",
  ].join("; ");
};

/** Read filter values from the cookie. Returns {} if not set or invalid. */
export const readFilterCookie = () => {
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (!match) return {};
    const raw = decodeURIComponent(match.split("=").slice(1).join("="));
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
};

/** Clear the filter cookie */
export const clearFilterCookie = () => {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};
