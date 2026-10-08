import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createUserApi,
  deleteUserApi,
  getSingleUserApi,
  getUsersApi,
  updateUserApi,
  getTrashedUsersApi,
  restoreUserApi,
} from "./Utils/Api/users";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async ({ page = 1 } = {}, thunkAPI) => {
    try {
      const response = await getUsersApi(page);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUsers",
  async (useData, thunkAPI) => {
    try {
      const response = await createUserApi(useData);
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

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, userData }, thunkAPI) => {
    try {
      const response = await updateUserApi(id, userData);
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

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, thunkAPI) => {
    try {
      const response = await deleteUserApi(id);
      if (
        response.status === "success" ||
        response.code === 200 ||
        response === id
      ) {
        return { id }; // standardized return
      }
      // If API returns unstructured success for delete
      return { id };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const fetchTrashedUsers = createAsyncThunk(
  "users/fetchTrashedUsers",
  async ({ page = 1 } = {}, thunkAPI) => {
    try {
      const response = await getTrashedUsersApi(page);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const restoreUser = createAsyncThunk(
  "users/restoreUser",
  async (id, thunkAPI) => {
    try {
      await restoreUserApi(id);
      return { id };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const getSingleUser = createAsyncThunk(
  "users/getSingleUser",
  async (id, thunkAPI) => {
    try {
      const response = await getSingleUserApi(id);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    loading: false,
    error: null,
    currentUser: null,
    pagination: {},
    trashedList: [],
    trashedLoading: false,
    trashedPagination: {},
    restoringId: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
        state.pagination = action.payload.meta?.pagination || {};
      })

      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create role
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((user) => user.id !== action.payload.id);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Trashed Users
      .addCase(fetchTrashedUsers.pending, (state) => {
        state.trashedLoading = true;
        state.error = null;
      })
      .addCase(fetchTrashedUsers.fulfilled, (state, action) => {
        state.trashedLoading = false;
        state.trashedList = action.payload.data || [];
        state.trashedPagination = action.payload.meta?.pagination || {};
      })
      .addCase(fetchTrashedUsers.rejected, (state, action) => {
        state.trashedLoading = false;
        state.error = action.payload;
      })
      // Restore User
      .addCase(restoreUser.pending, (state, action) => {
        state.restoringId = action.meta.arg;
      })
      .addCase(restoreUser.fulfilled, (state, action) => {
        state.restoringId = null;
        state.trashedList = state.trashedList.filter(
          (user) => user.id !== action.payload.id
        );
      })
      .addCase(restoreUser.rejected, (state) => {
        state.restoringId = null;
      })
      // Fetch Single User
      .addCase(getSingleUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(getSingleUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
