import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createDepartmentApi,
  deleteDepartmentApi,
  getDepartmentApi,
  getSingleDepartmentApi,
  updateDepartmentApi,
} from "./Utils/Api/departments";

// Fetch all departments
export const fetchDepartments = createAsyncThunk(
  "departments/fetchDepartments",
  async (_, thunkAPI) => {
    try {
      const response = await getDepartmentApi({ per_page: 200 });
      const list = response?.data?.map((item) => item);
      return { list, meta: response.data.meta };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

// Fetch single department by ID
export const getDepartmentById = createAsyncThunk(
  "departments/getDepartmentById",
  async (id, thunkAPI) => {
    try {
      const response = await getSingleDepartmentApi(id);
      return response.data; // {id, name, contact_email, ...}
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

// Create new department
export const createDepartment = createAsyncThunk(
  "departments/createDepartment",
  async (departmentData, thunkAPI) => {
    try {
      const response = await createDepartmentApi(departmentData);
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

// Update department
export const updateDepartment = createAsyncThunk(
  "departments/updateDepartment",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await updateDepartmentApi(id, data);
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

export const deleteDepartment = createAsyncThunk(
  "departments/deleteDepartment",
  async (departmentId, { rejectWithValue }) => {
    try {
      const response = await deleteDepartmentApi(departmentId);
      if (response.status === "success" || response.code === 200) {
        return departmentId;
      }
      return departmentId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const departmentSlice = createSlice({
  name: "departments",
  initialState: {
    list: [],
    currentDepartment: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch departments
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        // state.meta = action.payload.meta.pagination;
        state.meta = action.payload.meta;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get single department
      .addCase(getDepartmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentDepartment = null;
      })
      .addCase(getDepartmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDepartment = action.payload;
      })
      .addCase(getDepartmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.map((dept) =>
          dept.id === action.payload.id ? action.payload : dept
        );
        state.currentDepartment = action.payload;
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // delete department
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.list = state.list.filter((dept) => dept.id !== action.payload);
      });
  },
});

export const { clearCurrentDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;
