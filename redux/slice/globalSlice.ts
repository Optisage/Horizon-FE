import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface globalState {
  subScriptionId: any;
  marketplaceId: number;
  currencyCode:string;
  currencySymbol:string
}

const initialState: globalState = {
    subScriptionId: null,
    marketplaceId: 1,
    currencyCode: "USD",
    currencySymbol:"$"
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
    },
    setCurrencyCode: (state, action: PayloadAction<string>)=>{
      state.currencyCode = action.payload;
    },
    setCurrencySymbol: (state, action: PayloadAction<string>)=>{
      console.log("Dispatching setCurrencyCode with payload:", action.payload);
      state.currencySymbol = action.payload;
    },
   
  },
});

export const {
   setSubScriptionId ,
   setMarketPlaceId,
   setCurrencyCode,
   setCurrencySymbol
  } = globalSlice.actions;
export default globalSlice.reducer;
