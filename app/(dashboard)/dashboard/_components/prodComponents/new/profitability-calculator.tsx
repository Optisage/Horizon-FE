"use client";

import { JSX, useState } from "react";

type TabKey = "maximumCost" | "totalFees";

const tabLabels: Record<TabKey, string> = {
  maximumCost: "Maximum Cost",
  totalFees: "Total Fees",
};

const tabContent: Record<TabKey, JSX.Element> = {
  maximumCost: (
    <div className="px-2 text-[#8C94A3] text-sm font-medium">
      <p>&quot;Maximum Cost&quot;.</p>
    </div>
  ),

  totalFees: (
    <div className="px-2 flex flex-col gap-3">
      <div className="flex gap-4 items-center justify-between text-[#8C94A3] text-sm font-medium">
        <p>VAT on Fees</p>
        <span className="flex items-center gap-2">
          <span className="w-[33px] h-2.5 rounded-3xl bg-gradient-to-r from-[#C4B5FD] to-[#7A5FE0]" />
          <p className="text-[#596375]">$0.80</p>
        </span>
      </div>
      <div className="flex gap-4 items-center justify-between text-[#8C94A3] text-sm font-medium">
        <p>Discount</p>
        <span className="flex items-center gap-2">
          <span className="w-[45px] h-2.5 rounded-3xl bg-gradient-to-r from-[#FF8551] to-[#E94F0E]" />
          <p className="text-[#596375]">$0.00</p>
        </span>
      </div>
      <div className="flex gap-4 items-center justify-between text-[#8C94A3] text-sm font-medium">
        <p>Profit Margin</p>
        <span className="flex items-center gap-2">
          <span className="w-[68px] h-2.5 rounded-3xl bg-gradient-to-r from-[#18CB96] to-[#0D8D67]" />
          <p className="text-[#596375]">0.59%</p>
        </span>
      </div>
      <div className="flex gap-4 items-center justify-between text-[#8C94A3] text-sm font-medium">
        <p>Breakeven Sale Price</p>
        <span className="flex items-center gap-2">
          <span className="w-[45px] h-2.5 rounded-3xl bg-gradient-to-r from-[#1499FF] to-[#0C5C99]" />
          <p className="text-[#596375]">$28.72</p>
        </span>
      </div>
      <div className="flex gap-4 items-center justify-between text-[#8C94A3] text-sm font-medium">
        <p className="underline">Estimated Amz. Payout</p>
        <span className="flex items-center gap-2">
          <span className="w-16 h-2.5 rounded-3xl bg-gradient-to-r from-[#6AD8DE] to-[#397578]" />
          <p className="text-[#596375]">$13.18</p>
        </span>
      </div>
    </div>
  ),
};

const ProfitabilityCalculator = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("totalFees");

  return (
    <div className="rounded-xl bg-white">
      <div className="p-4 lg:p-5">
        <span className="bg-[#F3F4F6] px-3 py-1.5 rounded-3xl text-[#676A75] font-semibold text-sm w-max">
          Profitability Calculator
        </span>
      </div>

      <div className="p-4 lg:p-5 border-y border-[#E7EBEE] text-sm flex items-center gap-5 justify-between">
        <p className="font-semibold">Fulfilment Type</p>

        <span className="flex items-center gap-2">
          <button
            type="button"
            className="bg-[#FF8551] rounded-3xl border border-transparent px-3  py-1 text-white text-xs font-semibold"
          >
            FBA
          </button>
          <button
            type="button"
            className="bg-transparent rounded-3xl border border-[#D2D2D2] px-3  py-1 text-[#B0B0B1] text-xs font-semibold"
          >
            FBM
          </button>
        </span>
      </div>

      <div className="p-4 lg:p-5">
        <div className="text-[#676A75] text-sm flex flex-col gap-4">
          <span className="flex gap-4 items-center justify-between">
            <label htmlFor="cost_price">Cost Price</label>
            <input
              id="cost_price"
              type="text"
              defaultValue={"$40,000"}
              className="text-[#596375] text-sm font-normal border border-border focus:border-primary rounded-[10px] px-3 py-2 outline-none transition-colors"
            />
          </span>
          <span className="flex gap-4 items-center justify-between">
            <label htmlFor="sales_price">Sales Price</label>
            <input
              id="sales_price"
              type="text"
              defaultValue={"$40,000"}
              className="text-[#596375] text-sm font-normal border border-border focus:border-primary rounded-[10px] px-3 py-2 outline-none transition-colors"
            />
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-6">
          <div className="bg-[#F3F4F6] rounded-3xl p-1.5 grid grid-cols-2 gap-2">
            {Object.entries(tabLabels).map(([key, label]) => {
              const isActive = key === activeTab;

              const baseClasses =
                "text-sm font-semibold px-4 py-2 rounded-3xl transition-colors";
              const activeClasses =
                "bg-white shadow-md shadow-[#00000008] text-[#333333]";
              const inactiveClasses = "bg-transparent text-[#676A75]";

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key as TabKey)}
                  className={`${baseClasses} ${
                    isActive ? activeClasses : inactiveClasses
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {tabContent[activeTab]}
        </div>
      </div>

      <div className="p-4 lg:p-5 border-y border-[#E7EBEE] text-sm">
        <span className="flex gap-4 items-center justify-between">
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            type="text"
            defaultValue={"1"}
            className="text-[#596375] max-w-[77px] text-sm font-normal border border-border focus:border-primary rounded-[10px] px-3 py-2 outline-none transition-colors"
          />
        </span>
      </div>
    </div>
  );
};

export default ProfitabilityCalculator;

