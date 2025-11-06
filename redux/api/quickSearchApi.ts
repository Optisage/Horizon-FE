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
        getReverseSearchCategories: builder.query({
            query: () => ({
                url: "/go-compare/reverse-search/categories",
                method: "GET",
            }),
        }),
        quickSearch: builder.query({
            query: ({ asin, marketplace_id }: { asin: string; marketplace_id: number; queue?: boolean }) => ({
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
                url: `/go-compare/search-history?page=${page}&per_page=${perPage}`,
                method: "GET",
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
            query: ({ queryName, store, perPage, sortBy, sortOrder, marketplaceId, category }) => {
                let url = `team-b/reroute?product_name=${encodeURIComponent(queryName)}&limit=${perPage}&sort_by=${sortBy}&sort_order=${sortOrder}`;
                
                // Add marketplace_id if provided
                if (marketplaceId) {
                    url += `&marketplace_id=${marketplaceId}`;
                }
                
                // Add store if provided
                if (store) {
                    url += `&store=${encodeURIComponent(store)}`;
                }
                
                // Add category if provided
                if (category) {
                    url += `&category=${encodeURIComponent(category)}`;
                }
                
                return {
                    url,
                    method: "GET",
                    meta: { endpointHeader: '/reverse-arbitrage' }
                };
            },
        }),
        getProductDetails: builder.query({
            query: ({ asin, marketplace_id }) => ({
                url: `team-b/products/details?asin=${asin}&marketplace_id=${marketplace_id}`,
                method: "GET",
            }),
        }),
        getComparisonProductDetails: builder.query({
            query: ({ asin, marketplace_id, sales_price }) => ({
                url: `/go-compare/product-details?asin=${asin}&marketplace_id=${marketplace_id}${sales_price ? `&sales_price=${sales_price}` : ''}`,
                method: "GET",
            }),
        }),
        refreshQuickSearch: builder.query({
            query: ({ searchId, perPage = 10 }: { searchId: string | number; perPage?: number }) => ({
                url: `/go-compare/quick-search/${searchId}?perPage=${perPage}`,
                method: "GET",
            }),
        }),
        tacticalSearch: builder.mutation({
            query: ({ seller_id, marketplace_id, category_id }) => {
                let url = `/go-compare/reverse-search?result_format=json`;
                
                if (seller_id) {
                    url += `&seller_id=${encodeURIComponent(seller_id)}`;
                }
                
                if (marketplace_id) {
                    url += `&marketplace_id=${marketplace_id}`;
                }
                
                if (category_id) {
                    url += `&category_id=${category_id}`;
                }
                
                return {
                    url,
                    method: "GET",
                };
            },
        }),
    }),
});

export const {
    useLazyGetAllCountriesQuery,
    useLazyGetReverseSearchCategoriesQuery,
    useQuickSearchQuery,
    useSearchHistoryQuery,
    useGetSearchByIdQuery,
    useReverseSearchQuery,
    useGetProductDetailsQuery,
    useLazyGetProductDetailsQuery,
    useGetComparisonProductDetailsQuery,
    useLazyGetComparisonProductDetailsQuery,
    useRefreshQuickSearchQuery,
    useLazyRefreshQuickSearchQuery,
    useTacticalSearchMutation
} = quickSearchApi;



