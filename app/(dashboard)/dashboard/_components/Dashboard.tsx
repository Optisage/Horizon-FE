"use client";

import { useState, useEffect } from "react";
import { CustomPagination, SearchInput } from "../../_components";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Product {
  asin: string;
  image?: string;
  title: string;
  rating?: number;
  reviews?: number;
  category?: string;
}

import UFO from "@/public/assets/svg/ufo.svg";
import SalesStats from "./SalesStats";
import {
  useSearchItemsQuery,
  useFetchMarketplacesQuery,
} from "@/redux/api/productsApi";

const Dashboard = () => {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const router = useRouter();

  // Debounce input to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchValue), 500);
    return () => clearTimeout(handler);
  }, [searchValue]);

  // Fetch products
  const { data, error, isLoading } = useSearchItemsQuery(
    debouncedSearch
      ? { q: debouncedSearch, marketplaceId: "ATVPDKIKX0DER" }
      : undefined,
    { skip: !debouncedSearch }
  );

  const {
    data: marketPlaces,
    error: marketPlacesError,
    isLoading: isLoadingMarketPlaces,
  } = useFetchMarketplacesQuery({});

  const marketPlacesData =
    marketPlaces?.data?.map(
      (mp: { marketplaceId: string }) => mp.marketplaceId
    ) || [];

  const products = data?.products || [];

  console.log("market places:", marketPlacesData);

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      <SearchInput value={searchValue} onChange={setSearchValue} />

      {isLoading && (
        <div className="text-center text-gray-500 mt-4">Loading...</div>
      )}

      {error && (
        <div className="text-center text-red-500 mt-4">
          Failed to load products.
        </div>
      )}

      {!debouncedSearch && !isLoading && !error && (
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
                    {product.category} | <SalesStats />
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* pagination (if needed) */}
          <CustomPagination />
        </main>
      )}
    </section>
  );
};

export default Dashboard;
