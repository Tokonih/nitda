import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getObjectivesApi,
  createObjectivesApi,
  deleteObjectiveApi,
  getSingleObjectiveApi,
  updateObjectiveApi,
  bulkUpdateObjectiveVisibilityApi,
} from "./Utils/Api/objectives";

// ──────────────────────────────
// Async thunks
// ──────────────────────────────

// Fetch all objectives
export const fetchObjectives = createAsyncThunk(
  "objectives/fetchObjectives",
  async (filters = {}, thunkAPI) => {
    try {
      const response = await getObjectivesApi(filters);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch objectives"
      );
    }
  }
);

// Create new objective
export const createObjective = createAsyncThunk(
  "objectives/createObjective",
  async (data, thunkAPI) => {
    try {
      const response = await createObjectivesApi(data);
      if (response.status === "success" || response.code === 201 || response.code === 200) {
        return response.data;
      }
      return thunkAPI.rejectWithValue(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to create objective"
      );
    }
  }
);

// Get single objective by ID
export const fetchSingleObjective = createAsyncThunk(
  "objectives/fetchSingleObjective",
  async (id, thunkAPI) => {
    try {
      const response = await getSingleObjectiveApi(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch objective"
      );
    }
  }
);

// Update objective
export const updateObjective = createAsyncThunk(
  "objectives/updateObjective",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await updateObjectiveApi(id, data);
      if (response.status === "success" || response.code === 200) {
        return response.data;
      }
      return thunkAPI.rejectWithValue(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to update objective"
      );
    }
  }
);

// Delete objective
export const deleteObjective = createAsyncThunk(
  "objectives/deleteObjective",
  async (id, thunkAPI) => {
    try {
      const response = await deleteObjectiveApi(id);
      if (response.status === "success" || response.code === 200) {
        return id;
      }
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to delete objective"
      );
    }
  }
);

// Bulk update objective visibility
export const bulkUpdateObjectiveVisibility = createAsyncThunk(
  "objectives/bulkUpdateVisibility",
  async ({ objective_ids, visible_to_stakeholders }, thunkAPI) => {
    try {
      const response = await bulkUpdateObjectiveVisibilityApi({ objective_ids, visible_to_stakeholders });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to bulk update objective visibility"
      );
    }
  }
);

// ──────────────────────────────
// Slice
// ──────────────────────────────
const objectivesSlice = createSlice({
  name: "objectives",
  initialState: {
    list: [],
    singleObjective: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchObjectives.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchObjectives.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.data || action.payload;
      })
      .addCase(fetchObjectives.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createObjective.pending, (state) => {
        state.loading = true;
      })
      .addCase(createObjective.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload?.data || action.payload);
      })
      .addCase(createObjective.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single
      .addCase(fetchSingleObjective.fulfilled, (state, action) => {
        state.singleObjective = action.payload?.data || action.payload;
      })

      // Update
      .addCase(updateObjective.fulfilled, (state, action) => {
        const updated = action.payload?.data || action.payload;
        state.list = state.list.map((obj) =>
          obj.id === updated.id ? updated : obj
        );
      })

      // Delete
      .addCase(deleteObjective.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (obj) => obj.id !== action.payload
        );
      })

      // Bulk update visibility
      .addCase(bulkUpdateObjectiveVisibility.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkUpdateObjectiveVisibility.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(bulkUpdateObjectiveVisibility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default objectivesSlice.reducer;
