"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { InfoCard } from "../info-card"
import { BSRIcon, PriceTagIcon, ProductSalesIcon, MaximumCostIcon, ROIIcon } from "../icons"
import { Skeleton, Tooltip as AntTooltip } from "antd"
import type { Product } from "./types"
import { useState, forwardRef, useImperativeHandle, useEffect } from "react"
import Image from "next/image"
import AmazonIcon from "@/public/assets/svg/amazon-icon.svg"
import { useAnalyzeMutation, useLazyPurchaseQuantityQuery } from "@/redux/api/totanAi"

interface ProductStatsProps {
  product: Product | undefined
  isLoading?: boolean
  buyboxDetails?: any
  asin: string
  marketplaceId: number
}

type Tab = "info" | "totan"

interface AnalysisData {
  session_id: string
  score: number
  category: string
  breakdown: {
    amazon_on_listing: number
    fba_sellers: number
    buy_box_eligible: number
    variation_listing: number
    sales_rank_impact: number
    estimated_demand: number
    offer_count: number
    profitability: number
  }
  roi: number
  profit_margin: number
  monthly_sales: number
}

interface PurchaseQuantityData {
  conservative_quantity: number
  moderate_quantity: number
  aggressive_quantity: number
}

const ProductStats = forwardRef(({ product, isLoading, buyboxDetails, asin, marketplaceId }: ProductStatsProps, ref) => {
  const [activeTab, setActiveTab] = useState<Tab>("info")
  const [latestProfitCalc, setLatestProfitCalc] = useState<any>(product?.last_profitability_calculation?.fba)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [purchaseQuantityData, setPurchaseQuantityData] = useState<PurchaseQuantityData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoadingQuantity, setIsLoadingQuantity] = useState(false)

  // RTK Query hooks
  const [analyzeMutation] = useAnalyzeMutation()
  const [getPurchaseQuantity] = useLazyPurchaseQuantityQuery()

  // Get the data from the correct sources
  const extra = buyboxDetails?.extra || product?.extra
  const profitabilityCalc = latestProfitCalc || product?.last_profitability_calculation?.fba

  // Expose the update function to the parent component
  useImperativeHandle(ref, () => ({
    handleProfitabilityUpdate: (data: any) => {
      setLatestProfitCalc(data)
      // Trigger analysis when profitability is updated with the new data
      if (data && activeTab === "totan") {
        performAnalysis(data)
      }
    },
  }))

  // Perform analysis
  const performAnalysis = async (updatedProfitData?: any) => {
    if (!asin || !marketplaceId) return

    // Use updated profit data if provided, otherwise use existing profitability calc
    const currentProfitData = updatedProfitData || profitabilityCalc
    
    const costPrice = currentProfitData?.costPrice
    const fulfillmentType = currentProfitData?.fulfillmentType || "FBA"
    
    if (!costPrice) return

    setIsAnalyzing(true)
    try {
      const payload = {
        asin,
        costPrice: Number(costPrice),
        marketplaceId,
        isAmazonFulfilled: fulfillmentType === "FBA"
      }

      const response = await analyzeMutation(payload).unwrap()
      if (response.success) {
        setAnalysisData(response.data)
      }
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Fetch purchase quantity
  const fetchPurchaseQuantity = async () => {
    if (!asin) return

    setIsLoadingQuantity(true)
    try {
      const response = await getPurchaseQuantity(asin).unwrap()
      if (response.success) {
        setPurchaseQuantityData(response.data)
      }
    } catch (error) {
      console.error("Purchase quantity error:", error)
    } finally {
      setIsLoadingQuantity(false)
    }
  }

  // Trigger analysis and purchase quantity fetch when switching to totan tab
  useEffect(() => {
    if (activeTab === "totan" && profitabilityCalc?.costPrice) {
      // Only trigger analysis if profitability calculation exists
      performAnalysis()
      
      // Fetch purchase quantity if not already loaded
      if (!purchaseQuantityData) {
        fetchPurchaseQuantity()
      }
    }
  }, [activeTab, asin, marketplaceId])

  // Re-run analysis when profitability calculation changes and totan tab is active
  useEffect(() => {
    if (activeTab === "totan" && latestProfitCalc?.costPrice) {
      performAnalysis(latestProfitCalc)
    }
  }, [latestProfitCalc, activeTab])

  // Get score circle properties
  const getScoreProperties = (score: number, category: string) => {
    const normalizedScore = Math.max(0, Math.min(10, score)) // Ensure score is between 0-10
    const percentage = (normalizedScore / 10) * 100
    const strokeDasharray = `${percentage}, 100`
    
    let color = "#10B981" // Default green
    let bgColor = "#F0FDF4"
    
    if (category.toLowerCase() === "low") {
      color = "#EF4444" // Red
      bgColor = "#FEF2F2"
    } else if (category.toLowerCase() === "medium" || category.toLowerCase() === "average") {
      color = "#F59E0B" // Yellow/Orange
      bgColor = "#FFFBEB"
    } else if (category.toLowerCase() === "high" || category.toLowerCase() === "above average") {
      color = "#10B981" // Green
      bgColor = "#F0FDF4"
    }

    return { strokeDasharray, color, bgColor }
  }

  if (isLoading || !product) {
    return <ProductStatsSkeleton />
  }

  // Get ROI text color based on roiIsOk
  const getRoiTextColor = () => {
    if (profitabilityCalc?.buying_criteria?.roiIsOk === true) {
      return "text-green-600"
    } else if (profitabilityCalc?.buying_criteria?.roiIsOk === false) {
      return "text-red-600"
    }
    return ""
  }

  // Get Profit text color based on profitIsOk
  const getProfitTextColor = () => {
    if (profitabilityCalc?.buying_criteria?.profitIsOk === true) {
      return "text-green-600"
    } else if (profitabilityCalc?.buying_criteria?.profitIsOk === false) {
      return "text-red-600"
    }
    return ""
  }

  // Get ROI tooltip message based on criteria
  const getRoiTooltipMessage = () => {
    const roi = profitabilityCalc?.roi ?? 0
    const minRoi = profitabilityCalc?.minRoi ?? 0
    
    if (profitabilityCalc?.buying_criteria?.roiIsOk === true) {
      return `✅ Excellent ROI! This product's ${roi}% return exceeds your minimum requirement of ${minRoi}%, making it a profitable investment that meets your buying criteria.`
    } else if (profitabilityCalc?.buying_criteria?.roiIsOk === false) {
      return `❌ ROI Below Target: This product's ${roi}% return is below your minimum requirement of ${minRoi}%. Consider finding a lower cost price or look for other products that meet your ROI criteria.`
    }
    return "Return on Investment - The percentage return you'll earn on your initial investment in this product."
  }

  // Get Profit tooltip message based on criteria
  const getProfitTooltipMessage = () => {
    const profitAmount = profitabilityCalc?.profitAmount ?? 0
    const profitMargin = profitabilityCalc?.profitMargin ?? 0
    const minProfit = profitabilityCalc?.minProfit ?? 0
    
    if (profitabilityCalc?.buying_criteria?.profitIsOk === true) {
      return `✅ Great Profit! This product generates $${profitAmount.toFixed(2)} (${profitMargin.toFixed(0)}%) which exceeds your minimum profit requirement of $${minProfit.toFixed(2)}, making it a solid choice for your business.`
    } else if (profitabilityCalc?.buying_criteria?.profitIsOk === false) {
      return `❌ Profit Below Target: This product's profit of $${profitAmount.toFixed(2)} (${profitMargin.toFixed(0)}%) is below your minimum requirement of $${minProfit.toFixed(2)}. Consider negotiating a better cost price or look for higher-margin products.`
    }
    return "The total profit amount in dollars and profit margin percentage you can expect from selling this product."
  }

  // Get Maximum Cost tooltip message based on criteria
  const getMaxCostTooltipMessage = () => {
    const maxCost = profitabilityCalc?.maxCost ?? 0
    const minRoi = profitabilityCalc?.minRoi ?? 0
    const minProfit = profitabilityCalc?.minProfit ?? 0
    
    if (maxCost > 0) {
      return `💡 Smart Buying Guide: Based on your criteria (${minRoi}% min ROI, $${minProfit.toFixed(2)} min profit), don't pay more than $${maxCost.toFixed(2)} for this product. This ensures you'll meet your profit targets while maintaining your desired return on investment.`
    }
    return "The highest price you should pay for this product to maintain your target profit margin and ROI."
  }

  const scoreProperties = analysisData ? getScoreProperties(analysisData.score, analysisData.category) : null

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
          {!profitabilityCalc?.costPrice ? (
            // Show nudge message when no profitability calculation exists
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md">
                <div className="text-blue-600 mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 14h.01M12 11h.01M12 7V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M5 7h14l-1 14H6L5 7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Profitability Calculation Required
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  To access Totan AI analysis, please complete the profitability calculation first. 
                  Enter your cost price and other details in the calculator above.
                </p>
                <div className="bg-blue-100 border border-blue-300 rounded-md p-3">
                  <p className="text-xs text-blue-800">
                    💡 The AI analysis uses your profitability data to provide personalized insights and recommendations.
                  </p>
                </div>
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-gray-600">Analyzing product...</span>
            </div>
          ) : (
            <>
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
                      className="transition-all duration-1000 ease-out"
                      stroke={scoreProperties?.color || "#6366F1"}
                      strokeWidth="3"
                      strokeDasharray={scoreProperties?.strokeDasharray || "0, 100"}
                      fill="none"
                      d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
                    <span className="text-[10px] text-[#676A75] font-medium uppercase text-center">
                      <p>{analysisData?.category.toUpperCase() || "ANALYZING"}</p>
                    </span>
                    <span className="text-lg font-semibold text-[#060606]">
                      {analysisData?.score?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                </div>

                {/* Analysis Box */}
                <div className="flex flex-col gap-2">
                  <div className="bg-[#F3F4F6] rounded-lg p-3 text-[#676A75] text-sm">
                    <p className="font-semibold">Analysis</p>
                    <p>
                      {analysisData ? 
                        `ROI: ${analysisData.roi.toFixed(1)}% | Margin: ${analysisData.profit_margin.toFixed(1)}%` :
                        "Calculating metrics..."
                      }
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-1 text-sm text-muted-foreground">
                    <span className="bg-[#F3F4F6] rounded-lg p-2">
                      <Image src={AmazonIcon || "/placeholder.svg"} alt="Amazon icon" width={32} height={32} />
                    </span>
                    <span className="bg-[#F3F4F6] rounded-lg p-3 text-[#676A75] text-xs">
                      {analysisData?.breakdown?.amazon_on_listing && analysisData.breakdown.amazon_on_listing > 0 ? 
                        "Amazon on listing" : 
                        "Amazon not on listing"
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <AntTooltip
                  title="The conservative recommended quantity to purchase based on market demand, competition, and inventory turnover rate."
                  placement="top"
                >
                  <span className="text-sm text-[#676A75] font-medium cursor-help border-b border-dotted border-gray-400">
                    Suggested Purchase Quantity
                  </span>
                </AntTooltip>
                <p className="border border-input rounded-md px-4 py-1 text-sm">
                  {isLoadingQuantity ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    purchaseQuantityData?.conservative_quantity || "0"
                  )}
                </p>
                {!isLoadingQuantity && purchaseQuantityData && (
                  <AntTooltip
                    title={`Conservative: ${purchaseQuantityData.conservative_quantity} | Moderate: ${purchaseQuantityData.moderate_quantity} | Aggressive: ${purchaseQuantityData.aggressive_quantity}`}
                    placement="top"
                  >
                    <span className="text-xs text-gray-400 cursor-help">ℹ️</span>
                  </AntTooltip>
                )}
              </div>

              {/* Analysis Breakdown */}
              {analysisData?.breakdown && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Score Breakdown</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amazon on Listing:</span>
                      <span className={analysisData.breakdown.amazon_on_listing > 0 ? "text-green-600" : "text-red-600"}>
                        {analysisData.breakdown.amazon_on_listing}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">FBA Sellers:</span>
                      <span className={analysisData.breakdown.fba_sellers > 0 ? "text-green-600" : "text-red-600"}>
                        {analysisData.breakdown.fba_sellers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Buy Box Eligible:</span>
                      <span className={analysisData.breakdown.buy_box_eligible > 0 ? "text-green-600" : "text-red-600"}>
                        {analysisData.breakdown.buy_box_eligible}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Demand:</span>
                      <span className={analysisData.breakdown.estimated_demand > 0 ? "text-green-600" : "text-red-600"}>
                        {analysisData.breakdown.estimated_demand}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profitability:</span>
                      <span className={analysisData.breakdown.profitability > 0 ? "text-green-600" : "text-red-600"}>
                        {analysisData.breakdown.profitability}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Offer Count:</span>
                      <span className={analysisData.breakdown.offer_count > 0 ? "text-green-600" : "text-red-600"}>
                        {analysisData.breakdown.offer_count}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
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
                  title={getMaxCostTooltipMessage()}
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
                  title={getRoiTooltipMessage()}
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
                  title={getProfitTooltipMessage()}
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