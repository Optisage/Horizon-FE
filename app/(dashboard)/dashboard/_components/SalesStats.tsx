"use client";

import { useState } from "react";
import { Drawer } from "antd";
import { BsArrowDown, BsArrowUp } from "react-icons/bs";

import ProductThumbnail from "@/public/assets/images/women-shoes.png";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";

const buyBoxData = [
  {
    seller: "Wale Enterprise",
    date: "01 Aug 2024, 00:59 PM",
    latest: false,
  },
  {
    seller: "Wale Enterprise",
    date: "01 Aug 2024, 00:59 PM",
    latest: false,
  },
  {
    seller: "Wale Enterprise",
    date: "01 Aug 2024, 00:59 PM",
    latest: false,
  },
  {
    seller: "Wale Enterprise",
    date: "01 Aug 2024, 00:59 PM",
    latest: false,
  },
  {
    seller: "David Enterprise",
    date: "05 Aug 2024, 00:59 PM",
    latest: true,
  },
];

const SalesStats = () => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={showDrawer}
        className="text-primary hover:underline duration-150"
      >
        Sales Statistics
      </button>

      <Drawer
        onClose={onClose}
        open={open}
        closable={false}
        width={500}
        styles={{ body: { padding: 0 } }}
      >
        <div className="p-6 flex flex-col gap-4">
          {/* product details */}
          <div className="border border-border rounded-xl shadow-sm p-4 flex flex-col gap-6 text-[#09090B]">
            <div className="flex gap-4">
              <span className="size-12 flex items-center justify-center">
                <span className="size-12 overflow-hidden rounded-lg mt-4">
                  <Image
                    src={ProductThumbnail}
                    alt="thumbnail"
                    className="size-12 object-cover"
                    width={48}
                    height={48}
                  />
                </span>
              </span>

              <span className="space-y-1 text-sm">
                <h3 className="text-base font-bold">
                  TIOSEBON Women&apos;s Slip On Walking Shoes Lightweight
                  Sneakers Slip Resistant Athletic Shoes
                </h3>
                <p>
                  ⭐⭐⭐⭐ <span className="font-bold">(5292)</span>
                </p>
                <p>By Dare ASIN: B0881KNMSS</p>
              </span>
            </div>

            <div className="border border-border rounded-lg grid grid-cols-2 divide-x">
              <span className="p-4 flex flex-col gap-1">
                <p className="text-[#737373] text-xs">Estimated No. of Sales</p>
                <p className="text-xl md:text-2xl font-semibold">
                  $1,800 / month
                </p>
              </span>
              <span className="p-4 flex flex-col gap-1">
                <p className="text-[#737373] text-xs">Total No. of Sellers:</p>
                <p className="text-xl md:text-2xl font-semibold">5 Sellers</p>
              </span>
            </div>
          </div>

          {/* Seller Analytics */}
          <div className="border border-border rounded-xl shadow-sm p-4 flex flex-col gap-3">
            <p className="text-[#0A0A0A] font-semibold text-base">
              Seller Analytics
            </p>

            <div className="bg-[#FFF9D6] rounded-xl p-3 flex items-center gap-4 justify-between">
              <span className="flex flex-col gap-1">
                <p className="text-[#737373] text-xs">Net Revenue</p>
                <p className="text-base font-semibold">$55.82</p>
              </span>
              <p className="text-green-500 text-sm flex items-center gap-0.5">
                <BsArrowUp className="size-4" />
                23.5%
              </p>
            </div>

            <div className="border border-border rounded-lg grid grid-cols-2 divide-x">
              <span className="p-3 flex items-center gap-4 justify-between">
                <span className="flex flex-col gap-1">
                  <p className="text-[#737373] text-xs">Price</p>
                  <p className="text-base font-semibold">$34.19</p>
                </span>
                <p className="text-green-500 text-sm flex items-center gap-0.5">
                  <BsArrowUp className="size-4" />
                  23.5%
                </p>
              </span>
              <span className="p-3 flex items-center gap-4 justify-between">
                <span className="flex flex-col gap-1">
                  <p className="text-[#737373] text-xs">Monthly Units Sold</p>
                  <p className="text-base font-semibold">$14,093</p>
                </span>
                <p className="text-green-500 text-sm flex items-center gap-0.5">
                  <BsArrowUp className="size-4" />
                  23.5%
                </p>
              </span>
            </div>

            <div className="border border-border rounded-lg grid grid-cols-2 divide-x">
              <span className="p-3 flex items-center gap-4 justify-between">
                <span className="flex flex-col gap-1">
                  <p className="text-[#737373] text-xs">Daily Units Sold</p>
                  <p className="text-base font-semibold">573</p>
                </span>
                <p className="text-red-500 text-sm flex items-center gap-0.5">
                  <BsArrowDown className="size-4" />
                  23.5%
                </p>
              </span>
              <span className="p-3 flex items-center gap-4 justify-between">
                <span className="flex flex-col gap-1">
                  <p className="text-[#737373] text-xs">Monthly Revenue</p>
                  <p className="text-base font-semibold">$481,278</p>
                </span>
                <p className="text-green-500 text-sm flex items-center gap-0.5">
                  <BsArrowUp className="size-4" />
                  23.5%
                </p>
              </span>
            </div>

            <div className="flex flex-col gap-2 text-base">
              <span className="flex items-center gap-5 justify-between">
                <p className="text-[#595959]">Date First Available</p>
                <p className="font-semibold">07/05/2021</p>
              </span>
              <span className="flex items-center gap-5 justify-between">
                <p className="text-[#595959]">Seller Type</p>
                <p className="font-semibold">AMZ</p>
              </span>
            </div>
          </div>

          {/* Buy box timeline (Last 5 sellers) */}
          <div className="border border-gray-300 rounded-xl shadow-sm p-4 flex flex-col gap-3 bg-white">
            <p className="text-black font-semibold text-base">
              Buy box timeline (Last 5 sellers)
            </p>

            <div className="flex flex-col gap-4">
              {buyBoxData.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <FaCheckCircle
                    className={`size-4 mt-1 ${
                      item.latest ? "text-green-500" : "text-gray-400"
                    }`}
                  />

                  <div className="flex flex-col gap-1">
                    <p
                      className={`font-semibold text-sm ${
                        item.latest ? "text-black" : "text-[#A3A3A3]"
                      }`}
                    >
                      {item.latest
                        ? "Latest Seller with the Buy Box"
                        : "Last Seller with the Buy Box"}
                    </p>
                    <p className="text-[#A3A3A3] text-xs">
                      {item.seller} ({item.date})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default SalesStats;
