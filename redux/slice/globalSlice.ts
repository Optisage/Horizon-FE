import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface globalState {
  subScriptionId: any;
  marketplaceId: number;
  currencyCode:string;
  currencySymbol:string
}

const initialState: globalState = {
    subScriptionId: null,
    marketplaceId: 6,
    currencyCode: "CAD",
    currencySymbol:"C$"
};

const globalSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setSubScriptionId: (state, action: PayloadAction<number>) => {
      state.subScriptionId = action.payload; // Set loading state
    },
    setMarketPlaceId: (state, action: PayloadAction<number>)=>{
      state.marketplaceId = action.payload;
    },
    setCurrencyCode: (state, action: PayloadAction<string>)=>{
      state.currencyCode = action.payload;
    },
    setCurrencySymbol: (state, action: PayloadAction<string>)=>{
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
