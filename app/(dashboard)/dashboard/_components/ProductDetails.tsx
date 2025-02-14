"use client";

import { SetStateAction, useState } from "react";
import { SearchInput } from "@/app/(dashboard)/_components";
import Image from "next/image";
import { InputNumber } from "antd";
import { CustomSlider as Slider } from "@/lib/AntdComponents";

import { RxArrowTopRight } from "react-icons/rx";
import ProductThumbnail from "@/public/assets/images/women-shoes.png";
import Illustration from "@/public/assets/svg/illustration.svg";
import {
  BSRIcon,
  PriceTagIcon,
  ProductSalesIcon,
  MaximumCostIcon,
  ROIIcon,
} from "./icons";
import { BsArrowUp } from "react-icons/bs";

import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const pieData = [
  { name: "The Beauty Center", value: 33, color: "#0000FF" },
  { name: "Devine Makeup", value: 33, color: "#FF0080" },
  { name: "T&D Supplies", value: 34, color: "#00E4E4" },
];

const lineData = [
  { date: "Jan 1", amazon: 6000, buyBox: 3500 },
  { date: "Jan 10", amazon: 6500, buyBox: 3400 },
  { date: "Jan 15", amazon: 7500, buyBox: 4200 },
  { date: "Jan 20", amazon: 6300, buyBox: 3800 },
  { date: "Feb 10", amazon: 6800, buyBox: 4900 },
  { date: "Feb 25", amazon: 7000, buyBox: 4200 },
];

const ProductDetails = () => {
  const [searchValue, setSearchValue] = useState("");

  const [fulfillmentType, setFulfillmentType] = useState("FBA");
  const [activeTab, setActiveTab] = useState("maximumCost");
  const [costPrice, setCostPrice] = useState(40000);
  const [salePrice, setSalePrice] = useState(40000);
  const [storageMonths, setStorageMonths] = useState(0);
  const [activeTab2, setActiveTab2] = useState("Price");

  const fees = {
    referralFee: 9.69,
    fulfillmentFBA: 10.59,
    closingFee: 0.0,
    storageFee: 2.03,
    prepFee: 0.0,
    inboundShipping: 0.0,
    digitalServicesFee: 0.29,
    miscFee: 0.0,
    miscFeePercent: 0.0,
  };

  const totalFees = Object.values(fees).reduce((a, b) => a + b, 0);
  const vatOnFees = 0.8;
  const discount = 0.0;
  const profitMargin = 0.59;
  const breakEvenPrice = 28.72;
  const estimatedPayout = 13.18;

  const offersData = {
    offers: [
      {
        id: 1,
        seller: "Madelyn Herwitz",
        stock: 20,
        price: "$400",
        buyboxShare: "40%",
        leader: true,
      },
      {
        id: 2,
        seller: "Erin Korsgaard",
        stock: 12,
        price: "$49,960",
        buyboxShare: "35%",
        leader: false,
      },
      {
        id: 3,
        seller: "Haylie George",
        stock: 123,
        price: "$39,467",
        buyboxShare: "93%",
        leader: false,
      },
    ],
    ranks: {
      netBBPriceChanges: 23,
      changePercent: "7.3%",
      buyBox: "$28.87",
      amazon: "$28.87",
      lowestFBA: "$28.82",
      lowestFBM: "-",
      keepaBSRDrops: 35,
      estimatedSales: "500+/mo",
      estTimeToSale: "Not enough data",
    },
  };

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      <SearchInput value={searchValue} onChange={setSearchValue} />

      <main className="flex flex-col gap-5">
        {/* WorkTools */}
        <div className="flex flex-wrap gap-2 md:gap-4 items-center">
          <p className="font-semibold">Your WorkTools</p>

          <button
            type="button"
            className="border border-border text-primary px-3 py-2 rounded-xl flex gap-1 items-center font-semibold hover:bg-gray-50 active:scale-95 duration-200 text-sm md:text-base"
          >
            Export Data on Google Sheets
            <RxArrowTopRight className="size-5" />
          </button>

          <button
            type="button"
            className="border border-border text-primary px-3 py-2 rounded-xl flex gap-1 items-center font-semibold hover:bg-gray-50 active:scale-95 duration-200 text-sm md:text-base"
          >
            Find Supplier
            <RxArrowTopRight className="size-5" />
          </button>

          <button
            type="button"
            className="border border-border text-primary px-3 py-2 rounded-xl flex gap-1 items-center font-semibold hover:bg-gray-50 active:scale-95 duration-200 text-sm md:text-base"
          >
            See this Product on Amazon
            <RxArrowTopRight className="size-5" />
          </button>

          <button
            type="button"
            className="border border-border text-primary px-3 py-2 rounded-xl flex gap-1 items-center font-semibold hover:bg-gray-50 active:scale-95 duration-200 text-sm md:text-base"
          >
            Export Competitor Data
            <RxArrowTopRight className="size-5" />
          </button>
        </div>

        {/* grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* left */}
          <div className="flex flex-col gap-5">
            <div className="border border-border px-4 pt-4 rounded-xl flex flex-col gap-4">
              {/* <div className="flex flex-col md:flex-row md:items-center gap-3"> */}
              <div className="grid md:grid-cols-[2fr_5fr] gap-3">
                <div className="size-[150px] overflow-hidden rounded-lg">
                  <Image
                    src={ProductThumbnail}
                    alt="thumbnail"
                    className="size-[150px] object-cover"
                    width={150}
                    height={150}
                  />
                </div>

                <div className="text-[#595959]">
                  <h2 className="text-[#252525] font-semibold text-lg md:text-xl">
                    TIOSEBON Women&apos;s Slip On Walking Shoes Lightweight
                    Sneakers Slip Resistant Athletic Shoes
                  </h2>
                  <p>Beauty & Personal Care</p>
                  <p>ASIN: B09TQLC5TK</p>
                  <p>⭐⭐⭐⭐⭐ 5/5</p>
                </div>
              </div>

              <div className="p-6 bg-[#F5F3FF] rounded-t-lg flex items-center gap-4 justify-between">
                <div className="flex flex-col gap-4">
                  <span className="flex flex-col gap-2">
                    <p className="text-lg md:text-xl">
                      This Product is eligible to sell
                    </p>
                    <p className="text-red-500 text-sm">There are 2 issues</p>
                  </span>

                  <div>
                    <button
                      type="button"
                      className="border border-border bg-white px-3 py-2 rounded-xl flex gap-1 items-center font-semibold active:scale-95 duration-200 text-sm md:text-base"
                    >
                      See all alerts
                      <RxArrowTopRight className="size-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <Image
                    src={Illustration}
                    alt="illustration"
                    className="w-[144px] object-cover"
                    width={144}
                    height={138}
                  />
                </div>
              </div>
            </div>

            {/* Profitablility Calculator */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="font-semibold">Profitability Calculator</h2>

                {/* Fulfillment Type Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 md:items-center justify-between p-3 rounded-xl bg-[#FAFAFA]">
                  <h2 className="font-semibold text-black">Fulfilment Type</h2>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFulfillmentType("FBA")}
                      className={`px-3 py-1 rounded-full text-black border border-transparent ${
                        fulfillmentType === "FBA"
                          ? "bg-[#E7EBFE]"
                          : "bg-transparent border-border"
                      }`}
                    >
                      FBA
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillmentType("FBM")}
                      className={`px-3 py-1 rounded-full text-black border border-transparent ${
                        fulfillmentType === "FBM"
                          ? "bg-[#E7EBFE]"
                          : "bg-transparent border-border"
                      }`}
                    >
                      FBM
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">Cost Price</label>
                  <InputNumber
                    value={costPrice}
                    onChange={(value) => setCostPrice(value || 0)}
                    className="px-4 py-1.5 w-full"
                    prefix="$"
                    min={0}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">Sale Price</label>
                  <InputNumber
                    value={salePrice}
                    onChange={(value) => setSalePrice(value || 0)}
                    className="px-4 py-1.5 w-full"
                    prefix="$"
                    min={0}
                  />
                </div>
              </div>

              {/* Storage Months Slider */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">
                  Storage (Months)
                </label>
                <Slider
                  value={storageMonths}
                  onChange={(value: SetStateAction<number>) =>
                    setStorageMonths(value)
                  }
                  max={12}
                  step={1}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0</span>
                  <span>12</span>
                </div>
              </div>

              {/* Fees Section with Tabs */}
              <div className="flex flex-col gap-2">
                <div className="bg-[#F7F7F7] rounded-[10px] p-1 flex items-center gap-2 w-max mx-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab("maximumCost")}
                    className={`text-sm font-medium p-1.5 rounded-md border ${
                      activeTab === "maximumCost"
                        ? "border-border bg-white"
                        : "border-transparent text-[#787891]"
                    }`}
                  >
                    Maximum Cost
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("totalFees")}
                    className={`text-sm font-medium p-1.5 rounded-md border ${
                      activeTab === "totalFees"
                        ? "border-border bg-white"
                        : "border-transparent text-[#787891]"
                    }`}
                  >
                    Total Fees
                  </button>
                </div>

                <div className="bg-[#F4F4F5] rounded-xl py-2">
                  {activeTab === "maximumCost" && (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        Maximum cost details here...
                      </div>
                    </div>
                  )}

                  {activeTab === "totalFees" && (
                    <div className="space-y-2">
                      {Object.entries(fees).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-[#595959]">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </span>
                          <span className="font-semibold text-black">
                            ${value.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-2 font-semibold flex justify-between">
                        <span>Total Fees</span>
                        <span>${totalFees.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Items */}
              <div className="flex flex-col gap-2 text-[#595959]">
                <div className="flex justify-between text-sm">
                  <span>VAT on Fees</span>
                  <span className="font-semibold text-black">
                    ${vatOnFees.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount</span>
                  <span className="font-semibold text-black">
                    ${discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Profit Margin</span>
                  <span className="font-semibold text-black">
                    {(profitMargin * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Breakeven Sale Price</span>
                  <span className="font-semibold text-black">
                    ${breakEvenPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estimated Amz. Payout</span>
                  <span className="font-semibold text-black">
                    ${estimatedPayout.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-border p-4 rounded-xl flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <span className="bg-[#F0FFF0] size-12 rounded-lg flex items-center justify-center">
                    <PriceTagIcon />
                  </span>
                  <span className="text-black text-sm">
                    <p>Buy Box Price</p>
                    <p className="text-xl font-semibold">$40,000</p>
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <span className="bg-[#F0F0FF] size-12 rounded-lg flex items-center justify-center">
                    <ProductSalesIcon />
                  </span>
                  <span className="text-black text-sm">
                    <p>Estimated Product sales</p>
                    <p className="text-xl font-semibold">800/month</p>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <span className="bg-[#FFF0FF] size-12 rounded-lg flex items-center justify-center">
                    <BSRIcon />
                  </span>
                  <span className="text-black text-sm">
                    <p>BSR</p>
                    <p className="text-xl font-semibold">300</p>
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <span className="bg-[#FFF0F3] size-12 rounded-lg flex items-center justify-center">
                    <MaximumCostIcon />
                  </span>
                  <span className="text-black text-sm">
                    <p>Maximum Cost</p>
                    <p className="text-xl font-semibold">$40,000</p>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <span className="bg-[#F5EBFF] size-12 rounded-lg flex items-center justify-center">
                    <ROIIcon />
                  </span>
                  <span className="text-black text-sm">
                    <p>ROI</p>
                    <p className="text-xl font-semibold">64.10%</p>
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <span className="bg-[#EBFFFE] size-12 rounded-lg flex items-center justify-center">
                    <PriceTagIcon />
                  </span>
                  <span className="text-black text-sm">
                    <p>Profit</p>
                    <p className="text-xl font-semibold">$4.61 (29%)</p>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* right */}
          <div className="flex flex-col gap-5">
            {/* Offers Section */}
            <div className="border border-border p-4 flex flex-col gap-2 rounded-xl">
              <div className="flex items-center space-x-2 font-semibold text-gray-700">
                <span className="text-lg">Offers</span>
              </div>
              <table className="w-full mt-2 border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">S/N</th>
                    <th className="p-2">Seller</th>
                    <th className="p-2">Stock</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Buybox Share</th>
                  </tr>
                </thead>
                <tbody>
                  {offersData.offers.map((offer) => (
                    <tr key={offer.id} className="border-b">
                      <td className="p-2">{offer.id}</td>
                      <td className="p-2">
                        <div>
                          {offer.seller}
                          {offer.leader && (
                            <span className="text-xs text-primary block">
                              BuyBox Leader
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">{offer.stock}</td>
                      <td className="p-2">{offer.price}</td>
                      <td className="p-2">
                        <div className="relative w-20 h-2 bg-gray-200 rounded-full">
                          <div
                            className="absolute top-0 left-0 h-2 bg-green-500 rounded-full"
                            style={{ width: offer.buyboxShare }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ranks & Prices Section */}
            <div className="border border-border p-4 flex flex-col gap-2 rounded-xl">
              <div className="text-lg font-semibold">Ranks & Prices</div>

              <div className="p-3 bg-[#F6FEFC] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-12 rounded-2xl bg-[#CEF8F5] text-[#08DCCF] flex items-center justify-center">
                    <BsArrowUp className="size-6" />
                  </span>
                  <span>
                    <p className="text-black font-semibold">
                      {offersData.ranks.netBBPriceChanges}
                    </p>
                    <p>Net BB Price Changes</p>
                  </span>
                </div>

                <div className="text-black text-xs bg-[#E7EBFE] rounded-full px-1 flex items-center gap-1">
                  <BsArrowUp className="text-primary size-3" />{" "}
                  {offersData.ranks.changePercent}
                </div>
              </div>

              <div className="mt-2 text-sm text-[#595959]">
                <div className="flex justify-between py-1">
                  <span>Buy Box</span>
                  <span className="font-semibold text-black">
                    {offersData.ranks.buyBox}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Amazon</span>
                  <span className="font-semibold text-black">
                    {offersData.ranks.amazon}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Lowest FBA</span>
                  <span className="font-semibold text-black">
                    {offersData.ranks.lowestFBA}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Lowest FBM</span>
                  <span className="font-semibold text-black">
                    {offersData.ranks.lowestFBM}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Keepa BSR Drops</span>
                  <span className="font-semibold text-black">
                    {offersData.ranks.keepaBSRDrops}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Estimated Sales</span>
                  <span className="font-semibold text-black">
                    {offersData.ranks.estimatedSales}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Est. Time to Sale</span>
                  <span className="font-semibold text-black">
                    {offersData.ranks.estTimeToSale}
                  </span>
                </div>
              </div>
            </div>

            {/*  */}

            {/* Buy Box Analysis */}
            <div className="p-6 border rounded-lg">
              <h2 className="text-lg font-semibold">Buy Box Analysis</h2>
              <div className="flex items-center gap-1 mt-4">
                {["Yearly", "Monthly", "Weekly", "Daily"].map((label) => (
                  <button
                    key={label}
                    className={`px-3 py-1 rounded-full text-black border border-transparent ${
                      label === "Monthly"
                        ? "bg-[#E7EBFE]"
                        : "bg-transparent border-border"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center mt-6">
                <ResponsiveContainer width={250} height={250}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" outerRadius={80}>
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <ul>
                  {pieData.map((entry, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      ></span>
                      {entry.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Market Analysis */}
            <div className="p-6 border rounded-lg">
              <h2 className="text-lg font-semibold">Market Analysis</h2>
              <div className="flex items-center gap-1 mt-4">
                {["Price", "Volume", "Reviews"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-3 py-1 rounded-full text-black border border-transparent ${
                      tab === activeTab2
                        ? "bg-[#E7EBFE]"
                        : "bg-transparent border-border"
                    }`}
                    onClick={() => setActiveTab2(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="amazon"
                      stroke="#FF0080"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="buyBox"
                      stroke="#00E4E4"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};

export default ProductDetails;
