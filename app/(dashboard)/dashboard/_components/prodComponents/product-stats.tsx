"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { InfoCard } from "../info-card"
import { BSRIcon, PriceTagIcon, ProductSalesIcon, MaximumCostIcon, ROIIcon } from "../icons"
import { Skeleton, Tooltip as AntTooltip } from "antd"
import type { Product } from "./types"
import { useState, forwardRef, useImperativeHandle } from "react"
import Image from "next/image"
import AmazonIcon from "@/public/assets/svg/amazon-icon.svg"

interface ProductStatsProps {
  product: Product | undefined
  isLoading?: boolean
  buyboxDetails?: any
}

type Tab = "info" | "totan"

const ProductStats = forwardRef(({ product, isLoading, buyboxDetails }: ProductStatsProps, ref) => {
  const [activeTab, setActiveTab] = useState<Tab>("info")
  const [latestProfitCalc, setLatestProfitCalc] = useState<any>(product?.last_profitability_calculation?.fba)

  // Get the data from the correct sources
  const extra = buyboxDetails?.extra || product?.extra
  const profitabilityCalc = latestProfitCalc || product?.last_profitability_calculation?.fba

  // Expose the update function to the parent component
  useImperativeHandle(ref, () => ({
    handleProfitabilityUpdate: (data: any) => {
      setLatestProfitCalc(data)
    },
  }))

  if (isLoading || !product) {
    return <ProductStatsSkeleton />
  }

  // Get ROI text color based on roiIsOk
  const getRoiTextColor = () => {
    if (profitabilityCalc?.buying_criteria?.roiIsOk === true) {
      return "text-green-600" // Green text for good ROI
    } else if (profitabilityCalc?.buying_criteria?.roiIsOk === false) {
      return "text-red-600" // Red text for bad ROI
    }
    return "" // Default text color
  }

  // Get Profit text color based on profitIsOk
  const getProfitTextColor = () => {
    if (profitabilityCalc?.buying_criteria?.profitIsOk === true) {
      return "text-green-600" // Green text for good profit
    } else if (profitabilityCalc?.buying_criteria?.profitIsOk === false) {
      return "text-red-600" // Red text for bad profit
    }
    return "" // Default text color
  }

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
        {/** 
        <button
          type="button"
          onClick={() => setActiveTab("totan")}
          className={`px-4 py-2 rounded-full ${
            activeTab === "totan" ? "bg-primary text-white" : "bg-[#F3F4F6] text-[#676A75]"
          }`}
        >
          Totan (AI)
        </button>
        */}
      </div>

      {/* Totan */}
      {/** */}
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
            <AntTooltip
              title="The recommended quantity to purchase based on market demand, competition, and inventory turnover rate."
              placement="top"
            >
              <span className="text-sm text-[#676A75] font-medium cursor-help border-b border-dotted border-gray-400">
                Suggested Purchase Quantity
              </span>
            </AntTooltip>
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
              title={
                <AntTooltip
                  title="The current price of the product in the Amazon Buy Box. This is typically the price most customers see when viewing the product."
                  placement="top"
                >
                  <span className="cursor-help border-b border-dotted border-gray-400">Buy Box Price</span>
                </AntTooltip>
              }
              value={`$ ${extra?.buybox_price ?? "0"}`}
              bgColor="#F0FFF0"
            />
            <InfoCard
              icon={<ProductSalesIcon />}
              title={
                <AntTooltip
                  title="The approximate number of units sold per month based on market analysis and sales rank data."
                  placement="top"
                >
                  <span className="cursor-help border-b border-dotted border-gray-400">Estimated Product Sales</span>
                </AntTooltip>
              }
              value={`${extra?.monthly_est_product_sales?.toLocaleString() ?? "0"}/month`}
              bgColor="#F0F0FF"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              icon={<BSRIcon />}
              title={
                <AntTooltip
                  title="Best Seller Rank (BSR) indicates how well a product is selling in its category. Lower numbers mean better sales performance."
                  placement="top"
                >
                  <span className="cursor-help border-b border-dotted border-gray-400">BSR</span>
                </AntTooltip>
              }
              value={extra?.bsr ?? "0"}
              bgColor="#FFF0FF"
            />
            <InfoCard
              icon={<MaximumCostIcon />}
              title={
                <AntTooltip
                  title="The highest price you should pay for this product to maintain your target profit margin and ROI."
                  placement="top"
                >
                  <span className="cursor-help border-b border-dotted border-gray-400">Maximum Cost</span>
                </AntTooltip>
              }
              value={`$ ${profitabilityCalc?.maxCost ?? "0"}`}
              bgColor="#FFF0F3"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              icon={<ROIIcon />}
              title={
                <AntTooltip
                  title="Return on Investment - The percentage return you'll earn on your initial investment in this product."
                  placement="top"
                >
                  <span className="cursor-help border-b border-dotted border-gray-400">ROI</span>
                </AntTooltip>
              }
              value={<span className={getRoiTextColor()}>{`${profitabilityCalc?.roi ?? "0"}%`}</span>}
              bgColor="#F5EBFF"
            />

            <InfoCard
              icon={<PriceTagIcon />}
              title={
                <AntTooltip
                  title="The total profit amount in dollars and profit margin percentage you can expect from selling this product."
                  placement="top"
                >
                  <span className="cursor-help border-b border-dotted border-gray-400">Profit</span>
                </AntTooltip>
              }
              value={
                <span className={getProfitTextColor()}>
                  {`$ ${profitabilityCalc?.profitAmount ?? "0"} (${profitabilityCalc?.profitMargin?.toFixed(0) ?? "0"}%)`}
                </span>
              }
              bgColor="#EBFFFE"
            />
          </div>
        </div>
      )}
    </div>
  )
})

ProductStats.displayName = "ProductStats";

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
