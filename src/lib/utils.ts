import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumberWithCommas(value: string | number): string {
  if (value === null || value === undefined || value === "") return "";

  // Remove existing commas for cleaning
  const stringValue = String(value).replace(/,/g, "");

  // Handle empty or invalid input after stripping
  if (isNaN(Number(stringValue)) && stringValue !== "." && stringValue !== "-") {
    return stringValue;
  }

  // Split into integer and decimal parts
  const parts = stringValue.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return parts.join(".");
}

export function stripCommas(value: string): string {
  if (!value) return "";
  return value.replace(/,/g, "");
}

/**
 * Derives a human-readable unit label from the KPI unit type and name.
 */
export function getFormattedUnit(unit: string, kpiName: string = ""): string {
  if (!unit) return "";

  const normalizedUnit = unit.toLowerCase();

  if (normalizedUnit === "percentage_of") return "%";
  if (normalizedUnit === "value_of") return "value";

  if (normalizedUnit === "number_of") {
    if (!kpiName) return "participants";

    // Look for common nouns in the name to use as labels
    const name = kpiName.toLowerCase();

    // Common mappings based on project data
    if (name.includes("citizen")) return "citizens";
    if (name.includes("youth")) return "youths";
    if (name.includes("location")) return "locations";
    if (name.includes("student")) return "students";
    if (name.includes("user")) return "users";
    if (name.includes("startup") || name.includes("start-up")) return "startups";
    if (name.includes("partner")) return "partners";
    if (name.includes("device")) return "devices";
    if (name.includes("infrastructure") || name.includes("system")) return "units";

    // Check if the name already ends with a plural noun or has "number of [noun]"
    const match = kpiName.match(/number of ([\w\s-]+)/i);
    if (match && match[1]) {
      const noun = match[1].trim().split(" ")[0]; // Get the first word after "number of"
      // Basic pluralization check or just use the noun
      return noun.toLowerCase();
    }

    return "participants"; // Default fallback
  }

  return unit;
}

/**
 * Extracts a human-readable error message from a backend error response.
 */
export function getErrorMessage(error: any): string {
  if (!error) return "Something went wrong. Please try again.";

  // Handle network errors (when there's no response)
  if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
    return "Network error. Please check your internet connection.";
  }

  // Extract data from Axios/Redux error structure
  const data = error?.response?.data || error;
  const status = error?.response?.status;

  // Handle common HTTP status codes if no specific message is provided
  if (!data?.errors && !data?.message && !data?.error && typeof data !== "string") {
    if (status === 401) return "Session expired. Please log in again.";
    if (status === 403) return "You do not have permission to perform this action.";
    if (status === 404) return "The requested resource was not found.";
    if (status >= 500) return "Server error. Please try again later.";
  }

  // Handle Laravel-style validation errors (data.errors)
  if (data?.errors) {
    let messages = Object.values(data.errors).flat() as string[];

    // Specific fix for redundant target sum errors in this project
    const targetErrorSuffix = "must equal the sum of Q1-Q4 targets.";
    const targetSumErrors = messages.filter(m => typeof m === 'string' && m.includes(targetErrorSuffix));
    if (targetSumErrors.length > 1) {
      const preferredMsg = targetSumErrors.find(m => m.includes("Target annual")) || targetSumErrors[0];
      messages = messages.filter(m => typeof m !== 'string' || !m.includes(targetErrorSuffix) || m === preferredMsg);
    }

    return Array.from(new Set(messages)).join(" ");
  }

  // Handle 'message', 'msg', or 'error' top-level keys
  const messageCandidate = data?.message || data?.msg || data?.error;
  if (messageCandidate) {
    if (typeof messageCandidate === "string") return messageCandidate;
    if (Array.isArray(messageCandidate)) return messageCandidate.join(" ");
    if (typeof messageCandidate === "object") {
      return Object.values(messageCandidate).flat().join(" ");
    }
  }

  // Handle raw string or array of strings
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.join(" ");

  // Fallback
  return "Something went wrong. Please try again.";
}


/**
 * Checks if a file is previewable based on its extension.
 */
export function isPreviewableFile(filename: string | null | undefined): boolean {
  if (!filename) return false;
  const previewableExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return previewableExtensions.includes(ext);
}

/**
 * Returns the URL to be used in an iframe for previewing.
 * For PDF/Images, returns the direct URL.
 * For Word/Excel, returns the Google Docs Viewer URL.
 */
export function getPreviewUrl(fileUrl: string | null | undefined): string {
  if (!fileUrl) return "";

  const officeExtensions = [".docx", ".doc", ".xlsx", ".xls"];
  const lowerUrl = fileUrl.toLowerCase();
  const isOfficeDoc = officeExtensions.some(ext => lowerUrl.endsWith(ext));

  if (isOfficeDoc) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  }

  // For PDFs, append toolbar=0 if not already present
  if (lowerUrl.endsWith('.pdf') && !lowerUrl.includes('#')) {
    return `${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`;
  }

  return fileUrl;
}

/**
 * Ensures a file URL is absolute by prepending the base domain if it's a relative path.
 * Strips /api/v1 from the base URL if present to point to the domain root.
 */
export function getAbsoluteFileUrl(fileUrl: string | null | undefined): string {
  if (!fileUrl) return "";

  // If URL is already absolute (starts with http:// or https://), return as is
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl;
  }

  // Get base URL from env
  let baseUrl = (import.meta as any).env.VITE_BASE_URL_PROD;

  // If env var is missing, try to construct a reasonable default or use current origin
  if (!baseUrl) {
    if (typeof window !== "undefined") {
      baseUrl = window.location.origin;
    } else {
      baseUrl = "";
    }
  }

  // Refined logic: Identify if it's a storage file.
  // We check for "storage/" or known storage folder prefixes, or if it has a file extension
  // which strongly implies it's a static resource rather than an API route.
  const lowerFileUrl = fileUrl.toLowerCase();
  const storageKeywords = ["storage/", "stakeholder-activity-evidence/", "kpi-evidence/"];
  const isStorageFile = storageKeywords.some(keyword => lowerFileUrl.includes(keyword)) ||
    (lowerFileUrl.includes('.') && !lowerFileUrl.includes('/api/'));

  // If it's a storage file, we point to the domain root (stripping /api/v1)
  const rootUrl = isStorageFile ? baseUrl.split("/api")[0] : baseUrl;

  let finalPath = fileUrl;
  // If it's a storage file and missing the "storage/" prefix, we must prepend it 
  // because the public disk in Laravel/Symfony is typically accessed via /storage
  if (isStorageFile && !lowerFileUrl.startsWith("storage/") && !lowerFileUrl.includes("/storage/")) {
    finalPath = "storage/" + (fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl);
  }

  // Ensure no double slashes when joining
  const cleanPath = finalPath.startsWith("/") ? finalPath.substring(1) : finalPath;
  const cleanRootUrl = rootUrl.endsWith("/") ? rootUrl : rootUrl + "/";

  return cleanRootUrl + cleanPath;
}

/**
 * Forces a file download by fetching it as a blob.
 * This bypasses browser behavior of opening PDFs/Images in new tabs.
 */
export async function forceDownload(url: string, filename: string) {
  try {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};

    // If we're fetching from /storage, try WITHOUT headers first to avoid CORS preflight.
    // Most storage folders are public and don't need the token anyway.
    // Adding custom headers like Authorization makes the request "non-simple" and triggers preflight.
    const isStorageFile = url.includes("/storage/");

    if (token && !isStorageFile) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      // If unauthorized, try one last time WITH the token (if we skipped it earlier)
      if (response.status === 401 && isStorageFile && token) {
        const authResponse = await fetch(url, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!authResponse.ok) throw new Error(`Auth fetch failed: ${authResponse.status}`);
        return await triggerBlobDownload(authResponse, filename);
      }
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    return await triggerBlobDownload(response, filename);
  } catch (error) {
    console.error("Force download failed:", error);
    // FALLBACK: If fetch fails (CORS, network error, etc.), 
    // use the standard browser link method.
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "download";
    link.target = "_blank"; // Falls back to new tab for PDFs/Images but works
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Helper to handle the blob conversion and link trigger
 */
async function triggerBlobDownload(response: Response, filename: string) {
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename || "download";
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}
