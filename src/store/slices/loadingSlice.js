import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loadingService } from "../../services/operational";
import { getErrorMessage } from "../../api/apiError";

export const fetchLoadingRecords = createAsyncThunk(
  "loading/fetchAll",
  async () => loadingService.list(),
);

export const fetchLoadingById = createAsyncThunk(
  "loading/fetchById",
  async (id) => loadingService.getById(id),
);

export const fetchLoadingByRakeId = createAsyncThunk(
  "loading/fetchByRakeId",
  async (rakeId) => loadingService.getByRakeId(rakeId),
);

export const saveLoadingRecord = createAsyncThunk(
  "loading/save",
  async (record) => loadingService.upsert(record),
);

const loadingSlice = createSlice({
  name: "loading",
  initialState: {
    items: [],
    selected: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearSelectedLoading(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoadingRecords.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLoadingRecords.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchLoadingRecords.rejected, (state, action) => {
        state.status = "failed";
        state.error = getErrorMessage(action.error);
      })
      .addCase(fetchLoadingById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(fetchLoadingByRakeId.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(saveLoadingRecord.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
        else state.items.unshift(action.payload);
        state.selected = action.payload;
      });
  },
});

export const { clearSelectedLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
