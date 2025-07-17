"use client";

import { useState } from "react";
import { message } from "antd";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import { 
  useMonitorSellerMutation, 
  useUnmonitorSellerMutation, 
  useGetMonitoredSellersQuery 
} from "@/redux/api/monitorApi";

interface MonitorButtonProps {
  sellerId: string;
  marketplaceId: number;
}

const MonitorButton: React.FC<MonitorButtonProps> = ({ sellerId, marketplaceId }) => {
  const [messageApi, contextHolder] = message.useMessage();
  
  // Query to check if seller is already monitored
  const { data: monitoredSellers, isLoading: isLoadingMonitored } = useGetMonitoredSellersQuery({});
  
  // Mutations for monitoring/unmonitoring
  const [monitorSeller, { isLoading: isMonitoring }] = useMonitorSellerMutation();
  const [unmonitorSeller, { isLoading: isUnmonitoring }] = useUnmonitorSellerMutation();
  
  // Check if current seller is being monitored
  const isMonitored = monitoredSellers?.data?.some(
    (seller) => seller.seller_id === sellerId && seller.marketplace_id === marketplaceId
  ) || false;
  
  const isLoading = isLoadingMonitored || isMonitoring || isUnmonitoring;
  
  const handleMonitorToggle = async () => {
    try {
      if (isMonitored) {
        const result = await unmonitorSeller({ sellerId, marketplaceId }).unwrap();
        messageApi.success(result.message || "Seller unmonitored successfully");
      } else {
        const result = await monitorSeller({ sellerId, marketplaceId }).unwrap();
        messageApi.success(result.message || "Seller is now being monitored");
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || "An error occurred";
      messageApi.error(errorMessage);
    }
  };
  
  return (
    <>
      {contextHolder}
      <button
        onClick={handleMonitorToggle}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
          ${isMonitored 
            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
            : 'bg-primary text-white hover:bg-primary/90'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </>
        ) : isMonitored ? (
          <>
            <HiOutlineEyeSlash className="w-4 h-4" />
            Unmonitor
          </>
        ) : (
          <>
            <HiOutlineEye className="w-4 h-4" />
            Monitor
          </>
        )}
      </button>
    </>
  );
};

export default MonitorButton; 