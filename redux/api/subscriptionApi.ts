import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface SubscriptionRequest {
  email:string,
  name: string,
  pricing_id: number,
  payment_method:string
}

interface SubscriptionResponse {
  clientSecret?: string;
  message?: string;
  error?: string;
}

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api-staging.optisage.ai/api' }),
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