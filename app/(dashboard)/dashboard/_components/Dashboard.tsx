"use client";

import { useState, useEffect } from "react";
import { CustomPagination, SearchInput } from "../../_components";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UFO from "@/public/assets/svg/ufo.svg";
import SalesStats from "./SalesStats";
import { useSearchItemsQuery } from "@/redux/api/productsApi";
import { useAppSelector } from "@/redux/hooks";
import Loader from "@/utils/loader";

export interface Product {
  asin: string;
  image?: string;
  title: string;
  rating?: number;
  reviews?: number;
  category?: string;
  brand?: string;
  modelNumber?: string;
  vendor?: string;
  size?: string;
  color?: string;
  dimensions?: {
    height: { value: number; unit: string };
    length: { value: number; unit: string };
    weight: { value: number; unit: string };
    width: { value: number; unit: string };
  };
  classifications?: {
    displayName: string;
    classificationId: string;
  }[];
  sales_statistics?: {
    estimated_sales_per_month: {
      currency: string;
      amount: number;
    };
    number_of_sellers: number;
    sales_analytics: {
      net_revenue: {
        amount: number;
        percentage: number;
        currency: string;
      };
      price: {
        amount: number;
        percentage: number;
        currency: string;
      };
      monthly_units_sold: {
        amount: number;
        percentage: number;
      };
      daily_units_sold: {
        amount: number;
        percentage: number;
      };
      monthly_revenue: {
        amount: number;
        percentage: number;
        currency: string;
      };
    };
    date_first_available: string;
    seller_type: string;
  };
  buybox_timeline?: {
    seller: string;
    timestamp: string;
  }[];
}

const Dashboard = () => {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const router = useRouter();
  const { marketplaceId } = useAppSelector((state) => state?.global);

  // Debounce input to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchValue), 500);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // Fetch products
  const { data, error, isLoading } = useSearchItemsQuery(
    debouncedSearch
      ? {
          q: debouncedSearch,
          marketplaceId: marketplaceId,
          pageSize: itemsPerPage,
          pageToken: (currentPage - 1) * itemsPerPage,
        }
      : undefined,
    { skip: !debouncedSearch }
  );

  const totalResults = data?.data?.pagination?.total || 0;

  const products =
    debouncedSearch && data?.data?.items
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.data.items.map((item: any) => ({
          asin: item.basic_details.asin,
          image: item.basic_details.product_image,
          title: item.basic_details.product_name,
          rating: item.basic_details.rating.stars,
          reviews: item.basic_details.rating.count,
          category: item.basic_details.category,
          vendor: item.basic_details.vendor,
          sales_statistics: item.sales_statistics,
          buybox_timeline: item.buybox_timeline,
        }))
      : [];

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      <SearchInput value={searchValue} onChange={setSearchValue} />
      {/* <h2>Selected Marketplace ID: {marketplaceId || "N/A"}</h2> */}

      {isLoading && <Loader />}

      {error && (
        <div className="text-center text-red-500 mt-4">
          Failed to load products.
        </div>
      )}

      {(!debouncedSearch || products.length === 0) && !isLoading && !error && (
        <div className="flex flex-col gap-6 justify-center items-center my-auto">
          <Image
            src={UFO}
            alt="UFO"
            className="sm:size-[200px]"
            width={200}
            height={200}
          />
          <span className="text-center space-y-1">
            <h4 className="text-neutral-900 font-bold text-xl md:text-2xl">
              No products found
            </h4>
            <p className="text-[#52525B] text-sm">
              Try a different search term.
            </p>
          </span>
        </div>
      )}

      {products.length > 0 && (
        <main className="flex flex-col gap-20 justify-between h-full">
          <div className="p-2 rounded-lg border border-border flex flex-col divide-y divide-[#E4E4E7]">
            <span className="bg-[#FAFAFA] px-4 py-3.5">
              <h4 className="text-neutral-900 font-medium text-base md:text-lg">
                Product
              </h4>
            </span>

            {products.map((product: Product) => (
              <div
                key={product.asin}
                className="hover:bg-gray-50 duration-200 cursor-pointer px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <Image
                  onClick={() =>
                    router.push(`/dashboard/product/${product.asin}`)
                  }
                  src={product.image || UFO}
                  alt="product"
                  className="size-16 rounded-lg object-cover"
                  width={64}
                  height={64}
                  quality={90}
                  priority
                  unoptimized
                />
                <div className="flex flex-col gap-1 text-[#09090B]">
                  <p
                    onClick={() =>
                      router.push(`/dashboard/product/${product.asin}`)
                    }
                    className="font-bold hover:underline duration-100"
                  >
                    {product.title}
                  </p>
                  <p>
                    {"⭐".repeat(product.rating || 0)}{" "}
                    <span className="font-bold">({product.reviews || 0})</span>
                  </p>
                  <p className="text-sm">By ASIN: {product.asin}</p>

                  <p className="text-sm">
                    {product.category} | <SalesStats product={product} />
                  </p>
                </div>
              </div>
            ))}
          </div>

          <CustomPagination
            currentPage={currentPage}
            totalResults={totalResults}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1); // Reset to first page on change
            }}
          />
        </main>
      )}
    </section>
  );
};

export default Dashboard;
