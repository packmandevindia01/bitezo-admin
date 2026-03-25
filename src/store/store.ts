import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "./customerSlice";
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    customers: customerReducer,
    users: userReducer,
  },
});

// types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;