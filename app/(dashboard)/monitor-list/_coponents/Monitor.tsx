"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { MdOutlineInsertChartOutlined } from "react-icons/md";
import { useGetMonitoredSellersQuery } from "@/redux/api/monitorApi";
import { useAppSelector } from "@/redux/hooks";

// Dummy data for monitored sellers
const sellersData = [
  {
    id: 1,
    seller: "TOSSI",
    reviewCount: 763,
    rating: 4.5,
    sellerType: "FBA",
    storeName: "ToxStore",
    itemCount: 133,
    lastSeen: "12/07/25",
    lastUploaded: "12/07/25",
    percentChange: 23.5,
    isPositive: true,
  },
  {
    id: 2,
    seller: "Peak Health",
    reviewCount: 347,
    rating: 4.0,
    sellerType: "FBM",
    storeName: "PHealth",
    itemCount: 83,
    lastSeen: "12/07/25",
    lastUploaded: "12/07/25",
    percentChange: null,
    isPositive: false,
  },
  {
    id: 3,
    seller: "CB Int",
    reviewCount: 213,
    rating: 5.0,
    sellerType: "FBM",
    storeName: "CBInt",
    itemCount: 34,
    lastSeen: "12/07/25",
    lastUploaded: "12/07/25",
    percentChange: null,
    isPositive: false,
  },
  {
    id: 4,
    seller: "TOSSI",
    reviewCount: 763,
    rating: 4.5,
    sellerType: "Hybrid",
    storeName: "ToxStore",
    itemCount: 133,
    lastSeen: "12/07/25",
    lastUploaded: "12/07/25",
    percentChange: null,
    isPositive: false,
  },
  {
    id: 5,
    seller: "Peak Health",
    reviewCount: 347,
    rating: 4.0,
    sellerType: "Hybrid",
    storeName: "PHealth",
    itemCount: 83,
    lastSeen: "12/07/25",
    lastUploaded: "12/07/25",
    percentChange: null,
    isPositive: false,
  },
  {
    id: 6,
    seller: "SmartTech",
    reviewCount: 275,
    rating: 4.8,
    sellerType: "Hybrid",
    storeName: "CBInt",
    itemCount: 34,
    lastSeen: "12/07/25",
    lastUploaded: "12/07/25",
    percentChange: null,
    isPositive: false,
  },
];

const MonitorSellersList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sellers, setSellers] = useState(sellersData);
   const { marketplaceId } = useAppSelector((state) => state?.global);
const { data: monitoredSellers, isLoading: isLoadingMonitored } = useGetMonitoredSellersQuery({});

  const handleRemove = (id: any) => {
    setSellers(sellers.filter((seller) => seller.id !== id));
  };

  const getSellerTypeColor = (type: any) => {
    switch (type) {
      case "FBA":
        return "bg-black";
      case "FBM":
        return "bg-[#00E4E4]";
      case "Hybrid":
        return "bg-orange-400";
      default:
        return "bg-gray-400";
    }
  };

  const renderStars = (rating: any) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}
      >
        ★
      </span>
    ));
  };

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          className={` px-3 py-1.5 rounded-3xl  font-semibold text-sm w-max flex items-center gap-1.5 bg-primary text-white`}
        >
          <MdOutlineInsertChartOutlined className="size-5" />
          Monitor sellers list
        </button>

        <div className="relative w-64 ">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-3xl pl-10 pr-4 py-2 border border-gray-200  text-sm focus:outline-none focus:border-gray-300"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-[#F7F7F7]">
              <th className="p-4 font-medium text-gray-700 w-[60px]">#</th>
              <th className="p-4 font-medium text-gray-700">Seller</th>
              <th className="p-4 font-medium text-gray-700">Store Name</th>
              <th className="p-4 font-medium text-gray-700">No. of items</th>
              <th className="p-4 font-medium text-gray-700">Last Seen</th>
              <th className="p-4 font-medium text-gray-700">Last Uploaded</th>
              <th className="p-4 font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSellers.length > 0 ? (
              filteredSellers.map((seller) => (
                <tr
                  key={seller.id}
                  className="border-b last:border-none hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2 text-gray-700">{seller.id}</td>
                  <td className="px-4 py-2 min-w-[200px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${getSellerTypeColor(
                            seller.sellerType
                          )}`}
                        />
                        <span className="font-medium text-gray-900">
                          {seller.seller} ({seller.reviewCount})
                        </span>
                        {seller.percentChange && (
                          <span
                            className={`text-xs ${
                              seller.isPositive
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {seller.isPositive ? "↑" : "↓"}
                            {seller.percentChange}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs">
                        {renderStars(seller.rating)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <a href="#" className="text-blue-500 hover:underline">
                      {seller.storeName}
                    </a>
                  </td>
                  <td className="px-4 py-2 text-gray-700">{seller.itemCount}</td>
                  <td className="px-4 py-2 text-gray-700">{seller.lastSeen}</td>
                  <td className="px-4 py-2 text-gray-700">{seller.lastUploaded}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleRemove(seller.id)}
                      className="px-3.5 py-1.5 border border-[#FB583E] font-medium text-[#FB583E] rounded-md text-sm hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center p-6 text-gray-500">
                  No sellers found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonitorSellersList;
