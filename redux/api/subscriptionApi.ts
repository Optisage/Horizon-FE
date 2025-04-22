import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryForAuth } from '../queryInterceptor';

interface SubscriptionRequest {
  email:string,
  name: string,
  pricing_id: number,
  payment_method:string
  referral_code:string
}

interface SubscriptionResponse {
  clientSecret?: string;
  message?: string;
  error?: string;
}

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: baseQueryForAuth,
  endpoints: (builder) => ({
    createSubscription: builder.mutation<SubscriptionResponse, SubscriptionRequest>({
      query: (body) => ({
        url: 'auth/signup',
        method: 'POST',
        body,
      }),
    }),
    createStripeSubscription: builder.mutation({
      query: (params) => ({
        url: `customer/stripe/checkout`,
        method: 'GET',
        params,
      }),
    }),
    createStripeSubscriptionV2: builder.query({
      query: (params) => ({
        url: `customer/stripe/get-checkout-link`,
        method: 'GET',
        params,
      }),
    }),
    verifyStripeSubscription: builder.mutation({
      query: (body) => ({
        url: `customer/stripe/verify`,
        method: 'POST',
        body
      }),
    }),
    changeSubscription: builder.mutation({
      query: (body) => ({
        url: 'customer/stripe/change-plan',
        method: 'PUT',
        body,
      }),
    }),
    renewSubscription: builder.mutation({
      query: (body) => ({
        url: 'customer/stripe/resume',
        method: 'PUT',
        body,
      }),
    }),
    cancelSubscription: builder.mutation({
      query: (body) => ({
        url: 'customer/stripe/cancel',
        method: 'PUT',
        body,
      }),
    }),
    newSubscription: builder.query({
      query: (params) => ({
        url: 'customer/stripe/new-subscription',
        method: 'GET',
        params,
      }),
    }),
    verifyNewSubscription: builder.mutation({
      query: (body) => ({
        url: 'customer/stripe/new-subscription-verification',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
   useCreateSubscriptionMutation,
   useCreateStripeSubscriptionMutation ,
   useVerifyStripeSubscriptionMutation,
   useChangeSubscriptionMutation,
   useRenewSubscriptionMutation,
   useCancelSubscriptionMutation,
   useLazyCreateStripeSubscriptionV2Query,
   useLazyNewSubscriptionQuery,
   useVerifyNewSubscriptionMutation
  } = subscriptionApi; 