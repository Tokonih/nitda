import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getScorecardConfigApi, updateScorecardConfigApi } from "./Utils/Api/scorecardConfig";

export const fetchScorecardConfig = createAsyncThunk(
    "scoreCardConfig/fetchScorecardConfig",
    async (_, thunkAPI) => {
        try {
            const response = await getScorecardConfigApi();
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

export const updateScorecardConfig = createAsyncThunk(
    "scoreCardConfig/updateScorecardConfig",
    async (data, thunkAPI) => {
        try {
            const response = await updateScorecardConfigApi(data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Something went wrong"
            );
        }
    }
);

const scoreCardConfigSlice = createSlice({
    name: "scoreCardConfig",
    initialState: {
        config: null,
        loading: false,
        updateLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchScorecardConfig.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchScorecardConfig.fulfilled, (state, action) => {
                state.loading = false;
                state.config = action.payload;
            })
            .addCase(fetchScorecardConfig.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateScorecardConfig.pending, (state) => {
                state.updateLoading = true;
            })
            .addCase(updateScorecardConfig.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.config = action.payload;
            })
            .addCase(updateScorecardConfig.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            });
    },
});

export default scoreCardConfigSlice.reducer;
