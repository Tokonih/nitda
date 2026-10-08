import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getYearsApi,
    getSingleYearApi,
    createYearApi,
    updateYearApi,
    deleteYearApi,
} from "./Utils/Api/year";

// Fetch all years with optional search and pagination
export const fetchYears = createAsyncThunk(
    "years/fetchYears",
    async ({ search, per_page, page, all, is_active } = {}, thunkAPI) => {
        try {
            const response = await getYearsApi({ search, per_page, page, all, is_active });
            return {
                list: response?.data || [],
                pagination: response?.meta?.pagination || {},
            };
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

// Fetch single year by ID
export const getSingleYear = createAsyncThunk(
    "years/getSingleYear",
    async (id, thunkAPI) => {
        try {
            const response = await getSingleYearApi(id);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

// Create new year
export const createYear = createAsyncThunk(
    "years/createYear",
    async (yearData, thunkAPI) => {
        try {
            const response = await createYearApi(yearData);
            if (
                response.status === "success" ||
                response.code === 201 ||
                response.code === 200
            ) {
                return response.data;
            }
            return thunkAPI.rejectWithValue(response);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

// Update year
export const updateYear = createAsyncThunk(
    "years/updateYear",
    async ({ id, yearData }, thunkAPI) => {
        try {
            const response = await updateYearApi(id, yearData);
            if (response.status === "success" || response.code === 200) {
                return response.data;
            }
            return thunkAPI.rejectWithValue(response);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

// Delete year
export const deleteYear = createAsyncThunk(
    "years/deleteYear",
    async (id, thunkAPI) => {
        try {
            const response = await deleteYearApi(id);
            if (response.status === "success" || response.code === 200) {
                return id;
            }
            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

const yearSlice = createSlice({
    name: "years",
    initialState: {
        list: [],
        currentYear: null,
        loading: false,
        error: null,
        pagination: {},
    },
    reducers: {
        clearCurrentYear: (state) => {
            state.currentYear = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch years
            .addCase(fetchYears.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchYears.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.list;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchYears.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get single year
            .addCase(getSingleYear.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.currentYear = null;
            })
            .addCase(getSingleYear.fulfilled, (state, action) => {
                state.loading = false;
                state.currentYear = action.payload;
            })
            .addCase(getSingleYear.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create year
            .addCase(createYear.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createYear.fulfilled, (state, action) => {
                state.loading = false;
                state.list.push(action.payload);
            })
            .addCase(createYear.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update year
            .addCase(updateYear.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateYear.fulfilled, (state, action) => {
                state.loading = false;
                state.list = state.list.map((year) =>
                    year.id === action.payload.id ? action.payload : year
                );
                state.currentYear = action.payload;
            })
            .addCase(updateYear.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete year
            .addCase(deleteYear.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteYear.fulfilled, (state, action) => {
                state.loading = false;
                state.list = state.list.filter((year) => year.id !== action.payload);
            })
            .addCase(deleteYear.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCurrentYear } = yearSlice.actions;
export default yearSlice.reducer;
