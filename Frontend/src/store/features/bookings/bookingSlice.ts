import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import bookingService from "./bookingService";

type BookingState = {
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;
};

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
};

export const getAllBookings = createAsyncThunk<
  Booking[],
  void,
  { rejectValue: string }
>("bookings/fetchBookings", async (_, thunkAPI) => {
  try {
    const data = await bookingService.fetchBookings();
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.message || "Failed to fetch bookings"
    );
  }
});

export const getSpecificBooking = createAsyncThunk<
  Booking,
  string,
  { rejectValue: string }
>("bookings/fetchBookingById", async (bookingId, thunkAPI) => {
  try {
    const data = await bookingService.fetchBookingById(bookingId);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Failed to fetch booking");
  }
});

export const makeBooking = createAsyncThunk<
  Booking,
  CreateBookingBody,
  { rejectValue: string }
>("bookings/createBooking", async (bookingData, thunkAPI) => {
  try {
    const data = await bookingService.createBooking(bookingData);
    thunkAPI.dispatch(getAllBookings()); // re-fetch booking to get populated data
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.message || "Failed to create booking"
    );
  }
});

export const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {}, // Empty reducers object (add if needed later)
  extraReducers: (builder) => {
    builder
      // getAllBookings
      .addCase(getAllBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllBookings.fulfilled,
        (state, action: PayloadAction<Booking[]>) => {
          state.loading = false;
          state.error = null;
          state.bookings = action.payload;
        }
      )
      .addCase(getAllBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      // getSpecificBooking
      .addCase(getSpecificBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getSpecificBooking.fulfilled,
        (state, action: PayloadAction<Booking>) => {
          state.loading = false;
          state.error = null;
          state.selectedBooking = action.payload;
        }
      )
      .addCase(getSpecificBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      // makeBooking
      .addCase(makeBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        makeBooking.fulfilled,
        (state, action: PayloadAction<Booking>) => {
          state.loading = false;
          state.error = null;
          state.bookings.push(action.payload);
        }
      )
      .addCase(makeBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default bookingSlice.reducer;
