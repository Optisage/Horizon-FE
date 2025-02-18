import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryForAuth } from "../queryInterceptor";
import { setUser } from "../slice/authSlice";

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
            dispatch(setUser(apiResponse.data?.user))
            sessionStorage.setItem("token", apiResponse.data?.token);
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
      query: ({data, token}) => ({
        url: `auth/set-password/${token}`,
        method: "POST",
        body: data,
      }),
    }),
    forgetPassword: builder.mutation({
      query: (data) => ({
        url: "forget_password",
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
        url:"pricing",
        method:"GET"
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
  useSetPasswordMutation
} = authApi;
