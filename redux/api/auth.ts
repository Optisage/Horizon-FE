import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryForAuth } from "../queryInterceptor";
import { setUser } from "../slice/authSlice";
import Cookies from "js-cookie";

export const authApi = createApi({
  reducerPath: "auth",
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 10,
  baseQuery: baseQueryForAuth,
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: "auth/login",
        method: "POST",
        body: data,
      }),
      onQueryStarted(id, { dispatch, queryFulfilled }) {
        queryFulfilled
          .then((apiResponse) => {
            //console.log("API Response:", apiResponse.data?.data?.token); // Log the entire response
            dispatch(setUser(apiResponse.data?.data.user));
            // Set the token in cookies with a 7-day expiration, accessible on all paths, secure, and SameSite set to 'Strict'
            Cookies.set("token", apiResponse.data?.data.token, {
              expires: 7,
              path: "/", // Accessible on all paths
              //secure: true, // Only sent over HTTPS
              //sameSite: 'Strict' // Cookie is not sent with cross-site requests
            });
            console.log("Stored Token:", Cookies.get("token"));
            //sessionStorage.setItem("token", apiResponse.data?.token);
          })
          .catch((error) => {
            console.log(error);
          });
      },
      invalidatesTags: ["Profile"],
    }),
    signup: builder.mutation({
      query: (data) => ({
        url: "auth/signup",
        method: "POST",
        body: data,
      }),
      //invalidatesTags: ["Profile"],
    }),
    createPassword: builder.mutation({
      query: (data) => ({
        url: "create_password",
        method: "POST",
        body: data,
      }),
    }),
    setPassword: builder.mutation({
      query: ({ data, token }) => ({
        url: `auth/set-password/${token}`,
        method: "POST",
        body: data,
      }),
    }),
    forgetPassword: builder.mutation({
      query: (data) => ({
        url: "forgot-password",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "reset-password",
        method: "POST",
        body: data,
      }),
    }),

    getProfile: builder.query({
      query: () => "me",
      providesTags: ["Profile"],
    }),
    getPricing: builder.query<any, {}>({
      query: () => ({
        url: "pricing",
        method: "GET",
      }),
    }),
    logout: builder.query({
      query: () => "auth/logout",
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useGetProfileQuery,
  useLogoutQuery,
  useCreatePasswordMutation,
  useForgetPasswordMutation,
  useLazyGetPricingQuery,
  useSetPasswordMutation,
  useResetPasswordMutation,
} = authApi;
