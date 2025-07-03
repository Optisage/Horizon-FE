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
                url: "team-b/reroute?include=stores",
                method: "GET",
                meta: { endpointHeader: '/countries', }
            }),
        }),
        quickSearch: builder.query({
            query: ({ store_names, asin, country_ids, queue }: { store_names: string[]; asin: string; country_ids: string; queue: boolean }) => {
                const storeNamesParam = store_names
                    .map(name => encodeURIComponent(name))
                    .join(',');
                return {
                    url: `team-b/reroute?stores=${storeNamesParam}&asin=${asin}&country_id=${country_ids}&queue=${queue}&group_by=flat`,
                    method: "GET",
                    meta: { endpointHeader: '/quick-search', }
                }
            },
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
    }),
});

export const {
    useLazyGetAllCountriesQuery,
    useQuickSearchQuery,
    useSearchHistoryQuery,
    useGetSearchByIdQuery,
    useReverseSearchQuery
} = quickSearchApi;



