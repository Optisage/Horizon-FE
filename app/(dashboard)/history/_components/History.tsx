"use client";

import { useState, useEffect } from "react";
import { CustomPagination, SearchInput } from "@/app/(dashboard)/_components";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GoArrowUpRight } from "react-icons/go";
import UFO from "@/public/assets/svg/ufo.svg";
import {
  useGetSearchHistoryQuery,
  useSearchProductsHistoryQuery,
} from "@/redux/api/productsApi";
import { useAppSelector } from "@/redux/hooks";
import Loader from "@/utils/loader";

export interface HistoryProduct {
  asin: string;
  image?: string;
  title: string;
  rating?: number;
  reviews?: number;
  category?: string;
  timestamp?: string;
  searchTerm?: string;
  vendor?: string;
}

// Group items by date
const groupByDate = (items: HistoryProduct[]) => {
  const grouped: Record<string, HistoryProduct[]> = {};

  items.forEach((item) => {
    const date = item.timestamp ? new Date(item.timestamp) : new Date();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey;
    if (date.toDateString() === today.toDateString()) {
      dateKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Yesterday";
    } else {
      dateKey = date.toLocaleDateString();
    }

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(item);
  });

  return grouped;
};

const History = () => {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const { marketplaceId } = useAppSelector((state) => state?.global);

  // Debounce input to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue.trim() || "");
    }, 500);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Get search history
  const {
    data: historyData,
    error: historyError,
    isLoading: historyLoading,
  } = useGetSearchHistoryQuery(
    {
      marketplaceId: marketplaceId || "1",
      //pageSize: itemsPerPage,
      page: currentPage,
    },
    { skip: false }
  );

  // Search products in search history
  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
  } = useSearchProductsHistoryQuery(
    {
      q: debouncedSearch || "",
      marketplaceId: marketplaceId || "1",
      //perPage: itemsPerPage,
      page: currentPage,
    },
    { skip: !debouncedSearch }
  );

 

  // Update pagination tokens
  useEffect(() => {
    const meta = debouncedSearch ? productsData?.meta : historyData?.meta;
    if (meta) {
      setTotalPages(meta.last_page);
      setCurrentPage(meta.current_page);
    }
  }, [historyData, productsData, debouncedSearch]);

  // Reset loading states
  useEffect(() => {
    if (historyData || productsData || historyError || productsError) {
      setIsPaginationLoading(false);
    }
  }, [historyData, productsData, historyError, productsError]);

  const isLoading = historyLoading || productsLoading;
  const error = historyError || productsError;

  // Process the search history data based on the response
  const historyItems: HistoryProduct[] = historyData?.data
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      historyData.data.map((item: any) => ({
        asin: item.asin || "N/A",
        image: item.product_image,
        title: item.product_name || item.search_term || "Unknown search",
        rating: item.rating?.stars || 0,
        reviews: item.rating?.count || 0,
        category: item.category || "N/A",
        timestamp: item.timestamp || new Date().toISOString(),
        vendor: item.vendor,
      }))
    : [];

  // Process product data if search is performed
  const productItems: HistoryProduct[] = productsData?.data
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      productsData.data.map((item: any) => ({
        asin: item.asin || "N/A",
        image: item.product_image,
        title: item.product_name || "Unknown product",
        rating: item.rating?.stars || 0,
        reviews: item.rating?.count || 0,
        category: item.category || "N/A",
        timestamp: item.timestamp || new Date().toISOString(),
        vendor: item.vendor,
      }))
    : [];

  // Use products if search is performed, otherwise use history
  const displayItems = debouncedSearch ? productItems : historyItems;
  const groupedItems = groupByDate(displayItems);

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      <div className="flex flex-col gap-4">
        <h1 className="text-[#171717] font-medium text-xl md:text-2xl">
          Search History
        </h1>

        <SearchInput
          placeholder="Search your history..."
          value={searchValue}
          onChange={setSearchValue}
        />
      </div>

      {isLoading && <Loader />}

      {error && (
        <div className="text-center text-red-500 mt-4">
          Failed to load search history.
        </div>
      )}

      {displayItems.length === 0 && !isLoading && !error && (
        <div className="flex flex-col gap-6 justify-center items-center my-auto">
          <Image
            src={UFO}
            alt="No history found"
            className="sm:size-[200px]"
            width={200}
            height={200}
          />
          <span className="text-center space-y-1">
            <h4 className="text-neutral-900 font-bold text-xl md:text-2xl">
              No search history found
            </h4>
            <p className="text-[#52525B] text-sm">
              Your search history will appear here.
            </p>
          </span>
        </div>
      )}

      {displayItems.length > 0 && (
        <main className="flex flex-col gap-20 justify-between h-full">
          <div className="p-2 rounded-lg border border-border flex flex-col divide-y divide-[#E4E4E7]">
            {Object.entries(groupedItems).map(([date, items]) => (
              <div key={date} className="flex flex-col">
                <span className="py-2 text-[#95A4B7] border-b border-gray-50 uppercase font-bold text-sm">
                  {date}
                </span>

                {items.map((item, index) => (
                  <div
                    key={`${item.asin}-${index}`}
                    className="hover:bg-gray-50 duration-200 cursor-pointer px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt="product"
                        className="size-16 rounded-lg object-cover"
                        width={64}
                        height={64}
                        quality={90}
                        priority
                        unoptimized
                      />
                    ) : (
                      <div className="rounded-full size-16 bg-[#F7F7F7] flex items-center justify-center">
                        <GoArrowUpRight className="size-8" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1 text-[#09090B]">
                      <p
                        onClick={() =>
                          router.push(`/dashboard/product/${item.asin}`)
                        }
                        className="font-bold hover:underline duration-100"
                      >
                        {item.title}
                      </p>
                      {item.rating !== undefined && item.rating > 0 && (
                        <p>
                          {"⭐".repeat(Math.min(item.rating, 5))}{" "}
                          <span className="font-bold">
                            ({item.reviews || 0})
                          </span>
                        </p>
                      )}
                      <p className="text-sm">By ASIN: {item.asin}</p>
                      {item.category && item.category !== "NaN" && (
                        <p className="text-sm">{item.category}</p>
                      )}
                      {item.vendor && (
                        <p className="text-sm">Vendor: {item.vendor}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {isPaginationLoading && <Loader />}
          </div>

          <CustomPagination
            onNext={() => {
              setIsPaginationLoading(true);
              setCurrentPage((prev) => prev + 1);
            }}
            onPrevious={() => {
              setIsPaginationLoading(true);
              setCurrentPage((prev) => prev - 1);
            }}
            hasNext={currentPage < totalPages}
            hasPrevious={currentPage > 1}
          />
        </main>
      )}
    </section>
  );
};

export default History;
