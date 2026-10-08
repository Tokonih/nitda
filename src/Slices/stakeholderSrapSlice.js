import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "./Utils/axiosInstance";

// ============= API THUNKS =============

// FETCH STAKEHOLDER INITIATIVES (by pillar)
export const fetchStakeholderSrapInitiatives = createAsyncThunk(
  "stakeholderSrap/fetchInitiatives",
  async (params, { rejectWithValue }) => {
    try {
      // params = { pillar_id: "pillar-123", year: 2025, department_id: 5 }
      let query = `?pillar_id=${params.pillar_id}`;
      if (params.year) query += `&year=${params.year}`;
      // if (params.department_id) query += `&department_id=${params.department_id}`;
      query += `&visible_to_stakeholders=true`;

      const response = await axios.get(
        `/stakeholder-srap-initiatives${query}`
      );
      return response.data.data || response.data; // Returns array of stakeholder initiatives
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// CREATE STAKEHOLDER INITIATIVE
export const createStakeholderSrapInitiative = createAsyncThunk(
  "stakeholderSrap/createInitiative",
  async (payload, { rejectWithValue }) => {
    try {
      // payload = { name, description, pillar_id, year }
      const response = await axios.post(
        `/stakeholder-srap-initiatives`,
        payload
      );
      if (response.data.status === "success" || response.data.code === 201 || response.data.code === 200) {
        return response.data.data || response.data;
      }
      return rejectWithValue(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// GET SINGLE STAKEHOLDER INITIATIVE
export const getStakeholderSrapInitiative = createAsyncThunk(
  "stakeholderSrap/getInitiative",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/stakeholder-srap-initiatives/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// UPDATE STAKEHOLDER INITIATIVE
export const updateStakeholderSrapInitiative = createAsyncThunk(
  "stakeholderSrap/updateInitiative",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // id = "stakeholder-init-001"
      // data = { name, description, year }
      const response = await axios.put(
        `/stakeholder-srap-initiatives/${id}`,
        data
      );
      if (response.data.status === "success" || response.data.code === 200) {
        return response.data.data || response.data;
      }
      return rejectWithValue(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// DELETE STAKEHOLDER INITIATIVE
export const deleteStakeholderSrapInitiative = createAsyncThunk(
  "stakeholderSrap/deleteInitiative",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/stakeholder-srap-initiatives/${id}`);
      if (response.data.status === "success" || response.data.code === 200) {
        return id;
      }
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ============= REDUX SLICE =============

const stakeholderSrapSlice = createSlice({
  name: "stakeholderSrap",
  initialState: {
    list: [],
    selectedInitiative: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearStakeholderSrapState: (state) => {
      state.list = [];
      state.selectedInitiative = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch initiatives
    builder
      .addCase(fetchStakeholderSrapInitiatives.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.list = []; // Clear previous pillar's initiatives
      })
      .addCase(fetchStakeholderSrapInitiatives.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchStakeholderSrapInitiatives.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.list = [];
      });

    // Get single initiative
    builder
      .addCase(getStakeholderSrapInitiative.pending, (state) => {
        state.loading = true;
      })
      .addCase(getStakeholderSrapInitiative.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInitiative = action.payload;
      })
      .addCase(getStakeholderSrapInitiative.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create initiative
    builder
      .addCase(createStakeholderSrapInitiative.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStakeholderSrapInitiative.fulfilled, (state, action) => {
        state.loading = false;
        // Don't push here - let the fetch refetch for the current pillar
        // This prevents initiatives from appearing in other pillars
      })
      .addCase(createStakeholderSrapInitiative.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update initiative
    builder
      .addCase(updateStakeholderSrapInitiative.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStakeholderSrapInitiative.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(
          (init) => init.id === action.payload.id
        );
        if (index > -1) {
          state.list[index] = action.payload;
        }
        if (state.selectedInitiative?.id === action.payload.id) {
          state.selectedInitiative = action.payload;
        }
      })
      .addCase(updateStakeholderSrapInitiative.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete initiative
    builder
      .addCase(deleteStakeholderSrapInitiative.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStakeholderSrapInitiative.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((init) => init.id !== action.payload);
        if (state.selectedInitiative?.id === action.payload) {
          state.selectedInitiative = null;
        }
      })
      .addCase(deleteStakeholderSrapInitiative.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStakeholderSrapState } = stakeholderSrapSlice.actions;
export default stakeholderSrapSlice.reducer;
