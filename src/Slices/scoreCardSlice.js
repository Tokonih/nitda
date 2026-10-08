import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getDgScoreCardApi, getScoreCardApi, getDgAnnualScoreCardApi } from "./Utils/Api/scoreCard";

export const fetchScoreCard = createAsyncThunk(
  "scoreCard/fetchScoreCard",
  async (params, thunkAPI) => {
    try {
      const response = await getScoreCardApi(params);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const fetchDgScoreCard = createAsyncThunk(
  "scoreCard/fetchDgScoreCard",
  async (params, thunkAPI) => {
    try {
      const response = await getDgScoreCardApi(params);
      return { data: response.data, meta: response.meta };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

export const fetchDgAnnualScoreCard = createAsyncThunk(
  "scoreCard/fetchDgAnnualScoreCard",
  async (params, thunkAPI) => {
    try {
      const response = await getDgAnnualScoreCardApi(params);
      return { data: response.data, meta: response.meta };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Something went wrong"
      );
    }
  }
);

const scoreCaredSlice = createSlice({
  name: "scoreCard",
  initialState: {
    list: [],
    meta: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchScoreCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScoreCard.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchScoreCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDgScoreCard.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.meta = null;
      })
      .addCase(fetchDgScoreCard.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.meta = action.payload.meta || null;
      })
      .addCase(fetchDgScoreCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDgAnnualScoreCard.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.meta = null;
      })
      .addCase(fetchDgAnnualScoreCard.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.meta = action.payload.meta || null;
      })
      .addCase(fetchDgAnnualScoreCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default scoreCaredSlice.reducer;