"use client";

import { useState } from "react";
import { SearchInput } from "../../_components";
import Image from "next/image";

import UFO from "@/public/assets/svg/ufo.svg";
import Product1 from "@/public/assets/images/product-1.png";
import Product2 from "@/public/assets/images/product-2.png";
import Product3 from "@/public/assets/images/product-3.png";
import Product4 from "@/public/assets/images/product-4.png";
import Product5 from "@/public/assets/images/product-5.png";
import Link from "next/link";
import { Pagination, Select } from "antd";

const Dashboard = () => {
  const [searchValue, setSearchValue] = useState("");

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

      {/* Display search results if search value is not empty */}
      {searchValue.trim() !== "" && (
        <main className="flex flex-col gap-20 justify-between h-full">
          <div className="p-2 rounded-lg border border-[#E4E4E7] flex flex-col divide-y divide-[#E4E4E7]">
            <span className="bg-[#FAFAFA] px-4 py-3.5">
              <h4 className="text-neutral-900 font-medium text-base md:text-lg">
                Product
              </h4>
            </span>

            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4">
              <Image
                src={Product1}
                alt="product"
                className="size-16 rounded-lg object-cover"
                width={64}
                height={64}
                quality={90}
                priority
              />

              <div className="flex flex-col gap-1 text-[#09090B]">
                <p className="font-bold">
                  Bear Paws Banana Bread Cookies - Soft Cookie Snack Packs, Made
                  With Real Banana, Family Pack, 480g, 12 Pouches
                </p>
                <p>
                  ⭐⭐⭐⭐ <span className="font-bold">(5292)</span>
                </p>
                <p className="text-sm">By Dare ASIN: B0881KNMSS</p>
                <p className="text-sm">
                  Grocery & Gourmet Food |{" "}
                  <Link
                    href=""
                    className="text-primary hover:underline duration-150"
                  >
                    Sales Statistics
                  </Link>
                </p>
              </div>
            </div>

            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4">
              <Image
                src={Product2}
                alt="product"
                className="size-16 rounded-lg object-cover"
                width={64}
                height={64}
                quality={90}
                priority
              />

              <div className="flex flex-col gap-1 text-[#09090B]">
                <p className="font-bold">
                  Bear Paws Banana Bread Cookies (Pack of 6) - Family Size,
                  Peanut Free School Snacks, 6x480g, 72 pouches
                </p>
                <p>
                  ⭐⭐⭐⭐⭐ <span className="font-bold">(5294)</span>
                </p>
                <p className="text-sm">By Dare Foods ASIN: B0DHDC557Y</p>
                <p className="text-sm">
                  Grocery & Gourmet Food |{" "}
                  <Link
                    href=""
                    className="text-primary hover:underline duration-150"
                  >
                    Sales Statistics
                  </Link>
                </p>
              </div>
            </div>

            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4">
              <Image
                src={Product3}
                alt="product"
                className="size-16 rounded-lg object-cover"
                width={64}
                height={64}
                quality={90}
                priority
              />

              <div className="flex flex-col gap-1 text-[#09090B]">
                <p className="font-bold">
                  Bear Paws Banana Bread Cookies - Soft Cookie Snack Packs,
                  Peanut Free, 240g, 6 Pouches
                </p>
                <p>
                  ⭐⭐⭐ <span className="font-bold">(5294)</span>
                </p>
                <p className="text-sm">By Dare Foods ASIN: B07DMQJ621</p>
                <p className="text-sm">
                  Grocery & Gourmet Food |{" "}
                  <Link
                    href=""
                    className="text-primary hover:underline duration-150"
                  >
                    Sales Statistics
                  </Link>
                </p>
              </div>
            </div>

            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4">
              <Image
                src={Product4}
                alt="product"
                className="size-16 rounded-lg object-cover"
                width={64}
                height={64}
                quality={90}
                priority
              />

              <div className="flex flex-col gap-1 text-[#09090B]">
                <p className="font-bold">
                  APTRO Men&apos;s Swim Trunks Quick Dry Swim Shorts Bathing
                  Suit Board Shorts HW022 Banana L
                </p>
                <p>
                  ⭐⭐⭐ <span className="font-bold">(3148)</span>
                </p>
                <p className="text-sm">By ASIN: B08TTBD5DS</p>
                <p className="text-sm">
                  Grocery & Gourmet Food |{" "}
                  <Link
                    href=""
                    className="text-primary hover:underline duration-150"
                  >
                    Sales Statistics
                  </Link>
                </p>
              </div>
            </div>

            <div className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4">
              <Image
                src={Product5}
                alt="product"
                className="size-16 rounded-lg object-cover"
                width={64}
                height={64}
                quality={90}
                priority
              />

              <div className="flex flex-col gap-1 text-[#09090B]">
                <p className="font-bold">
                  CLIF BAR - Energy Bars - Peanut Butter Banana- (68 Gram
                  Protein Bars, 12 Count) Packaging May Vary
                </p>
                <p>
                  ⭐⭐⭐ <span className="font-bold">(457)</span>
                </p>
                <p className="text-sm">
                  By Mondelez International ASIN: B07JC42PZP
                </p>
                <p className="text-sm">
                  Grocery & Gourmet Food |{" "}
                  <Link
                    href=""
                    className="text-primary hover:underline duration-150"
                  >
                    Sales Statistics
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* pagination */}
          <div className="p-4 border-t flex flex-col md:flex-row items-center gap-6 justify-between">
            <p className="text-[#3F3F46]">Page of 1 of 16</p>

            <Pagination defaultCurrent={1} total={50} />

            <Select
              defaultValue="6"
              style={{ width: 142 }}
              options={[
                { value: "6", label: "6 Data per row" },
                { value: "8", label: "8 Data per row" },
                { value: "10", label: "10 Data per row" },
                { value: "20", label: "20 Data per row" },
              ]}
            />
          </div>
        </main>
      )}
    </section>
  );
};

export default Dashboard;
