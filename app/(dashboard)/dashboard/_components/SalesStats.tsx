"use client";

import { useState } from "react";
import { Drawer } from "antd";
import { BsArrowDown, BsArrowUp } from "react-icons/bs";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import CustomDatePicker from "./CustomDatePicker";

const SalesStats = ({ product }) => {
  const [open, setOpen] = useState(false);

  const salesStats = product.sales_statistics;
  const buyboxTimeline = product.buybox_timeline || [];

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
          {/* Product details */}
          <div className="border border-border rounded-xl shadow-sm p-4 flex flex-col gap-6 text-[#09090B]">
            <div className="flex gap-4">
              <span className="size-12 flex items-center justify-center">
                <span className="size-12 overflow-hidden rounded-lg mt-4">
                  <Image
                    src={product.image || "/assets/svg/ufo.svg"}
                    alt="thumbnail"
                    className="size-12 object-cover"
                    width={48}
                    height={48}
                  />
                </span>
              </span>

              <span className="space-y-1 text-sm">
                <h3 className="text-base font-bold">{product.title}</h3>
                <p>
                  {"⭐".repeat(product.rating || 0)}{" "}
                  <span className="font-bold">({product.reviews || 0})</span>
                </p>
                <p>By ASIN: {product.asin}</p>
              </span>
            </div>

            <div className="border border-border rounded-lg grid grid-cols-2 divide-x">
              <span className="p-4 flex flex-col gap-1">
                <p className="text-[#737373] text-xs">Estimated No. of Sales</p>
                <p className="text-xl md:text-2xl font-semibold">
                  {salesStats?.estimated_sales_per_month.currency}
                  {salesStats?.estimated_sales_per_month.amount} / month
                </p>
              </span>
              <span className="p-4 flex flex-col gap-1">
                <p className="text-[#737373] text-xs">Total No. of Sellers:</p>
                <p className="text-xl md:text-2xl font-semibold">
                  {salesStats?.number_of_sellers || 0} Sellers
                </p>
              </span>
            </div>
          </div>

          {/* Seller Analytics */}
          <div className="border border-border rounded-xl shadow-sm p-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <p className="text-[#0A0A0A] font-semibold text-base">
                Seller Analytics
              </p>

              {/* Date range picker */}
              <CustomDatePicker isRange />
            </div>

            {/* Net Revenue */}
            <div className="bg-[#FFF9D6] rounded-xl p-3 flex items-center gap-4 justify-between">
              <span className="flex flex-col gap-1">
                <p className="text-[#737373] text-xs">Net Revenue</p>
                <p className="text-base font-semibold">
                  {salesStats?.sales_analytics.net_revenue.currency}
                  {salesStats?.sales_analytics.net_revenue.amount}
                </p>
              </span>
              <p className="text-green-500 text-sm flex items-center gap-0.5">
                <BsArrowUp className="size-4" />
                {salesStats?.sales_analytics.net_revenue.percentage}%
              </p>
            </div>

            {/* Price and Monthly Units Sold */}
            <div className="border border-border rounded-lg grid grid-cols-2 divide-x">
              <span className="p-3 flex items-center gap-4 justify-between">
                <span className="flex flex-col gap-1">
                  <p className="text-[#737373] text-xs">Price</p>
                  <p className="text-base font-semibold">
                    {salesStats?.sales_analytics.price.currency}
                    {salesStats?.sales_analytics.price.amount}
                  </p>
                </span>
                <p className="text-green-500 text-sm flex items-center gap-0.5">
                  <BsArrowUp className="size-4" />
                  {salesStats?.sales_analytics.price.percentage}%
                </p>
              </span>
              <span className="p-3 flex items-center gap-4 justify-between">
                <span className="flex flex-col gap-1">
                  <p className="text-[#737373] text-xs">Monthly Units Sold</p>
                  <p className="text-base font-semibold">
                    {salesStats?.sales_analytics.monthly_units_sold.amount}
                  </p>
                </span>
                <p className="text-green-500 text-sm flex items-center gap-0.5">
                  <BsArrowUp className="size-4" />
                  {salesStats?.sales_analytics.monthly_units_sold.percentage}%
                </p>
              </span>
            </div>

            {/* Daily Units Sold and Monthly Revenue */}
            <div className="border border-border rounded-lg grid grid-cols-2 divide-x">
              <span className="p-3 flex items-center gap-4 justify-between">
                <span className="flex flex-col gap-1">
                  <p className="text-[#737373] text-xs">Daily Units Sold</p>
                  <p className="text-base font-semibold">
                    {salesStats?.sales_analytics.daily_units_sold.amount}
                  </p>
                </span>
                <p className="text-red-500 text-sm flex items-center gap-0.5">
                  <BsArrowDown className="size-4" />
                  {salesStats?.sales_analytics.daily_units_sold.percentage}%
                </p>
              </span>
              <span className="p-3 flex items-center gap-4 justify-between">
                <span className="flex flex-col gap-1">
                  <p className="text-[#737373] text-xs">Monthly Revenue</p>
                  <p className="text-base font-semibold">
                    {salesStats?.sales_analytics.monthly_revenue.currency}
                    {salesStats?.sales_analytics.monthly_revenue.amount}
                  </p>
                </span>
                <p className="text-green-500 text-sm flex items-center gap-0.5">
                  <BsArrowUp className="size-4" />
                  {salesStats?.sales_analytics.monthly_revenue.percentage}%
                </p>
              </span>
            </div>

            {/* Date First Available and Seller Type */}
            <div className="flex flex-col gap-2 text-base">
              <span className="flex items-center gap-5 justify-between">
                <p className="text-[#595959]">Date First Available</p>
                <p className="font-semibold">
                  {new Date(
                    salesStats?.date_first_available
                  ).toLocaleDateString()}
                </p>
              </span>
              <span className="flex items-center gap-5 justify-between">
                <p className="text-[#595959]">Seller Type</p>
                <p className="font-semibold">{salesStats?.seller_type}</p>
              </span>
            </div>
          </div>

          {/* Buy Box Timeline */}
          <div className="border border-gray-300 rounded-xl shadow-sm p-4 flex flex-col gap-3 bg-white">
            <p className="text-black font-semibold text-base">
              Buy Box Timeline (Last 5 Sellers)
            </p>

            <div className="flex flex-col gap-4">
              {buyboxTimeline.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <FaCheckCircle
                    className={`size-4 mt-1 ${
                      index === 0 ? "text-green-500" : "text-gray-400"
                    }`}
                  />

                  <div className="flex flex-col gap-1">
                    <p
                      className={`font-semibold text-sm ${
                        index === 0 ? "text-black" : "text-[#A3A3A3]"
                      }`}
                    >
                      {index === 0
                        ? "Latest Seller with the Buy Box"
                        : "Previous Seller with the Buy Box"}
                    </p>
                    <p className="text-[#A3A3A3] text-xs">
                      {item.seller} (
                      {new Date(item.timestamp).toLocaleDateString()})
                    </p>
                  </div>
                </div>
              ))}

              {buyboxTimeline.length === 0 && (
                <p className="text-gray-500">
                  No buybox timeline data available
                </p>
              )}
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default SalesStats;
