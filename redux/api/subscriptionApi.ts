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
  }),
});

export const { useCreateSubscriptionMutation } = subscriptionApi; 