import { configureStore } from "@reduxjs/toolkit";
import rakeReducer from "./slices/rakeSlice";
import loadingReducer from "./slices/loadingSlice";
import delayReducer from "./slices/delaySlice";
import approvalReducer from "./slices/approvalSlice";

export const store = configureStore({
  reducer: {
    rakes: rakeReducer,
    loading: loadingReducer,
    delay: delayReducer,
    approvals: approvalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
