import { combineReducers, configureStore } from '@reduxjs/toolkit'
import authReducer from "./slice/authSlice";
import globalReducer from "./slice/globalSlice";
import { authApi } from './api/auth';
import { subscriptionApi } from './api/subscriptionApi';
import { persistReducer, persistStore } from 'redux-persist';
import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({
  api: authReducer,
  global: globalReducer,
  [authApi.reducerPath]: authApi.reducer,
  [subscriptionApi.reducerPath]: subscriptionApi.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ['api','global'], // Whitelist the reducers you want to persist
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat([
      authApi.middleware,
      subscriptionApi.middleware
     
      
    ]),
});

export const persistor = persistStore(store);

// Infer the type of makeStore
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;