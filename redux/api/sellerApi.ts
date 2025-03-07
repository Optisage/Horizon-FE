import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryForAuth } from "../queryInterceptor";


export const sellerApi = createApi({
  reducerPath: "Seller",
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 10,
  baseQuery: baseQueryForAuth,
  tagTypes: ["Profile"],
  endpoints: (builder) => ({

   
    getSellerDetails: builder.query({
      query: () => ({
        url: `sellers/A3DJR8M9Y3OUPG`,
        method: "GET",
      }),
    }),
    getSellerProducts: builder.query({
      query: () => ({
        url: `catalog?marketplaceId=ATVPDKIKX0DER&sellerId=A3DJR8M9Y3OUPG`,
        method: "GET",
      }),
    }),

  }),
});

export const {
useLazyGetSellerDetailsQuery,
useLazyGetSellerProductsQuery

} = sellerApi;
