"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { InfoCard } from "../info-card"
import { BSRIcon, PriceTagIcon, ProductSalesIcon, MaximumCostIcon, ROIIcon } from "../icons"
import { Skeleton, Tooltip as AntTooltip, message } from "antd"
import type { Product } from "./types"
import { useState, forwardRef, useImperativeHandle, useEffect } from "react"
import Image from "next/image"
import AmazonIcon from "@/public/assets/svg/amazon-icon.svg"
import { useAnalyzeMutation, useLazyPurchaseQuantityQuery } from "@/redux/api/totanAi"
import { useAppDispatch } from "@/redux/hooks"
import { 
  createNewSession, 
  updateCollectedData, 
  updateConversationState,
  addMessage,
  updateAnalysisData,
  updateSessionId
} from "@/redux/slice/chatSlice"
import Link from "next/link"

interface ProductStatsProps {
  product: Product | undefined
  isLoading?: boolean
  buyboxDetails?: any
  asin: string
  marketplaceId: number
  onNavigateToTotan?: () => void // Callback to handle navigation
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
  aggressive_quantity: number
}

const ProductStats = forwardRef(({ 
  product, 
  isLoading, 
  buyboxDetails, 
  asin, 
  marketplaceId, 
  onNavigateToTotan 
}: ProductStatsProps, ref) => {
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState<Tab>("info")
  const [latestProfitCalc, setLatestProfitCalc] = useState<any>(product?.last_profitability_calculation?.fba)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [purchaseQuantityData, setPurchaseQuantityData] = useState<PurchaseQuantityData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoadingQuantity, setIsLoadingQuantity] = useState(false)
  const [messageApi, contextHolder] = message.useMessage();

  // RTK Query hooks
  const [analyzeMutation] = useAnalyzeMutation()
  const [getPurchaseQuantity] = useLazyPurchaseQuantityQuery()

  // Get the data from the correct sources
  const extra = buyboxDetails?.extra || product?.extra
  const profitabilityCalc = latestProfitCalc || product?.last_profitability_calculation?.fba

  // Reset states when ASIN changes
  useEffect(() => {
    
    setAnalysisData(null)
    setPurchaseQuantityData(null)
  }, [asin])

  // Reset states when product changes
  useEffect(() => {
    setLatestProfitCalc(product?.last_profitability_calculation?.fba)
  }, [product])

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
   
    
    if (!asin || !marketplaceId) {
      messageApi.warning('Missing asin or marketplaceId, skipping analysis')
      return
    }

    // Use updated profit data if provided, otherwise use existing profitability calc
    const currentProfitData = updatedProfitData || profitabilityCalc
    
    const costPrice = currentProfitData?.costPrice
    const fulfillmentType = currentProfitData?.fulfillmentType || "FBA"
    
    if (!costPrice) {
      messageApi.warning('No cost price available, skipping analysis')
      return
    }

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
        messageApi.success('Analysis completed successfully!')
      }
    } catch (error) {
      console.error("Analysis error:", error)
      messageApi.error('Failed to analyze product. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Fetch purchase quantity
  const fetchPurchaseQuantity = async () => {
   
    
    if (!asin) {
      messageApi.warning('No ASIN provided, skipping purchase quantity fetch')
      return
    }

    if (isLoadingQuantity) {
      messageApi.warning('Already loading purchase quantity, skipping')
      return
    }

    setIsLoadingQuantity(true)
    try {
      
      const response = await getPurchaseQuantity(asin).unwrap()
      
      
      if (response.success) {
        setPurchaseQuantityData(response.data)
        messageApi.success('Purchase quantity data loaded successfully!')
      } else {
        messageApi.error('Purchase quantity  unsuccessful response:', response)
      }
    } catch (error) {
      messageApi.error(`Purchase quantity error`)
    } finally {
      setIsLoadingQuantity(false)
    }
  }

  // Manual reload function for both analysis and purchase quantity
  const handleReload = async () => {
    if (!profitabilityCalc?.costPrice || !asin || !marketplaceId) {
      messageApi.warning('Missing required data for reload. Please ensure profitability calculation is completed.')
      return
    }

    messageApi.info('Refreshing analysis and purchase quantity data...')
    
    // Clear existing data first
    setAnalysisData(null)
    setPurchaseQuantityData(null)
    
    // Trigger both operations
    await Promise.all([
      performAnalysis(),
      fetchPurchaseQuantity()
    ])
  }

  // Trigger analysis and purchase quantity fetch when switching to totan tab
  useEffect(() => {
   

    if (activeTab === "totan" && asin && marketplaceId) {
      // Trigger analysis if profitability calculation exists
      if (profitabilityCalc?.costPrice) {
       
        performAnalysis()
      }
      
      // Always fetch purchase quantity when switching to totan tab (if not already loading)
     
      fetchPurchaseQuantity()
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
    <>
      {contextHolder}
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
          disabled
          onClick={() => setActiveTab("totan")}
          className={`px-4 py-2 rounded-full ${
            activeTab === "totan" ? "bg-primary text-white" : "bg-[#F3F4F6] text-[#676A75]"
          }`}
        >
          Totan (AI)
        </button>
      </div>

    

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
    </>
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