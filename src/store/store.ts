import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "./customerSlice";
import userReducer from "./userSlice";
import authReducer from "./authSlice";  // 👈 add this

export const store = configureStore({
  reducer: {
    auth: authReducer,        // 👈 add this
    customers: customerReducer,
    users: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;