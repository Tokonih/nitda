import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createRoleApi,
  deleteRoleApi,
  getRolesApi,
  getSingleRoleApi,
  updateRoleApi,
} from "./Utils/Api/role";

export const getRoles = createAsyncThunk(
  "roles/getRoles",
  async ({ per_page = 15 } = {}, thunkAPI) => {
    try {
      // const response = await getRolesApi();
      const response = await getRolesApi({ per_page });
      return { list: response.data, meta: response.data.meta };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const createRole = createAsyncThunk(
  "roles/createRole",
  async (roleData, thunkAPI) => {
    try {
      const response = await createRoleApi(roleData);
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

export const getRoleById = createAsyncThunk(
  "roles/getRoleById",
  async (id, thunkAPI) => {
    try {
      const response = await getSingleRoleApi(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const uppdateRole = createAsyncThunk(
  "roles/updateRole",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await updateRoleApi(id, data);
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

export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (roletId, { rejectWithValue }) => {
    try {
      const response = await deleteRoleApi(roletId);
      if (response.status === "success" || response.code === 200) {
        return roletId;
      }
      return roletId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const roleSlice = createSlice({
  name: "roles",
  initialState: {
    list: [],
    loading: false,
    error: null,
    currentRole: null,
    meta: { current_page: 1, per_page: 15, total: 0, last_page: 1 },
  },
  reducers: {
    clearCurrentRole: (state) => {
      state.currentRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;

        state.list = action.payload.list;
        // state.meta = action.payload?.data?.meta;
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create role
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get single role
      .addCase(getRoleById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentRole = null;
      })
      .addCase(getRoleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRole = action.payload;
      })
      .addCase(getRoleById.rejected, (state, action) => {
        state.loading = false;
        state.currentRole = action.payload;
      })

      // Update
      .addCase(uppdateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uppdateRole.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.map((role) =>
          role.id === action.payload.id ? action.payload : role
        );
        state.currentRole = action.payload;
      })
      .addCase(uppdateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // delete department
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.list = state.list.filter((role) => role.id !== action.payload);
      });
  },
});

export default roleSlice.reducer;
