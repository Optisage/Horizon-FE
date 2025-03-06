import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryForAuth } from "../queryInterceptor";

export const productsApi = createApi({
  reducerPath: "productsApi",
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 10,
  baseQuery: baseQueryForAuth,
  endpoints: (builder) => ({
    searchItems: builder.query({
      query: ({ q, marketplaceId }) => ({
        url: "catalog",
        method: "GET",
        params: { q, marketplaceId },
      }),
    }),

    getItem: builder.query({
      query: ({ marketplaceId, itemAsin }) => ({
        url: "catalog/products",
        method: "GET",
        params: { marketplaceId, asin: itemAsin }, 
      }),
    }),

    getRankingsAndPrices: builder.query({
      query: ({ marketplaceId, itemAsin }) => ({
        url: "catalog/products/rankings",
        method: "GET",
        params: { marketplaceId, asin: itemAsin },
      }),
      // https://api.optisage.test/api/catalog/products/rankings?marketplaceId=ATVPDKIKX0DER&asin=B00V5DG6IQ
    }),

    getBuyboxInfo: builder.query({
      query: ({ marketplaceId, itemAsin }) => ({
        url: "catalog/products/buybox-details",
        method: "GET",
        params: { marketplaceId, asin: itemAsin },
      }),
    }),

    getProductFees: builder.query({
      query: ({ marketplaceId, itemAsin }) => ({
        url: `catalog/products/fees/${itemAsin}`, 
        method: "GET",
        params: { marketplaceId }, 
        // https://api.optisage.test/api/catalog/products/fees/:asin
      }),
    }),

    getOrderMetrics: builder.query({
      query: ({ marketplaceId, itemAsin, startDate, endDate }) => ({
        url: "catalog/products/sales-statistics",
        method: "GET",
        params: { 
          marketplaceId, 
          asin: itemAsin, 
          startDate, 
          endDate 
        },
        // https://api.optisage.test/api/catalog/products/sales-statistics?asin=B07N4M94X4&marketplaceId=ATVPDKIKX0DER&startDate=2019-08-01T00:00-07:00&endDate=2018-08-03T00:00-07:00
      }),
    }),

    fetchMarketplaces: builder.query({
      query: () => ({
        url: "catalog/marketplaces",
        method: "GET",
      }),
    }),
  }),
});

export const { 
  useSearchItemsQuery, 
  useFetchMarketplacesQuery, 
  useGetItemQuery,
  useGetRankingsAndPricesQuery,
  useGetBuyboxInfoQuery,
  useGetProductFeesQuery,
  useGetOrderMetricsQuery
} = productsApi;
