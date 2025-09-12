import { createApi } from "@reduxjs/toolkit/query/react";
import { goCompareQuery } from "../queryInterceptor";

export const quickSearchApi = createApi({
    reducerPath: "quickSearchApi",
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: 10,
    baseQuery: goCompareQuery,
    endpoints: (builder) => ({
        getAllCountries: builder.query({
            query: () => ({
                url: "/go-compare/countries",
                method: "GET",
            }),
        }),
        quickSearch: builder.query({
            query: ({ asin, marketplace_id, queue }: { asin: string; marketplace_id: number; queue: boolean }) => ({
                url: "/go-compare/quick-search",
                method: "POST",
                body: {
                    asin_upc: asin,
                    marketplace_id: marketplace_id
                },
                meta: { endpointHeader: '/quick-search', }
            }),
        }),
        searchHistory: builder.query({
            query: ({ page, perPage }) => ({
                url: `team-b/reroute?include=store,marketplace,country&page=${page}&perPage=${perPage}`,
                method: "GET",
                meta: { endpointHeader: '/search-histories', }
            }),
        }),
        getSearchById: builder.query({
            query: ({ id }) => ({
                url: `team-b/reroute?id=${id}`,
                method: "GET",
                meta: { endpointHeader: 'search-history/results' }
            }),
        }),
        reverseSearch: builder.query({
            query: ({ queryName, store, perPage, sortBy, sortOrder }) => ({
                url: `team-b/reroute?store=${encodeURIComponent(store)}&product_name=${queryName}&limit=${perPage}&sort_by=${sortBy}&sort_order=${sortOrder}`,
                method: "GET",
                meta: { endpointHeader: '/reverse-arbitrage', }
            }),
        }),
        getProductDetails: builder.query({
            query: ({ asin, marketplace_id }) => ({
                url: `team-b/products/details?asin=${asin}&marketplace_id=${marketplace_id}`,
                method: "GET",
            }),
        }),
    }),
});

export const {
    useLazyGetAllCountriesQuery,
    useQuickSearchQuery,
    useSearchHistoryQuery,
    useGetSearchByIdQuery,
    useReverseSearchQuery,
    useGetProductDetailsQuery,
    useLazyGetProductDetailsQuery
} = quickSearchApi;



