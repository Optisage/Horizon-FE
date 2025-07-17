import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../queryInterceptor";

export const monitorApi = createApi({
  reducerPath: "monitorApi",
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 10,
  baseQuery: baseQuery,
  tagTypes: ["MonitoredSellers"],
  endpoints: (builder) => ({
    monitorSeller: builder.mutation<
      { success: boolean; message: string },
      { sellerId: string; marketplaceId: number }
    >({
      query: ({ sellerId, marketplaceId }) => ({
        url: "sellers/monitor",
        method: "POST",
        body: { seller_id: sellerId, marketplace_id: marketplaceId },
      }),
      invalidatesTags: ["MonitoredSellers"],
    }),
    
    unmonitorSeller: builder.mutation<
      { success: boolean; message: string },
      { sellerId: string; marketplaceId: number }
    >({
      query: ({ sellerId, marketplaceId }) => ({
        url: "sellers/unmonitor",
        method: "POST",
        body: { seller_id: sellerId, marketplace_id: marketplaceId },
      }),
      invalidatesTags: ["MonitoredSellers"],
    }),
    
    getMonitoredSellers: builder.query<
      {
        data: Array<{
          seller_id: string;
          marketplace_id: number;
          created_at: string;
          updated_at: string;
        }>;
        meta: {
          current_page: number;
          per_page: number;
          total: number;
        };
      },
      { page?: number; per_page?: number }
    >({
      query: ({ page = 1, per_page = 20 } = {}) => ({
        url: `sellers/monitored?page=${page}&per_page=${per_page}`,
        method: "GET",
      }),
      providesTags: ["MonitoredSellers"],
    }),
  }),
});

export const {
  useMonitorSellerMutation,
  useUnmonitorSellerMutation,
  useGetMonitoredSellersQuery,
} = monitorApi; 