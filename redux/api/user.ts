import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryForAuth } from "../queryInterceptor";


export const userApi = createApi({
  reducerPath: "user",
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 10,
  baseQuery: baseQueryForAuth,
  endpoints: (builder) => ({

   
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "reset-password",
        method: "POST",
        body: data,
      }),
    }),
    getReferrals: builder.query({
      query: () => ({
        url: "customer/referrals",
        method: "GET",
      }),
    }),
    getSettings: builder.query({
      query: () => ({
        url: "customer/settings",
        method: "GET",
      }),
    }),
    updateSettings: builder.mutation({
      query: (data) => ({
        url: "customer/settings",
        method: "PUT",
        body: data,
      }),
    }),
    getSubscriptions: builder.query({
      query: () => ({
        url: "customer/subscriptions",
        method: "GET",
      }),
    }),
  }),
});

export const {
 useLazyGetReferralsQuery,
 useLazyGetSettingsQuery,
 useUpdateSettingsMutation,
 useLazyGetSubscriptionsQuery

} = userApi;
