import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCustomers } from "../features/customer/services/customerApi";
import type { Customer } from "../features/customer/types";

interface CustomerState {
  list: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  list: [],
  loading: false,
  error: null,
};

// 🔥 API call via Redux
export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCustomers();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default customerSlice.reducer;