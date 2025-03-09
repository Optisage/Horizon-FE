import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface globalState {
  subScriptionId: any;
  marketplaceId: string
}

const initialState: globalState = {
    subScriptionId: null,
    marketplaceId: ""
};

const globalSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setSubScriptionId: (state, action: PayloadAction<number>) => {
        console.log("Dispatching setSubScriptionId with payload:", action.payload);
      state.subScriptionId = action.payload; // Set loading state
    },
    setMarketPlaceId: (state, action: PayloadAction<string>)=>{
      state.marketplaceId = action.payload;
    }
   
  },
});

export const {
   setSubScriptionId ,
   setMarketPlaceId
  } = globalSlice.actions;
export default globalSlice.reducer;
