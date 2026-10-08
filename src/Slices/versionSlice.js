import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getVersionsApi,
    getSingleVersionApi,
    createVersionApi,
    updateVersionApi,
    deleteVersionApi,
} from "./Utils/Api/version";

// Fetch all versions with optional search and pagination
export const fetchVersions = createAsyncThunk(
    "versions/fetchVersions",
    async ({ search, per_page, page } = {}, thunkAPI) => {
        try {
            const response = await getVersionsApi({ search, per_page, page });
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

// Fetch single version by ID
export const getSingleVersion = createAsyncThunk(
    "versions/getSingleVersion",
    async (id, thunkAPI) => {
        try {
            const response = await getSingleVersionApi(id);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

// Create new version
export const createVersion = createAsyncThunk(
    "versions/createVersion",
    async (versionData, thunkAPI) => {
        try {
            const response = await createVersionApi(versionData);
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

// Update version
export const updateVersion = createAsyncThunk(
    "versions/updateVersion",
    async ({ id, versionData }, thunkAPI) => {
        try {
            const response = await updateVersionApi(id, versionData);
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

// Delete version
export const deleteVersion = createAsyncThunk(
    "versions/deleteVersion",
    async (id, thunkAPI) => {
        try {
            const response = await deleteVersionApi(id);
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

const versionSlice = createSlice({
    name: "versions",
    initialState: {
        list: [],
        currentVersion: null,
        loading: false,
        error: null,
        pagination: {},
    },
    reducers: {
        clearCurrentVersion: (state) => {
            state.currentVersion = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch versions
            .addCase(fetchVersions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVersions.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.list;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchVersions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get single version
            .addCase(getSingleVersion.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.currentVersion = null;
            })
            .addCase(getSingleVersion.fulfilled, (state, action) => {
                state.loading = false;
                state.currentVersion = action.payload;
            })
            .addCase(getSingleVersion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create version
            .addCase(createVersion.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createVersion.fulfilled, (state, action) => {
                state.loading = false;
                state.list.push(action.payload);
            })
            .addCase(createVersion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update version
            .addCase(updateVersion.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateVersion.fulfilled, (state, action) => {
                state.loading = false;
                state.list = state.list.map((version) =>
                    version.id === action.payload.id ? action.payload : version
                );
                state.currentVersion = action.payload;
            })
            .addCase(updateVersion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete version
            .addCase(deleteVersion.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteVersion.fulfilled, (state, action) => {
                state.loading = false;
                state.list = state.list.filter((version) => version.id !== action.payload);
            })
            .addCase(deleteVersion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCurrentVersion } = versionSlice.actions;
export default versionSlice.reducer;
