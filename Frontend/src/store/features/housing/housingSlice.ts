import {
  createAction,
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import housingService from "./housingService";

type HousingState = {
  housing: Housing[];
  selectedHousing: Housing | null;
  loading: boolean;
  error: string | null;
  currentFilters: {
    startDate: string;
    endDate: string;
    maxAdults: string;
    maxKids: string;
    maxAnimals: string;
  };
};

const initialState: HousingState = {
  housing: [],
  selectedHousing: null,
  loading: false,
  error: null,
  currentFilters: {
    startDate: "",
    endDate: "",
    maxAdults: "",
    maxKids: "",
    maxAnimals: "",
  },
};

export const getAllHousing = createAsyncThunk<
  Housing[],
  void,
  { rejectValue: string }
>("housing-list/getAll", async (_, thunkAPI) => {
  try {
    const data = await housingService.getAll();
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Failed to fetch housing");
  }
});

export const getHousing = createAsyncThunk<
  Housing,
  string,
  { rejectValue: string }
>("housing-list/getHousing", async (housingId, thunkAPI) => {
  try {
    const data = await housingService.getHousing(housingId);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Failed to fetch housing");
  }
});

export const createHousing = createAsyncThunk<
  Housing,
  CreateHousingBody,
  { rejectValue: string }
>("housing-list/createHousing", async (housingData, thunkAPI) => {
  try {
    const data = await housingService.createHousing(housingData);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.message || "Failed to create housing"
    );
  }
});

export const setCurrentFilters = createAction<{
  startDate: string;
  endDate: string;
  maxAdults: string;
  maxKids: string;
  maxAnimals: string;
}>("housing/setCurrentFilters");

// Slice definition
export const housingSlice = createSlice({
  name: "housing-list",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllHousing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllHousing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      .addCase(
        getAllHousing.fulfilled,
        (state, action: PayloadAction<Housing[]>) => {
          state.loading = false;
          state.error = null;
          state.housing = action.payload;
        }
      )
      .addCase(getHousing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHousing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      .addCase(
        getHousing.fulfilled,
        (state, action: PayloadAction<Housing>) => {
          state.loading = false;
          state.selectedHousing = action.payload;
        }
      )
      .addCase(createHousing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHousing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create housing";
      })
      .addCase(
        createHousing.fulfilled,
        (state, action: PayloadAction<Housing>) => {
          state.loading = false;
          state.error = null;
          state.housing.push(action.payload);
        }
      )
      .addCase(setCurrentFilters, (state, action) => {
        state.currentFilters = action.payload;
      });
  },
});
export default housingSlice.reducer;
