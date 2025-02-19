import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoadingState {
  subScriptionId: any;
}

const initialState: LoadingState = {
    subScriptionId: null
};

const globalSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setSubScriptionId: (state, action: PayloadAction<number>) => {
        console.log("Dispatching setSubScriptionId with payload:", action.payload);
      state.subScriptionId = action.payload; // Set loading state
    },
   
  },
});

export const { setSubScriptionId } = globalSlice.actions;
export default globalSlice.reducer;
