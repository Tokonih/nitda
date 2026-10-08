import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getStakeholderObjectivesApi,
  createStakeholderObjectivesApi,
  updateStakeholderObjectiveApi,
  deleteStakeholderObjectiveApi,
} from "./Utils/Api/stakeholderObjectives";

// FETCH STAKEHOLDER OBJECTIVES (by initiative)
export const fetchStakeholderObjectives = createAsyncThunk(
  "stakeholderObjectives/fetch",
  async (params, { rejectWithValue }) => {
    try {
      // params = { srap_initiative_id: "123" }
      const finalParams = {
        // objective_code: "OBJ-SEC",
        per_page: 15,
        ...params
      };
      if (finalParams.department_id) delete finalParams.department_id;
      const response = await getStakeholderObjectivesApi(finalParams);
      // Handle both { data: [...] } and [...] structures
      return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// FETCH ALL STAKEHOLDER OBJECTIVES (Flat list for sidebar)
export const fetchAllStakeholderObjectives = createAsyncThunk(
  "stakeholderObjectives/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      // params = { department_id, year }
      const finalParams = {
        per_page: 15,
        ...params
      };
      if (finalParams.department_id) delete finalParams.department_id;
      const response = await getStakeholderObjectivesApi(finalParams);
      // Handle both { data: [...] } and [...] structures
      return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
// CREATE STAKEHOLDER OBJECTIVE
export const createStakeholderObjective = createAsyncThunk(
  "stakeholderObjectives/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await createStakeholderObjectivesApi(payload);
      if (response.status === "success" || response.code === 201 || response.code === 200) {
        return response.data || response;
      }
      return rejectWithValue(response);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// UPDATE STAKEHOLDER OBJECTIVE
export const updateStakeholderObjective = createAsyncThunk(
  "stakeholderObjectives/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateStakeholderObjectiveApi(id, data);
      if (response.status === "success" || response.code === 200) {
        return response.data || response;
      }
      return rejectWithValue(response);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// DELETE STAKEHOLDER OBJECTIVE
export const deleteStakeholderObjective = createAsyncThunk(
  "stakeholderObjectives/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteStakeholderObjectiveApi(id);
      if (response.status === "success" || response.code === 200) {
        return id;
      }
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ============= REDUX SLICE =============

const stakeholderObjectivesSlice = createSlice({
  name: "stakeholderObjectives",
  initialState: {
    objectivesByInitiative: {}, // { initiativeId: [objectives] }
    list: [], // Flat list for sidebar
    loading: false,
    error: null,
  },
  reducers: {
    clearStakeholderObjectivesState: (state) => {
      state.objectivesByInitiative = {};
      state.list = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch objectives
    builder
      .addCase(fetchStakeholderObjectives.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStakeholderObjectives.fulfilled, (state, action) => {
        state.loading = false;
        // action.meta.arg contains the params passed to the thunk
        const initiativeId = action.meta.arg.srap_initiative_id;
        // Normalize items: ensure each item has department (object) and initiative id
        const items = Array.isArray(action.payload) ? action.payload : [];
        const normalized = items.map((it) => {
          const obj = { ...it };
          // ensure initiative id is present on the object (some backend responses use different keys)
          if (!obj.srap_initiative_id && initiativeId) {
            obj.srap_initiative_id = initiativeId;
          }
          // ensure department object exists if department_id provided
          if (!obj.department && obj.department_id) {
            obj.department = { id: obj.department_id, name: "" };
          }
          return obj;
        });

        if (initiativeId) {
          state.objectivesByInitiative[initiativeId] = normalized;
        } else {
          state.list = normalized;
        }
      })
      .addCase(fetchStakeholderObjectives.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

      })
      // Fetch all objectives (flat list)
      .addCase(fetchAllStakeholderObjectives.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStakeholderObjectives.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllStakeholderObjectives.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

      });

    // Create objective
    builder
      .addCase(createStakeholderObjective.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStakeholderObjective.fulfilled, (state, action) => {
        state.loading = false;
        // Backend may not attach stakeholder_srap_initiative_id or department in response.
        // Use the original request payload (action.meta.arg) to attach missing fields
        const payload = action.meta?.arg || {};
        const created = { ...(action.payload || {}) };
        const initiativeId =
          created.srap_initiative_id ||
          payload.srap_initiative_id;
        // Attach initiative id if missing
        if (!created.srap_initiative_id && initiativeId) {
          created.srap_initiative_id = initiativeId;
        }
        // Attach department if missing but provided in request
        if (!created.department && payload.department_id) {
          created.department = { id: payload.department_id, name: "" };
        }

        if (initiativeId) {
          if (!state.objectivesByInitiative[initiativeId]) {
            state.objectivesByInitiative[initiativeId] = [];
          }
          // push the created objective so it appears immediately under the initiative
          state.objectivesByInitiative[initiativeId].push(created);
        }
      })
      .addCase(createStakeholderObjective.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update objective
    builder
      .addCase(updateStakeholderObjective.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStakeholderObjective.fulfilled, (state, action) => {
        state.loading = false;
        // Find and update the objective in all initiatives
        Object.keys(state.objectivesByInitiative).forEach((initiativeId) => {
          const index = state.objectivesByInitiative[initiativeId].findIndex(
            (obj) => obj.id === action.payload.id
          );
          if (index > -1) {
            state.objectivesByInitiative[initiativeId][index] = action.payload;
          }
        });
      })
      .addCase(updateStakeholderObjective.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete objective
    builder
      .addCase(deleteStakeholderObjective.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStakeholderObjective.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from all initiatives
        Object.keys(state.objectivesByInitiative).forEach((initiativeId) => {
          state.objectivesByInitiative[initiativeId] =
            state.objectivesByInitiative[initiativeId].filter(
              (obj) => obj.id !== action.payload
            );
        });
      })
      .addCase(deleteStakeholderObjective.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStakeholderObjectivesState } =
  stakeholderObjectivesSlice.actions;
export default stakeholderObjectivesSlice.reducer;
