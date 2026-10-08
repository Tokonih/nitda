import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createPillarApi,
  deletePillarApi,
  getPillarsApi,
  getSinglePillarApi,
  updatePillarApi,
  getPillarEntityCountsApi,
} from "./Utils/Api/pillar";

// ✅ use createAsyncThunk
export const fetchPillars = createAsyncThunk(
  "pillars/fetchPillars",
  async (params, thunkAPI) => {
    try {
      const response = await getPillarsApi(params);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const createPillar = createAsyncThunk(
  "pillars/createPillar",
  async (pillarData, thunkAPI) => {
    try {
      const response = await createPillarApi(pillarData);
      if (response.status === "success" || response.code === 201 || response.code === 200) {
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

export const updatePillar = createAsyncThunk(
  "pillars/updatePillar",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await updatePillarApi(id, data);
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

export const deletePillar = createAsyncThunk(
  "pillars/deletePillar",
  async (id, thunkAPI) => {
    try {
      const response = await deletePillarApi(id);
      if (response.status === "success" || response.code === 200 || response === id) {
        return id;
      }
      // If the API returns the ID directly on delete or success validation
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const getSinglePillar = createAsyncThunk(
  "pillars/getSinglePillar",
  async (id, thunkAPI) => {
    try {
      const response = await getSinglePillarApi(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const fetchPillarEntityCounts = createAsyncThunk(
  "pillars/fetchPillarEntityCounts",
  async (params, thunkAPI) => {
    try {
      const response = await getPillarEntityCountsApi(params);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

const pillarSlice = createSlice({
  name: "pillars",
  initialState: {
    list: [],
    loading: false,
    error: null,
    currentPillar: null,
    entityCounts: null,
    entityCountsLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPillars.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPillars.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchPillars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createPillar cases

      .addCase(createPillar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPillar.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createPillar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // update pillar
      .addCase(updatePillar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePillar.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updatePillar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Single pillar
      .addCase(getSinglePillar.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentPillar = null;
      })
      .addCase(getSinglePillar.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPillar = action.payload;
        // state.list.push(action.payload) ;
      })
      .addCase(getSinglePillar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete pillar

      .addCase(deletePillar.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.id !== action.payload);
      })

      // Entity counts
      .addCase(fetchPillarEntityCounts.pending, (state) => {
        state.entityCountsLoading = true;
        state.error = null;
      })
      .addCase(fetchPillarEntityCounts.fulfilled, (state, action) => {
        state.entityCountsLoading = false;
        state.entityCounts = action.payload;
      })
      .addCase(fetchPillarEntityCounts.rejected, (state, action) => {
        state.entityCountsLoading = false;
        state.error = action.payload;
      });
  },
});

export default pillarSlice.reducer;
