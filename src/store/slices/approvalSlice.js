import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { approvalService, loadingService } from "../../services/operational";
import { getErrorMessage } from "../../api/apiError";
import {
  listRailwayApprovals,
  submitRailwayDecision,
  updateRailwayWagonManifest,
} from "../../services/railwayApprovalService";

export const fetchApprovalRequests = createAsyncThunk("approvals/fetchAll", async () =>
  listRailwayApprovals({ page_size: 1000 }),
);

export const fetchApprovalByLoadingId = createAsyncThunk(
  "approvals/fetchByLoadingId",
  async (loadingId) => approvalService.getByLoadingId(loadingId),
);

export const completeLoadingAndRequestApproval = createAsyncThunk(
  "approvals/completeLoading",
  async (loadingId, { dispatch }) => {
    const approval = await approvalService.completeLoading(loadingId);
    await dispatch(fetchApprovalRequests());
    const loading = await loadingService.getById(loadingId);
    return { approval, loading };
  },
);

export const submitApprovalDecision = createAsyncThunk(
  "approvals/submitDecision",
  async ({ approval, department, decision, targets }) => {
    const updated = await submitRailwayDecision(approval, department, decision, targets);
    return { approval: updated, loading: null };
  },
);

export const saveApprovalWagonManifest = createAsyncThunk(
  "approvals/saveWagonManifest",
  async ({ approvalId, manifest }) => updateRailwayWagonManifest(approvalId, manifest),
);

const approvalSlice = createSlice({
  name: "approvals",
  initialState: {
    items: [],
    selected: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearSelectedApproval(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovalRequests.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchApprovalRequests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchApprovalRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = getErrorMessage(action.error);
      })
      .addCase(fetchApprovalByLoadingId.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(completeLoadingAndRequestApproval.fulfilled, (state, action) => {
        const { approval } = action.payload;
        const idx = state.items.findIndex((item) => item.id === approval.id);
        if (idx >= 0) state.items[idx] = approval;
        else state.items.unshift(approval);
        state.selected = approval;
      })
      .addCase(submitApprovalDecision.fulfilled, (state, action) => {
        const { approval } = action.payload;
        const idx = state.items.findIndex((item) => item.id === approval.id);
        if (idx >= 0) state.items[idx] = approval;
        else state.items.unshift(approval);
        state.selected = approval;
      })
      .addCase(saveApprovalWagonManifest.fulfilled, (state, action) => {
        const approval = action.payload;
        const idx = state.items.findIndex((item) => item.id === approval.id);
        if (idx >= 0) state.items[idx] = approval;
        else state.items.unshift(approval);
        if (state.selected?.id === approval.id) state.selected = approval;
      });
  },
});

export const { clearSelectedApproval } = approvalSlice.actions;
export default approvalSlice.reducer;
