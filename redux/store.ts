// import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import authReducer from "./slice/authSlice";
// import globalReducer from "./slice/globalSlice";
// import { authApi } from "./api/auth";
// import { subscriptionApi } from "./api/subscriptionApi";
// import { productsApi } from "./api/productsApi";
// import { persistReducer, persistStore } from "redux-persist";
// import storage from "redux-persist/lib/storage";
// import { userApi } from "./api/user";
// import { sellerApi } from "./api/sellerApi";


// const rootReducer = combineReducers({
//   api: authReducer,
//   global: globalReducer,
//   [authApi.reducerPath]: authApi.reducer,
//   [userApi.reducerPath]: userApi.reducer,
//   [subscriptionApi.reducerPath]: subscriptionApi.reducer,
//   [productsApi.reducerPath]: productsApi.reducer,
//   [sellerApi.reducerPath]: sellerApi.reducer,

// });

// const persistConfig = {
//   key: "root",
//   storage,
//   whitelist: ["api", "global"], // Whitelist the reducers you want to persist
// };
// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,

//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false,
//     }).concat([
//       authApi.middleware,
//       subscriptionApi.middleware,
//       userApi.middleware,
//       productsApi.middleware,
//       sellerApi.middleware,
     
//     ]),
// });

// export const persistor = persistStore(store);

// // Infer the type of makeStore
// export type AppStore = typeof store;
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;







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
import { quickSearchApi } from "./api/quickSearchApi"; // Import quickSearchApi

const rootReducer = combineReducers({
  api: authReducer,
  global: globalReducer,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [subscriptionApi.reducerPath]: subscriptionApi.reducer,
  [productsApi.reducerPath]: productsApi.reducer,
  [sellerApi.reducerPath]: sellerApi.reducer,
  [quickSearchApi.reducerPath]: quickSearchApi.reducer, // Add quickSearchApi reducer
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["api", "global"], // Whitelist the reducers you want to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// A function to conditionally add middleware
const getMiddleware = (getDefaultMiddleware: any) => {
  // Define your condition for excluding quickSearchApi middleware
  const excludeQuickSearchMiddleware = process.env.REACT_APP_EXCLUDE_QUICKSEARCH_API_MIDDLEWARE === 'true';

  const middleware = getDefaultMiddleware({
    serializableCheck: false,
  }).concat([
    authApi.middleware,
    subscriptionApi.middleware,
    userApi.middleware,
    productsApi.middleware,
    sellerApi.middleware,
  ]);

  // Only add quickSearchApi.middleware if we don't need to exclude it
  if (!excludeQuickSearchMiddleware) {
    middleware.push(quickSearchApi.middleware);
  }

  return middleware;
};

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getMiddleware(getDefaultMiddleware),
});

export const persistor = persistStore(store);

// Infer the type of makeStore
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
