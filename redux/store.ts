import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import globalReducer from "./slice/globalSlice";
import { authApi } from "./api/auth";
import { subscriptionApi } from "./api/subscriptionApi";
import { productsApi } from "./api/productsApi";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { userApi } from "./api/user";
import { sellerApi } from "./api/sellerApi";
import { quickSearchApi } from "./api/quickSearchApi";
import { keepaApi } from "./api/keepa";
import { monitorApi } from "./api/monitorApi";
import { totanApi } from "./api/totanAi";


const rootReducer = combineReducers({
  api: authReducer,
  global: globalReducer,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [subscriptionApi.reducerPath]: subscriptionApi.reducer,
  [productsApi.reducerPath]: productsApi.reducer,
  [sellerApi.reducerPath]: sellerApi.reducer,
  [quickSearchApi.reducerPath]: quickSearchApi.reducer,
  [keepaApi.reducerPath]: keepaApi.reducer,
  [monitorApi.reducerPath]: monitorApi.reducer,
  [totanApi.reducerPath]: totanApi.reducer

});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["api", "global"], // Whitelist the reducers you want to persist
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat([
      authApi.middleware,
      subscriptionApi.middleware,
      userApi.middleware,
      productsApi.middleware,
      sellerApi.middleware,
      quickSearchApi.middleware,
      keepaApi.middleware,
      monitorApi.middleware,
      totanApi.middleware
    ]),
});

export const persistor = persistStore(store);

// Infer the type of makeStore
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;