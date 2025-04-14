import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

import {
  setNotAuthorized,
  setServerError,
  updateIdleTimeOut,
} from "./slice/authSlice";

import Cookies from "js-cookie";
import { getExtensionToken } from "@/utils/extension";
export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const baseQueryWithOutToken = fetchBaseQuery({
  baseUrl: `${baseUrl}`,
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    return headers;
  },
});

// export const baseQuery = fetchBaseQuery({
//     baseUrl: `${baseUrl}`,
//     prepareHeaders: (headers) => {
//         //const token = sessionStorage.getItem('token')
//         const token = Cookies.get('optisage-token');
//         if (token) {
//             headers.set('authorization', `Bearer ${token}`)
//         }
//         headers.set('Accept', 'application/json')
//         return headers
//     },

// })

export const baseQuery = fetchBaseQuery({
  baseUrl: `${baseUrl}`,
  prepareHeaders: async (headers) => {
    // 1. First try to get token from cookies (standard web flow)
    let token = Cookies.get("optisage-token");

    // 2. If in iframe context and no cookie found, check extension storage
    if (!token && typeof window !== "undefined" && window.parent !== window) {
      try {
        const extensionToken = await getExtensionToken();
        if (extensionToken) {
          token = extensionToken;
          // Sync back to cookie for consistency
          Cookies.set("optisage-token", token, {
            sameSite: "None",
            secure: true,
            expires: new Date(new Date().getTime() + 6 * 60 * 60 * 1000),
            path: "/",
          });
        }
      } catch (error) {
        console.error("Failed to access extension storage:", error);
      }
    }

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("Accept", "application/json");
    return headers;
  },
});

export const baseQueryWithInterceptor: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result: any = await baseQuery(args, api, extraOptions);
  api.dispatch(updateIdleTimeOut());
  // Check if the response has a status code of 401
  if (result.error?.status === 401 || result.error?.originalStatus === 401) {
    api.dispatch(setNotAuthorized());
    sessionStorage.removeItem("token");
  }
  if (result.error?.status === 403 || result.error?.originalStatus === 403) {
    // api.dispatch(setNotAuthorized())
    // message.error("Method Not Allowed");
  }
  if (result.error?.status === 404 || result.error?.originalStatus === 404) {
    // message.error("Not Found");
  }
  if (result.error?.status === 503 || result.error?.originalStatus === 503) {
    // api.dispatch(setNotAuthorized())
    // message.error("Under Maintenance");
  }
  if (result.error?.status === 500 || result.error?.originalStatus === 500) {
    api.dispatch(setServerError());
    // message.error("Server Error");
    // window.location.href = "/serverError";
  }
  return result;
};

export const baseQueryForAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result: any = await baseQuery(args, api, extraOptions);
  api.dispatch(updateIdleTimeOut());
  if (result.error?.status === 503 || result.error?.originalStatus === 503) {
    sessionStorage.removeItem("token");
    // window.location.href = "/underMaintenance";
  }

  if (result.error?.status === 500 || result.error?.originalStatus === 500) {
    // sessionStorage.removeItem("authToken");
    // window.location.href = "/serverError";
  }
  return result;
};

