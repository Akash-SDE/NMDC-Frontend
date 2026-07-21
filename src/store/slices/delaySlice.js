import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { delayService } from "../../services/operational";
import { getErrorMessage } from "../../api/apiError";

export const fetchDelayRecords = createAsyncThunk("delay/fetchAll", async () =>
  delayService.list(),
);

export const fetchDelayById = createAsyncThunk(
  "delay/fetchById",
  async (id) => delayService.getById(id),
);

export const fetchDelaysByRakeId = createAsyncThunk(
  "delay/fetchByRakeId",
  async (rakeId) => delayService.getByRakeId(rakeId),
);

export const fetchDelaysByLoadingId = createAsyncThunk(
  "delay/fetchByLoadingId",
  async (loadingId) => delayService.getByLoadingId(loadingId),
);

export const saveDelayRecord = createAsyncThunk(
  "delay/save",
  async (record) => delayService.upsert(record),
);

const delaySlice = createSlice({
  name: "delay",
  initialState: {
    items: [],
    selected: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearSelectedDelay(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDelayRecords.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDelayRecords.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchDelayRecords.rejected, (state, action) => {
        state.status = "failed";
        state.error = getErrorMessage(action.error);
      })
      .addCase(fetchDelayById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(fetchDelaysByRakeId.fulfilled, (state, action) => {
        state.selected = action.payload[0] ?? null;
      })
      .addCase(fetchDelaysByLoadingId.fulfilled, (state, action) => {
        state.selected = action.payload[0] ?? null;
      })
      .addCase(saveDelayRecord.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
        else state.items.unshift(action.payload);
        state.selected = action.payload;
      });
  },
});

export const { clearSelectedDelay } = delaySlice.actions;
export default delaySlice.reducer;
