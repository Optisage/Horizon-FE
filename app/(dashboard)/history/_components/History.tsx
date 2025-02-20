"use client";

import { useState } from "react";
import { CustomPagination, SearchInput } from "@/app/(dashboard)/_components";
import { useRouter } from "next/navigation";

import SalesStats from "../../dashboard/_components/SalesStats";

import { products } from "../../dashboard/_components/Dashboard";
import { GoArrowUpRight } from "react-icons/go";

const History = () => {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      <div className="flex flex-col gap-4">
        <h1 className="text-[#171717] font-medium text-xl md:text-2xl">
          Search History
        </h1>

        <SearchInput
          placeholder="Banana"
          value={searchValue}
          onChange={setSearchValue}
        />
      </div>

      <main className="flex flex-col gap-20 justify-between h-full">
        <div className="p-2 rounded-lg border border-border flex flex-col divide-y divide-[#E4E4E7]">
          <span className="py-2 text-[#95A4B7] border-b border-gray-50 uppercase font-bold text-sm">
            Today
          </span>

          {products.map((product) => (
            <div
              key={product.id}
              className="hover:bg-gray-50 duration-200 cursor-pointer px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="rounded-full size-16 bg-[#F7F7F7] flex items-center justify-center">
                <GoArrowUpRight className="size-8" />
              </div>
              <div className="flex flex-col gap-1 text-[#09090B]">
                <p
                  onClick={() =>
                    router.push(`/dashboard/product/${product.id}`)
                  }
                  className="font-bold hover:underline duration-100"
                >
                  {product.title}
                </p>
                <p>
                  {"⭐".repeat(product.rating)}{" "}
                  <span className="font-bold">({product.reviews})</span>
                </p>
                <p className="text-sm">By ASIN: {product.asin}</p>
                <p className="text-sm">
                  {product.category} | <SalesStats />
                </p>
              </div>
            </div>
          ))}

          <span className="py-2 text-[#95A4B7] border-b border-gray-50 uppercase font-bold text-sm">
            Yesterday
          </span>
          {products.map((product) => (
            <div
              key={product.id}
              className="hover:bg-gray-50 duration-200 cursor-pointer px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="rounded-full size-16 bg-[#F7F7F7] flex items-center justify-center">
                <GoArrowUpRight className="size-8" />
              </div>
              <div className="flex flex-col gap-1 text-[#09090B]">
                <p
                  onClick={() =>
                    router.push(`/dashboard/product/${product.id}`)
                  }
                  className="font-bold hover:underline duration-100"
                >
                  {product.title}
                </p>
                <p>
                  {"⭐".repeat(product.rating)}{" "}
                  <span className="font-bold">({product.reviews})</span>
                </p>
                <p className="text-sm">By ASIN: {product.asin}</p>
                <p className="text-sm">
                  {product.category} | <SalesStats />
                </p>
              </div>
            </div>
          ))}
        </div>

        <CustomPagination />
      </main>
    </section>
  );
};

export default History;
