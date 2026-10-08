import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createKpiApi,
  createKpiValueApi,
  createKpiValueUploadMonthApi,
  deleteKpiApi,
  getKpiOpenPeriodApi,
  getKpisApi,
  getKpiValuesApi,
  getSingleKpiApi,
  updateKpiApi,
  updateKpiValueApi,
  bulkCloseKpiPeriodsApi,
  openKpiPeriodApi,
  bulkOpenKpiPeriodsApi,
  approveKpiApi,
  disapproveKpiApi,
} from "./Utils/Api/kpi";

export const fetchAllKpi = createAsyncThunk(
  "kpi/fetchAllKpi",
  async (params, thunkAPI) => {
    try {
      const response = await getKpisApi(params);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const fetchAllKpiOpenPeriod = createAsyncThunk(
  "kpi/fetchAllKpiOpenPeriod",
  async (params, thunkAPI) => {
    try {
      const response = await getKpiOpenPeriodApi(params);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const createKpi = createAsyncThunk(
  "kpi/createKpi",
  async (kpiData, thunkAPI) => {
    try {
      const response = await createKpiApi(kpiData);
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

export const createKpiValue = createAsyncThunk(
  "kpi/createKpiValue",
  async (kpiData, thunkAPI) => {
    try {
      const response = await createKpiValueApi(kpiData);
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

export const createKpiValueUploadMonth = createAsyncThunk(
  "kpi/createKpiValueUploadMonth",
  async (formData, thunkAPI) => {
    try {
      const response = await createKpiValueUploadMonthApi(formData);
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

export const updateKpiValue = createAsyncThunk(
  "kpi/updateKpiValue",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await updateKpiValueApi(id, data);
      if (
        response.status === "success" ||
        response.code === 200 ||
        response.code === 201
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

export const fetchKpiValues = createAsyncThunk(
  "kpi/fetchKpiValues",
  async (params, thunkAPI) => {
    try {
      const response = await getKpiValuesApi(params);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const updateKpi = createAsyncThunk(
  "kpi/updateKpi",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await updateKpiApi(id, data);
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

export const deleteKpi = createAsyncThunk(
  "kpi/deleteKpi",
  async (id, thunkAPI) => {
    try {
      const response = await deleteKpiApi(id);
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

export const bulkCloseKpiPeriods = createAsyncThunk(
  "kpi/bulkCloseKpiPeriods",
  async (data, thunkAPI) => {
    try {
      const response = await bulkCloseKpiPeriodsApi(data);
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

export const bulkOpenKpiPeriods = createAsyncThunk(
  "kpi/bulkOpenKpiPeriods",
  async (data, thunkAPI) => {
    try {
      const response = await bulkOpenKpiPeriodsApi(data);
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

export const openKpiPeriod = createAsyncThunk(
  "kpi/openKpiPeriod",
  async ({ kpiId, data }, thunkAPI) => {
    try {
      const response = await openKpiPeriodApi(kpiId, data);
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

export const approveKpi = createAsyncThunk(
  "kpi/approveKpi",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await approveKpiApi(id, data);
      if (response.status === "success" || response.code === 200) {
        return { id, ...response.data };
      }
      return thunkAPI.rejectWithValue(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const disapproveKpi = createAsyncThunk(
  "kpi/disapproveKpi",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await disapproveKpiApi(id, data);
      if (response.status === "success" || response.code === 200) {
        return { id, ...response.data };
      }
      return thunkAPI.rejectWithValue(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const fetchKpiById = createAsyncThunk(
  "kpi/fetchKpiById",
  async (id, thunkAPI) => {
    try {
      const response = await getSingleKpiApi(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

const kpiSlice = createSlice({
  name: "kpi",
  initialState: {
    list: [],
    values: [],
    openPeriods: [],
    loading: false,
    error: null,
    createdKpi: null,
    createdKpiValue: null,
    updatedKpi: null,
    deletedKpiId: null,
    pagination: {},
    singleKpi: null,
    singleKpiLoading: false,
    singleKpiError: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllKpi.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.list = []; // Clear list to prevent stale data/counts during loading
      })
      .addCase(fetchAllKpi.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
        state.pagination = action.payload.meta?.pagination || {};
      })
      .addCase(fetchAllKpi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create KPI
      .addCase(createKpi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createKpi.fulfilled, (state, action) => {
        state.loading = false;
        state.createdKpi = action.payload;
        state.list.push(action.payload); // add new KPI to list
      })
      .addCase(createKpi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update KPI
      .addCase(updateKpi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateKpi.fulfilled, (state, action) => {
        state.loading = false;
        state.updatedKpi = action.payload;
        state.list = state.list.map((kpi) =>
          kpi.id === action.payload.id ? action.payload : kpi
        );
      })
      .addCase(updateKpi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete KPI
      .addCase(deleteKpi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteKpi.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedKpiId = action.payload;
        state.list = state.list.filter((kpi) => kpi.id !== action.payload);
      })
      .addCase(deleteKpi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create KPI Value
      .addCase(createKpiValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createKpiValue.fulfilled, (state, action) => {
        state.loading = false;
        state.createdKpiValue = action.payload;
      })
      .addCase(createKpiValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create KPI Value Upload Month
      .addCase(createKpiValueUploadMonth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createKpiValueUploadMonth.fulfilled, (state, action) => {
        state.loading = false;
        state.createdKpiValue = action.payload;
      })
      .addCase(createKpiValueUploadMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update KPI Value
      .addCase(updateKpiValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateKpiValue.fulfilled, (state, action) => {
        state.loading = false;
        // Check if we need to update the value in state.values
        /* 
           Since fetchKpiValues is usually called to refresh the list, 
           we might just rely on that. But if we want optimistic updates:
        */
      })
      .addCase(updateKpiValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch KPI Values
      .addCase(fetchKpiValues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKpiValues.fulfilled, (state, action) => {
        state.loading = false;
        state.values = action.payload;
      })
      .addCase(fetchKpiValues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // KPI OPEN PERIOD
      .addCase(fetchAllKpiOpenPeriod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllKpiOpenPeriod.fulfilled, (state, action) => {
        state.loading = false;
        state.openPeriods = action.payload;
        // <-- store the full array
      })
      .addCase(fetchAllKpiOpenPeriod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk Close KPI Periods
      .addCase(bulkCloseKpiPeriods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkCloseKpiPeriods.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(bulkCloseKpiPeriods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Open KPI Period
      .addCase(openKpiPeriod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(openKpiPeriod.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(openKpiPeriod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk Open KPI Periods
      .addCase(bulkOpenKpiPeriods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkOpenKpiPeriods.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(bulkOpenKpiPeriods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Approve KPI Definition
      .addCase(approveKpi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveKpi.fulfilled, (state, action) => {
        state.loading = false;
        // Update the KPI list with the new status, ensuring we use local args if payload is partial
        const updatedFields = {
          approved: true,
          approval_comment: action.meta.arg.data.comment,
          status: 'Approved',
          ...action.payload
        };
        state.list = state.list.map((kpi) =>
          kpi.id === action.meta.arg.id ? { ...kpi, ...updatedFields } : kpi
        );
      })
      .addCase(approveKpi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Disapprove KPI Definition
      .addCase(disapproveKpi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disapproveKpi.fulfilled, (state, action) => {
        state.loading = false;
        // Update the KPI list with the new status, ensuring we use local args if payload is partial
        const updatedFields = {
          approved: false,
          approval_comment: action.meta.arg.data.comment,
          status: 'Revision Needed', // Helper for UI
          ...action.payload
        };
        state.list = state.list.map((kpi) =>
          kpi.id === action.meta.arg.id ? { ...kpi, ...updatedFields } : kpi
        );
      })
      .addCase(disapproveKpi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single KPI by ID
      .addCase(fetchKpiById.pending, (state) => {
        state.singleKpiLoading = true;
        state.singleKpiError = null;
        state.singleKpi = null;
      })
      .addCase(fetchKpiById.fulfilled, (state, action) => {
        state.singleKpiLoading = false;
        state.singleKpi = action.payload;
      })
      .addCase(fetchKpiById.rejected, (state, action) => {
        state.singleKpiLoading = false;
        state.singleKpiError = action.payload;
      });
  },
});

export default kpiSlice.reducer;
