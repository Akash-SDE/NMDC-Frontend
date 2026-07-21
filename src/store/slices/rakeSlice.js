import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { rakeService } from "../../services/operational";
import { getErrorMessage } from "../../api/apiError";

export const fetchRakes = createAsyncThunk("rakes/fetchAll", async () =>
  rakeService.list(),
);

export const fetchRakeById = createAsyncThunk(
  "rakes/fetchById",
  async (id) => rakeService.getById(id),
);

export const saveRake = createAsyncThunk("rakes/save", async (payload) =>
  rakeService.update(payload),
);

export const deleteRake = createAsyncThunk("rakes/delete", async (id) => {
  await rakeService.remove(id);
  return id;
});

const rakeSlice = createSlice({
  name: "rakes",
  initialState: {
    items: [],
    selected: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearSelectedRake(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRakes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRakes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchRakes.rejected, (state, action) => {
        state.status = "failed";
        state.error = getErrorMessage(action.error);
      })
      .addCase(fetchRakeById.fulfilled, (state, action) => {
        state.selected = action.payload;
        if (action.payload) {
          const idx = state.items.findIndex((r) => r.id === action.payload.id);
          if (idx >= 0) state.items[idx] = action.payload;
          else state.items.unshift(action.payload);
        }
      })
      .addCase(saveRake.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
        else state.items.unshift(action.payload);
        state.selected = action.payload;
      })
      .addCase(deleteRake.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      });
  },
});

export const { clearSelectedRake } = rakeSlice.actions;
export default rakeSlice.reducer;
