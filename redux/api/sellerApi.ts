import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryForAuth } from "../queryInterceptor";

export const sellerApi = createApi({
  reducerPath: "Seller",
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 10,
  baseQuery: baseQueryForAuth,
  tagTypes: [""],
  endpoints: (builder) => ({
    getSellerDetails: builder.query({
      query: ({ seller_id, id }) => ({
        url: `sellers/${seller_id}?marketplaceId=${id}`,
        method: "GET",
      }),
    }),
    getSellerProducts: builder.query({
      query: ({ sellerId, ...params }) => ({
        url: `sellers/${sellerId}/products`,
        method: "GET",
        params: {
          ...params,
          sellerId,
        },
      }),
    }),
    // getSellerProducts: builder.query({
    //   query: (params) => ({
    //     url: `catalog`,
    //     method: "GET",
    //     params,
    //   }),
    // }),
  }),
});

export const { useLazyGetSellerDetailsQuery, useLazyGetSellerProductsQuery } =
  sellerApi;

