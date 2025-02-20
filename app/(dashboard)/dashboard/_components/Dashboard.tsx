"use client";

import { useState } from "react";
import { CustomPagination, SearchInput } from "../../_components";
import Image from "next/image";

import { useRouter } from "next/navigation";

import UFO from "@/public/assets/svg/ufo.svg";
import Product1 from "@/public/assets/images/product-1.png";
import Product2 from "@/public/assets/images/product-2.png";
import Product3 from "@/public/assets/images/product-3.png";
import Product4 from "@/public/assets/images/product-4.png";
import Product5 from "@/public/assets/images/product-5.png";
import SalesStats from "./SalesStats";

export const products = [
  {
    id: 1,
    image: Product1,
    title:
      "Bear Paws Banana Bread Cookies - Soft Cookie Snack Packs, Made With Real Banana, Family Pack, 480g, 12 Pouches",
    rating: 4,
    reviews: 5292,
    asin: "B0881KNMSS",
    category: "Grocery & Gourmet Food",
  },
  {
    id: 2,
    image: Product2,
    title:
      "Bear Paws Banana Bread Cookies (Pack of 6) - Family Size, Peanut Free School Snacks, 6x480g, 72 pouches",
    rating: 5,
    reviews: 5294,
    asin: "B0DHDC557Y",
    category: "Grocery & Gourmet Food",
  },
  {
    id: 3,
    image: Product3,
    title:
      "Bear Paws Banana Bread Cookies - Soft Cookie Snack Packs, Peanut Free, 240g, 6 Pouches",
    rating: 3,
    reviews: 5294,
    asin: "B07DMQJ621",
    category: "Grocery & Gourmet Food",
  },
  {
    id: 4,
    image: Product4,
    title:
      "APTRO Men's Swim Trunks Quick Dry Swim Shorts Bathing Suit Board Shorts HW022 Banana L",
    rating: 3,
    reviews: 3148,
    asin: "B08TTBD5DS",
    category: "Grocery & Gourmet Food",
  },
  {
    id: 5,
    image: Product5,
    title:
      "CLIF BAR - Energy Bars - Peanut Butter Banana- (68 Gram Protein Bars, 12 Count) Packaging May Vary",
    rating: 3,
    reviews: 457,
    asin: "B07JC42PZP",
    category: "Grocery & Gourmet Food",
  },
];

const Dashboard = () => {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      <SearchInput value={searchValue} onChange={setSearchValue} />

      {searchValue.trim() === "" && (
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
              No product
            </h4>
            <p className="text-[#52525B] text-sm">
              Find a product and unlock powerful insights.
            </p>
          </span>
        </div>
      )}

      {searchValue.trim() !== "" && (
        <main className="flex flex-col gap-20 justify-between h-full">
          <div className="p-2 rounded-lg border border-[#E4E4E7] flex flex-col divide-y divide-[#E4E4E7]">
            <span className="bg-[#FAFAFA] px-4 py-3.5">
              <h4 className="text-neutral-900 font-medium text-base md:text-lg">
                Product
              </h4>
            </span>

            {products.map((product) => (
              <div
                key={product.id}
                className="hover:bg-gray-50 duration-200 cursor-pointer px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <Image
                  onClick={() =>
                    router.push(`/dashboard/product/${product.id}`)
                  }
                  src={product.image}
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

          {/* pagination */}
          <CustomPagination />
        </main>
      )}
    </section>
  );
};

export default Dashboard;
