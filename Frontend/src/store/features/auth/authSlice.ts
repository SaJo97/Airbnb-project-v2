import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

type AuthState = {
  userId: string | null;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  token: string | null;
  role: string | null;
  error: string | null;
  loading: boolean;
  message: string | null;
  success: boolean;
};

// Response type from backend
type AuthResponse = {
  user: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
  };
  token: string;
};

const initialState: AuthState = {
  userId: null,
  firstname: null,
  lastname: null,
  email: null,
  token: localStorage.getItem("token"),
  role: null,
  error: null,
  loading: false,
  message: null,
  success: false,
};

// REGISTER thunk
export const register = createAsyncThunk<
  AuthResponse, // success payload type
  UserData, // argument type
  { rejectValue: string } // rejection type
>("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post<AuthResponse>(
      "http://localhost:8080/api/auth/register",
      userData
    );

    if (response.status === 201) {
      localStorage.setItem("token", response.data.token);
      sessionStorage.setItem("jwt", response.data.token);

      // return {
      //   message: "Registration successful",
      //   // token: response.data.token,
      //   // email: userData.email,
      //   // firstname: userData.firstname,
      //   lastname: userData.lastname,
      //   // role: response.data.role,
      // };
      return response.data; // Return the full response
    }

    return rejectWithValue("Unexpected response status");
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    console.error("Registration error:", error.response?.data);
    return rejectWithValue(
      error.response?.data?.message || "Registration failed"
    );
  }
});

// LOGIN thunk
export const login = createAsyncThunk<
  AuthResponse,
  Pick<UserData, "email" | "password">,
  { rejectValue: string }
>("auth/login", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post<AuthResponse>(
      "http://localhost:8080/api/auth/login",
      {
        email: userData.email,
        password: userData.password,
      }
    );

    if (response.status === 200) {
      localStorage.setItem("token", response.data.token);
      sessionStorage.setItem("jwt", response.data.token);

      // return {
      //   message: "Login successful",
      //   token: response.data.token,
      //   email: userData.email,
      //   firstname: response.data.firstname,
      //   lastname: response.data.lastname,
      //   role: response.data.role,
      // };
      return response.data; // Return the full response
    }

    return rejectWithValue("Unexpected response status");
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    console.error("Login error:", error.response?.data || error.message);
    return rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

//  Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    logout: (state) => {
      state.userId = null;
      state.firstname = null;
      state.lastname = null;
      state.email = null;
      state.token = null;
      state.role = null;
      state.success = false;
      localStorage.removeItem("token");
      sessionStorage.removeItem("jwt");
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        register.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.userId = action.payload.user._id;
          state.firstname = action.payload.user.firstname;
          state.lastname = action.payload.user.lastname;
          state.email = action.payload.user.email;
          state.token = action.payload.token;
          state.role = action.payload.user.role;
          state.loading = false;
          state.message = "Registration successful"; // Added default message
          state.success = true;
        }
      )
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload || "Registration failed";
        state.loading = false;
        state.success = false;
      })

      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.userId = action.payload.user._id;
          state.firstname = action.payload.user.firstname;
          state.lastname = action.payload.user.lastname;
          state.email = action.payload.user.email;
          state.token = action.payload.token;
          state.role = action.payload.user.role;
          state.loading = false;
          state.message = "Login successful";
          state.success = true;
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload || "Login failed";
        state.loading = false;
        state.success = false;
      });
  },
});

export const { clearError, clearMessage, logout } = authSlice.actions;
export default authSlice.reducer;
