import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createSrapApi,
  createSrapInitiativeApi,
  deleteSrapApi,
  deleteSrapInitiativeApi,
  getSingleSrapApi,
  getSingleSrapInitiativeApi,
  getSrapApi,
  getSrapInitiativesApi,
  updateSrapApi,
  updateSrapInitiativeApi,
} from "./Utils/Api/srap";

export const fetchSraps = createAsyncThunk(
  "sraps/fetchSraps",
  async (filters = {}, thunkAPI) => {
    try {
      const response = await getSrapApi(filters);
      const list = response?.data?.map((item) => item.data);
      return {
        list,
        meta: response.data.meta,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const createSrap = createAsyncThunk(
  "sraps/createSrap",
  async (srapData, thunkAPI) => {
    try {
      const response = await createSrapApi(srapData);
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

export const updateSrap = createAsyncThunk(
  "sraps/updateSrap",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await updateSrapApi(id, data);
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

export const deleteSrap = createAsyncThunk(
  "sraps/deleteSrap",
  async (id, thunkAPI) => {
    try {
      const response = await deleteSrapApi(id);
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

export const getSingleSrap = createAsyncThunk(
  "sraps/getSingleSrap",
  async (id, thunkAPI) => {
    try {
      const response = await getSingleSrapApi(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

// SRAP INITIATIVES

export const fetchSrapInitiatives = createAsyncThunk(
  "sraps/fetchSrapInitiatives",
  async (params, thunkAPI) => {
    try {
      const response = await getSrapInitiativesApi(params);
      return {
        list: response.data,
        meta: response.meta,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const createSrapInitiative = createAsyncThunk(
  "sraps/createSrapInitiative",
  async (initiativeData, thunkAPI) => {
    try {
      const response = await createSrapInitiativeApi(initiativeData);
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

export const updateSrapInitiative = createAsyncThunk(
  "sraps/updateSrapInitiative",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await updateSrapInitiativeApi(id, data);
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

export const deleteSrapInitiative = createAsyncThunk(
  "sraps/deleteSrapInitiative",
  async (id, thunkAPI) => {
    try {
      const response = await deleteSrapInitiativeApi(id);
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

export const getSingleSrapInitiative = createAsyncThunk(
  "sraps/getSingleSrapInitiative",
  async (id, thunkAPI) => {
    try {
      const response = await getSingleSrapInitiativeApi(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);


const srapSlice = createSlice({
  name: "sraps",
  initialState: {
    list: [],
    meta: null,
    loading: false,
    error: null,
    currentSrap: null,
    currentInitiative: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // SRAP
      .addCase(fetchSraps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSraps.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.meta = action.payload.meta;
      })
      .addCase(fetchSraps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getSingleSrap.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentSrap = null;
      })
      .addCase(getSingleSrap.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSrap = action.payload;
      })
      .addCase(getSingleSrap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Srap
      .addCase(updateSrap.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        state.currentSrap = action.payload;
      })

      // GET STRAP INITIATIVES
      .addCase(fetchSrapInitiatives.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSrapInitiatives.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.meta = action.payload.meta;
      })
      .addCase(fetchSrapInitiatives.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Initiative
      .addCase(createSrapInitiative.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSrapInitiative.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createSrapInitiative.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // update Initiative
      .addCase(updateSrapInitiative.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSrapInitiative.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateSrapInitiative.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Single Initiative
      .addCase(getSingleSrapInitiative.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentInitiative = null;
      })
      .addCase(getSingleSrapInitiative.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInitiative = action.payload;
        // state.list.push(action.payload) ;
      })
      .addCase(getSingleSrapInitiative.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //Delete Initiative
      .addCase(deleteSrapInitiative.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.id !== action.payload);
      });
  },
});

export const getSrapById = getSingleSrap;

export default srapSlice.reducer;
