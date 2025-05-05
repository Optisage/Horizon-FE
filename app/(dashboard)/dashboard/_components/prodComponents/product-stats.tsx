"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { InfoCard } from "../info-card"
import { BSRIcon, PriceTagIcon, ProductSalesIcon, MaximumCostIcon, ROIIcon } from "../icons"
import { Skeleton } from "antd"
import type { Product } from "./types"
import { useState } from "react"
import Image from "next/image"
import AmazonIcon from "@/public/assets/svg/amazon-icon.svg"

interface ProductStatsProps {
  product: Product | undefined
  isLoading?: boolean
  buyboxDetails?: any
}

type Tab = "info" | "totan"

const ProductStats = ({ product, isLoading, buyboxDetails }: ProductStatsProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("info")

  if (isLoading || !product) {
    return <ProductStatsSkeleton />
  }

  

  // Get the data from the correct sources
  const extra = buyboxDetails?.extra || product?.extra;
  const profitabilityCalc = product?.last_profitability_calculation?.fba

  return (
    <div className="flex flex-col gap-4">
      {/* tabs */}
      <div className="flex gap-4 items-center text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2 rounded-full ${
            activeTab === "info" ? "bg-primary text-white" : "bg-[#F3F4F6] text-[#676A75]"
          }`}
        >
          Product info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("totan")}
          className={`px-4 py-2 rounded-full ${
            activeTab === "totan" ? "bg-primary text-white" : "bg-[#F3F4F6] text-[#676A75]"
          }`}
        >
          Totan (AI)
        </button>
      </div>

      {/* Totan */}
      {activeTab === "totan" && (
        <div className="border border-border rounded-xl shadow-sm p-4 flex flex-col gap-3">
          {/* Score and Info Row */}
          <div className="flex items-center justify-between">
            {/* Circular Score */}
            <div className="relative size-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
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

                <span className="text-lg font-semibold text-[#060606]">5.19</span>
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
                  <Image src={AmazonIcon || "/placeholder.svg"} alt="Amazon icon" width={32} height={32} />
                </span>

                <span className="bg-[#F3F4F6] rounded-lg p-3 text-[#676A75] text-xs">Amazon Owns the buybox</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#676A75] font-medium">Suggested Purchase Quantity</span>
            <p className="border border-input rounded-md px-4 py-1 text-sm">5</p>
          </div>
        </div>
      )}

      {/* extra stats grid */}
      {activeTab === "info" && (
        <div className="border border-border p-4 rounded-xl flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              icon={<PriceTagIcon />}
              title="Buy Box Price"
              value={`$ ${extra?.buybox_price ?? "0"}`}
              bgColor="#F0FFF0"
            />
            <InfoCard
              icon={<ProductSalesIcon />}
              title="Estimated Product Sales"
              value={`${extra?.monthly_est_product_sales?.toLocaleString() ?? "0"}/month`}
              bgColor="#F0F0FF"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoCard icon={<BSRIcon />} title="BSR" value={extra?.bsr ?? "0"} bgColor="#FFF0FF" />
            <InfoCard
              icon={<MaximumCostIcon />}
              title="Maximum Cost"
              value={`$ ${profitabilityCalc?.maxCost ?? "0"}`}
              bgColor="#FFF0F3"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoCard icon={<ROIIcon />} title="ROI" value={`${profitabilityCalc?.roi ?? "0"}%`} bgColor="#F5EBFF" />
            <InfoCard
              icon={<PriceTagIcon />}
              title="Profit"
              value={`$ ${profitabilityCalc?.profitAmount ?? "0"} (${profitabilityCalc?.profitMargin?.toFixed(0) ?? "0"}%)`}
              bgColor="#EBFFFE"
            />
          </div>
        </div>
      )}
    </div>
  )
}

const ProductStatsSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <Skeleton.Button active size="small" style={{ width: 100, height: 36 }} />
        <Skeleton.Button active size="small" style={{ width: 100, height: 36 }} />
      </div>

      <div className="border border-border p-4 rounded-xl flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton.Button active size="large" block style={{ height: 80 }} />
          <Skeleton.Button active size="large" block style={{ height: 80 }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton.Button active size="large" block style={{ height: 80 }} />
          <Skeleton.Button active size="large" block style={{ height: 80 }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton.Button active size="large" block style={{ height: 80 }} />
          <Skeleton.Button active size="large" block style={{ height: 80 }} />
        </div>
      </div>
    </div>
  )
}

export default ProductStats
