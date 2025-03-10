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
      query: ({seller_id,id}) => ({
        url: `sellers/${seller_id}?marketplaceId=${id}`,
        method: "GET",
      }),
    }),
    getSellerProducts: builder.query({
      query: ({marketplaceId,sellerId}) => ({
        url: `catalog?marketplaceId=${marketplaceId}&sellerId=${sellerId}`,
        method: "GET",
      }),
    }),

  }),
});

export const {
useLazyGetSellerDetailsQuery,
useLazyGetSellerProductsQuery

} = sellerApi;
