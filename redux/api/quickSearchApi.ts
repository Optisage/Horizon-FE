import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithInterceptor } from "../queryInterceptor";

export const quickSearchApi = createApi({
    reducerPath: "quickSearchApi",
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: 10,
    baseQuery: baseQueryWithInterceptor,
    endpoints: (builder) => ({
        getAllCountries: builder.query({
            query: () => ({
                url: "countries?include=stores",
                method: "GET",
                meta: { server: 'test' }
            }),
        }),
        quickSearch: builder.query({
            query: ({ store_names, asin, country_ids }) => {
                const storeNamesParam = store_names
                    .map(name => encodeURIComponent(name))
                    .join(',');
                return {
                    url: `quick-search?stores=${storeNamesParam}&asin=${asin}&country_id=${country_ids}`,
                    method: "GET",
                    meta: { server: 'test' }
                }

            },
        }),
        searchHistory: builder.query({
            // query: ({page, per_page}) => ({
            //     url: `search?include=store,marketplace,country&page=${page}&per_page=${per_page}`,
            //     method: "GET",
            //     meta: { server: 'test' }
            // }),
            query: () => ({
                url: `search?include=store,marketplace,country`,
                method: "GET",
                meta: { server: 'test' }
            }),
        }),
    }),
});

export const {
    useLazyGetAllCountriesQuery,
    useLazyQuickSearchQuery,
    useSearchHistoryQuery
} = quickSearchApi;
