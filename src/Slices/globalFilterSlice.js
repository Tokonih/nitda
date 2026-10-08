import { createSlice } from "@reduxjs/toolkit";
import { readFilterCookie } from "@/lib/filterCookies";

const currentYear = new Date().getFullYear().toString();

// Seed from cookie if available (persists across page refreshes for 2 days)
const cookieFilters = readFilterCookie();

const globalFilterSlice = createSlice({
  name: "globalFilter",
  initialState: {
    year: cookieFilters.year || currentYear,
    quarter: cookieFilters.quarter || "All",   // "All" | "1" | "2" | "3" | "4"
    department: cookieFilters.department || "", // "" = all departments, otherwise department id string
  },
  reducers: {
    setGlobalYear(state, action) {
      state.year = action.payload;
    },
    setGlobalQuarter(state, action) {
      state.quarter = action.payload;
    },
    setGlobalDepartment(state, action) {
      state.department = action.payload;
    },
    setGlobalFilters(state, action) {
      const { year, quarter, department } = action.payload;
      if (year !== undefined) state.year = year;
      if (quarter !== undefined) state.quarter = quarter;
      if (department !== undefined) state.department = department;
    },
  },
});

export const {
  setGlobalYear,
  setGlobalQuarter,
  setGlobalDepartment,
  setGlobalFilters,
} = globalFilterSlice.actions;

export default globalFilterSlice.reducer;
