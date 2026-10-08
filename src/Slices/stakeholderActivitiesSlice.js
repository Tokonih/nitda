import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getStakeholderActivitiesApi,
  createStakeholderActivityApi,
  updateStakeholderActivityApi,
  deleteStakeholderActivityApi,
  getSingleStakeholderActivityApi,
  getStakeholderActivityValuesApi,
  getSingleStakeholderActivityValueApi,
  createStakeholderActivityValueApi,
  createStakeholderActivityValueUploadMonthApi,
  updateStakeholderActivityValueApi,
  deleteStakeholderActivityValueApi,
  getStakeholderActivityDashboardApi,
} from "./Utils/Api/stakeholderActivities";

export const fetchStakeholderActivities = createAsyncThunk(
  "stakeholderActivities/fetchStakeholderActivities",
  async (params, thunkAPI) => {
    try {
      const response = await getStakeholderActivitiesApi(params);
      // Return full response so the slice can extract both data and pagination
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  }
);

export const fetchSingleStakeholderActivity = createAsyncThunk(
  "stakeholderActivities/fetchSingleStakeholderActivity",
  async (id, thunkAPI) => {
    try {
      const response = await getSingleStakeholderActivityApi(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  }
);

export const createStakeholderActivity = createAsyncThunk(
  "stakeholderActivities/createStakeholderActivity",
  async (data, thunkAPI) => {
    try {
      const response = await createStakeholderActivityApi(data);
      if (response.status === "success" || response.code === 201 || response.code === 200) {
        return response.data;
      }
      return thunkAPI.rejectWithValue(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  }
);

export const updateStakeholderActivity = createAsyncThunk(
  "stakeholderActivities/updateStakeholderActivity",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await updateStakeholderActivityApi(id, data);
      if (response.status === "success" || response.code === 200) {
        return response.data;
      }
      return thunkAPI.rejectWithValue(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  }
);

export const deleteStakeholderActivity = createAsyncThunk(
  "stakeholderActivities/deleteStakeholderActivity",
  async (id, thunkAPI) => {
    try {
      const response = await deleteStakeholderActivityApi(id);
      if (response.status === "success" || response.code === 200) {
        return id;
      }
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  }
);

export const createStakeholderActivityValue = createAsyncThunk(
  "stakeholderActivities/createStakeholderActivityValue",
  async (data, thunkAPI) => {
    try {
      const response = await createStakeholderActivityValueApi(data);
      if (
        response.status === "success" ||
        response.code === 201 ||
        response.code === 200
      ) {
        return response.data;
      }
      return thunkAPI.rejectWithValue(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  }
);

export const createStakeholderActivityValueUploadMonth = createAsyncThunk(
  "stakeholderActivities/createStakeholderActivityValueUploadMonth",
  async (formData, thunkAPI) => {
    try {
      const response = await createStakeholderActivityValueUploadMonthApi(formData);
      if (
        response?.status === "success" ||
        response?.code === 201 ||
        response?.code === 200
      ) {
        return response.data;
      }
      return thunkAPI.rejectWithValue(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  }
);

export const updateStakeholderActivityValue = createAsyncThunk(
  "stakeholderActivities/updateStakeholderActivityValue",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await updateStakeholderActivityValueApi(id, data);
      if (
        response.status === "success" ||
        response.code === 200 ||
        response.code === 201
      ) {
        return response.data;
      }
      return thunkAPI.rejectWithValue(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  }
);

export const deleteStakeholderActivityValue = createAsyncThunk(
  "stakeholderActivities/deleteStakeholderActivityValue",
  async (id, thunkAPI) => {
    try {
      const response = await deleteStakeholderActivityValueApi(id);
      if (response.status === "success" || response.code === 200) {
        return id;
      }
      return thunkAPI.rejectWithValue(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  }
);

export const fetchStakeholderActivityValues = createAsyncThunk(
  "stakeholderActivities/fetchStakeholderActivityValues",
  async (params, thunkAPI) => {
    try {
      const response = await getStakeholderActivityValuesApi(params);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  }
);

export const fetchStakeholderActivityDashboard = createAsyncThunk(
  "stakeholderActivities/fetchStakeholderActivityDashboard",
  async (params, thunkAPI) => {
    try {
      const response = await getStakeholderActivityDashboardApi(params);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  }
);

export const fetchStakeholderActivityValueById = createAsyncThunk(
  "stakeholderActivities/fetchStakeholderActivityValueById",
  async (id, thunkAPI) => {
    try {
      const response = await getSingleStakeholderActivityValueApi(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error?.response?.data || error);
    }
  }
);

const stakeholderActivitiesSlice = createSlice({
  name: "stakeholderActivities",
  initialState: {
    list: [],
    listPagination: {},
    values: [],
    loading: false,
    error: null,
    createdActivity: null,
    updatedActivity: null,
    deletedActivityId: null,
    single: null,
    dashboardData: null,
    singleValue: null,
    singleValueLoading: false,
    singleValueError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchStakeholderActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStakeholderActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.data || action.payload || [];
        state.listPagination = action.payload?.meta?.pagination || {};
      })
      .addCase(fetchStakeholderActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single
      .addCase(fetchSingleStakeholderActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleStakeholderActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.single = action.payload;
      })
      .addCase(fetchSingleStakeholderActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createStakeholderActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStakeholderActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.createdActivity = action.payload;
        // push to list so UI reflects immediately
        if (action.payload) state.list.push(action.payload);
      })
      .addCase(createStakeholderActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateStakeholderActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStakeholderActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.updatedActivity = action.payload;
        state.list = state.list.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(updateStakeholderActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteStakeholderActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStakeholderActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedActivityId = action.payload;
        state.list = state.list.filter((i) => i.id !== action.payload);
      })
      .addCase(deleteStakeholderActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Activity Values
      .addCase(fetchStakeholderActivityValues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStakeholderActivityValues.fulfilled, (state, action) => {
        state.loading = false;
        state.values = action.payload;
      })
      .addCase(fetchStakeholderActivityValues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Activity Value
      .addCase(createStakeholderActivityValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStakeholderActivityValue.fulfilled, (state, action) => {
        state.loading = false;
        // The list is usually refreshed by fetchStakeholderActivityValues
      })
      .addCase(createStakeholderActivityValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Activity Value Upload Month
      .addCase(createStakeholderActivityValueUploadMonth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStakeholderActivityValueUploadMonth.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createStakeholderActivityValueUploadMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Activity Value
      .addCase(updateStakeholderActivityValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStakeholderActivityValue.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateStakeholderActivityValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Activity Value
      .addCase(deleteStakeholderActivityValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStakeholderActivityValue.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteStakeholderActivityValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Dashboard Data
      .addCase(fetchStakeholderActivityDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStakeholderActivityDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchStakeholderActivityDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single Stakeholder Activity Value by ID
      .addCase(fetchStakeholderActivityValueById.pending, (state) => {
        state.singleValueLoading = true;
        state.singleValueError = null;
        state.singleValue = null;
      })
      .addCase(fetchStakeholderActivityValueById.fulfilled, (state, action) => {
        state.singleValueLoading = false;
        state.singleValue = action.payload;
      })
      .addCase(fetchStakeholderActivityValueById.rejected, (state, action) => {
        state.singleValueLoading = false;
        state.singleValueError = action.payload;
      });
  },
});

export default stakeholderActivitiesSlice.reducer;
