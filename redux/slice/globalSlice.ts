import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface globalState {
  subScriptionId: any;
  marketplaceId: number
}

const initialState: globalState = {
    subScriptionId: null,
    marketplaceId: 1
};

const globalSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setSubScriptionId: (state, action: PayloadAction<number>) => {
        console.log("Dispatching setSubScriptionId with payload:", action.payload);
      state.subScriptionId = action.payload; // Set loading state
    },
    setMarketPlaceId: (state, action: PayloadAction<number>)=>{
      state.marketplaceId = action.payload;
    }
   
  },
});

export const {
   setSubScriptionId ,
   setMarketPlaceId
  } = globalSlice.actions;
export default globalSlice.reducer;
