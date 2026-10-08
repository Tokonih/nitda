import { useSelector } from "react-redux";

/**
 * Returns the global filter state set from the dashboard (Index page).
 * Pages that should adopt the dashboard's year/quarter/department selection
 * can use this hook to initialise their local state.
 *
 * Returns: { year: string, quarter: string, department: string }
 *   - year:       e.g. "2026"
 *   - quarter:    "All" | "1" | "2" | "3" | "4"
 *   - department: "" (all) or a department id string
 */
export const useGlobalFilter = () => {
  return useSelector((state) => state.globalFilter);
};
