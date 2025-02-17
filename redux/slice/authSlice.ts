import { createSlice, PayloadAction } from "@reduxjs/toolkit";
const initialState: Record<string, any> = {
  timeout: false,
  idleTimeOut: 1800000, // 30mins
  notAuthorized: false,
  serverError: false,
  isAuthenticated: false,
  user:[],
  avi: ''
};

export const authSlice = createSlice({
  name: "api",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user:{id: string; name: string; email: string} }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    setAvi: (state, action: PayloadAction<{profileImage: string}>) => {
      state.avi = action.payload.profileImage;
    },
    setTimeout: (state) => {
      state.timeout = true;
    },
    resetTimeout: (state) => {
      state.timeout = false;
    },
    setNotAuthorized: (state) => {
      state.notAuthorized = true;
    },
    resetNotAuthorized: (state) => {
      state.notAuthorized = false;
    },
    updateIdleTimeOut: (state) => {
      state.idleTimeOut = 1800000;
    },
    resetServerError: (state) => {
      state.serverError = false;
    },
    setServerError: (state) => {
      state.serverError = true;
    },
    logout: (state) => {
      state.user = [];
      state.isAuthenticated = false;
    },
  },
});

export const {
  setUser,
  setAvi,
  setTimeout,
  updateIdleTimeOut,
  resetTimeout,
  resetNotAuthorized,
  setServerError,
  setNotAuthorized,
  resetServerError,
  logout
} = authSlice.actions;
export default authSlice.reducer;
