import { BiChevronRight } from "react-icons/bi";
import { NotificationIcon } from "./icons";
import Image from "next/image";
import { Tooltip as AntTooltip } from "antd";
import { useState } from "react";
import AmazonIcon from "@/public/assets/svg/amazon-icon.svg"

type Tab = "info" | "totan";

const QuickInfo = () => {
  const [activeTab, setActiveTab] = useState<Tab>("info");

  return (
    <div className="rounded-xl bg-white h-full">
      <div className="border-b border-[#E7EBEE] py-4 px-3 lg:p-5 flex items-center gap-1.5">
        <span
          onClick={() => setActiveTab("info")}
          className={`${
            activeTab === "info"
              ? "bg-primary text-white"
              : "bg-[#F3F4F6] text-[#676A75]"
          } cursor-pointer px-2 py-1.5 rounded-3xl  font-semibold text-sm w-max`}
        >
          Quick Info
        </span>
        <span className="bg-[#F3F4F6] px-2 py-1.5 rounded-3xl text-[#676A75] font-semibold text-sm w-max">
          Sales Analytics
        </span>
        <span
          onClick={() => setActiveTab("totan")}
          className={`${
            activeTab === "totan"
              ? "bg-primary text-white"
              : "bg-[#F3F4F6] text-[#676A75]"
          } cursor-pointer  px-2 py-1.5 rounded-3xl  font-semibold text-sm w-max`}
        >
          Totan (AI)
        </span>
      </div>

      <div className="p-2 lg:p-2">
        {/**
        <div className="grid grid-cols-[4fr_2fr] gap-4">
          <div className="border border-[#FFE6C2] text-[#4A4A4A] rounded-[10px] text-xs flex flex-col">
            <span className="px-4 py-3 rounded-t-[10px]">
              Eligible For Sale
            </span>
            <button className="px-4 py-3 rounded-b-[10px] bg-[#FFC56E1F] text-[#FFA216] font-semibold flex items-center justify-between gap-4">
              <p>Check Alerts Panel</p>
              <BiChevronRight size={20} />
            </button>
          </div>
          <div className="border border-[#E0E4EE] text-[#4A4A4A] rounded-[10px] text-xs flex flex-col">
            <span className="p-3 rounded-t-[10px]">Alerts</span>
            <span className="p-3 rounded-b-[10px] bg-[#18CB9612] text-[#009F6D] font-semibold flex items-center justify-between gap-4">
              <p>6</p>
              <NotificationIcon />
            </span>
          </div>
        </div>
         */}

        {activeTab === "info" && (
          <div>
            <div className="mt-5 border border-[#E0E4EE] text-[#8E949F] rounded-[10px] text-xs flex divide-x divide-[#E0E4EE]">
              <div className="flex-1 flex flex-col gap-0.5 p-4">
                <span className="flex items-center gap-1">
                  BSR
                  <span className="bg-[#FF8551] w-[12.5px] h-2 rounded-full" />
                </span>
                <p className="text-[#596375] font-bold text-base">3k (1%)</p>
              </div>
              <div className="flex-1 flex flex-col gap-0.5 p-4 bg-[#FAFBFB]">
                <span className="flex items-center gap-1">
                  Est. Sales
                  <span className="bg-[#3895F9] w-[12.5px] h-2 rounded-full" />
                </span>
                <p className="text-[#596375] font-bold text-base">
                  500+/<span className="text-[#939EB2]">mo</span>
                </p>
              </div>
              <div className="flex-1 flex flex-col gap-0.5 p-4">
                <span className="flex items-center gap-1">
                  Max Cost
                  <span className="bg-primary w-[12.5px] h-2 rounded-full" />
                </span>
                <p className="text-[#596375] font-bold text-base">C$ 36.50</p>
              </div>
            </div>

            <div className="mt-5 text-[#676A75] font-medium text-xs grid grid-cols-2 gap-4">
              <span className="flex flex-col gap-2">
                <label htmlFor="cost_price">Cost Price</label>
                <input
                  id="cost_price"
                  type="text"
                  defaultValue={"$40,000"}
                  className="text-[#596375] text-sm font-normal border border-border focus:border-primary rounded-[10px] px-3 py-2 outline-none transition-colors"
                />
              </span>
              <span className="flex flex-col gap-2">
                <label htmlFor="sales_price">Sales Price</label>
                <input
                  id="sales_price"
                  type="text"
                  defaultValue={"$40,000"}
                  className="text-[#596375] text-sm font-normal border border-border focus:border-primary rounded-[10px] px-3 py-2 outline-none transition-colors"
                />
              </span>
            </div>

            <div className="mt-5 bg-[#FAFBFB] border border-[#E0E4EE] text-[#8E949F] rounded-[10px] text-xs flex divide-x divide-[#E0E4EE]">
              <div className="flex-1 flex flex-col gap-0.5 p-4">
                <span className="flex items-center gap-1">
                  Profit
                  <span className="bg-primary w-[12.5px] h-2 rounded-full" />
                </span>
                <p className="text-[#596375] font-bold text-base">C$ 9.13</p>
              </div>
              <div className="flex-1 flex flex-col gap-0.5 p-4">
                <span className="flex items-center gap-1">
                  Profit (%)
                  <span className="bg-[#3895F9] w-[12.5px] h-2 rounded-full" />
                </span>
                <p className="text-[#596375] font-bold text-base">14.85%</p>
              </div>
              <div className="flex-1 flex flex-col gap-0.5 p-4">
                <span className="flex items-center gap-1">
                  ROI
                  <span className="bg-[#FF8551] w-[12.5px] h-2 rounded-full" />
                </span>
                <p className="text-[#596375] font-bold text-base">25.01%</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "totan" && (
          <div className=" flex flex-col gap-3">
            {/* Score and Info Row */}
            <div className="flex items-center justify-between">
              {/* Circular Score */}
              <div className="relative size-32">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-[#F3F4F6]"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="80, 100"
                    fill="none"
                    d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
                  <span className="text-[10px] text-[#676A75] font-medium uppercase text-center">
                    <p>ABOVE</p>
                    <p>AVERAGE</p>
                  </span>

                  <span className="text-lg font-semibold text-[#060606]">
                    5.19
                  </span>
                </div>
              </div>

              {/* Analysis Box */}
              <div className="flex flex-col gap-2">
                <div className="bg-muted rounded-md px-3 py-1 text-sm font-medium text-muted-foreground">
                  <div className="bg-[#F3F4F6] rounded-lg p-3 text-[#676A75] text-sm">
                    <p className="font-semibold">Analysis</p>
                    <p>Average Return on…</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-1 text-sm text-muted-foreground">
                  <span className="bg-[#F3F4F6] rounded-lg p-2">
                    <Image
                      src={ AmazonIcon || "/placeholder.svg"}
                      alt="Amazon icon"
                      width={32}
                      height={32}
                    />
                  </span>

                  <span className="bg-[#F3F4F6] rounded-lg p-3 text-[#676A75] text-xs">
                    Amazon Owns the buybox
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <AntTooltip
                title="The recommended quantity to purchase based on market demand, competition, and inventory turnover rate."
                placement="top"
              >
                <span className="text-sm text-[#676A75] font-medium cursor-help border-b border-dotted border-gray-400">
                  Suggested Purchase Quantity
                </span>
              </AntTooltip>
              <p className="border border-input rounded-md px-4 py-1 text-sm">
                5
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickInfo;
