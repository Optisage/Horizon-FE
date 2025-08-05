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

  // Handle navigation to Totan with prefilled data
  const handleNavigateToTotanWithData = async () => {
    if (!profitabilityCalc?.costPrice || !asin || !marketplaceId) {
     messageApi.warning('Missing required data for navigation')
      return
    }

    try {
      // Create new session in Redux
      dispatch(createNewSession({ firstName: undefined }))
      
      // Update collected data with current profitability calculation
      dispatch(updateCollectedData({
        asin: asin,
        costPrice: Number(profitabilityCalc.costPrice),
        isAmazonFulfilled: profitabilityCalc.fulfillmentType === "FBA"
      }))

      // Add user messages to simulate the conversation flow
      dispatch(addMessage({ 
        sender: "user", 
        text: asin 
      }))
      dispatch(addMessage({ 
        sender: "user", 
        text: profitabilityCalc.costPrice.toString() 
      }))
      dispatch(addMessage({ 
        sender: "user", 
        text: profitabilityCalc.fulfillmentType === "FBA" ? "yes" : "no"
      }))

      // Set conversation state to analyzing
      dispatch(updateConversationState("analyzing"))

      // Add analyzing message
      dispatch(addMessage({
        sender: "ai",
        text: "🔄 Now analyzing your product... This may take a moment."
      }))

      // Perform the analysis
      const result = await analyzeMutation({
        asin: asin,
        costPrice: Number(profitabilityCalc.costPrice),
        marketplaceId: marketplaceId,
        isAmazonFulfilled: profitabilityCalc.fulfillmentType === "FBA"
      }).unwrap()

      if (result.success) {
        const analysis = result.data
        dispatch(updateAnalysisData(analysis))
        dispatch(updateSessionId(analysis.session_id))
        dispatch(updateConversationState("chat_ready"))

        // Add analysis result message
        const analysisMessage = `🎉 **Analysis Complete!**

📊 **Overall Score**: ${analysis.score} (${analysis.category})
💰 **ROI**: ${analysis.roi}%
📈 **Profit Margin**: ${analysis.profit_margin}%
📦 **Monthly Sales**: ${analysis.monthly_sales.toLocaleString()} units

**Detailed Breakdown:**
• Amazon on Listing: ${analysis.breakdown.amazon_on_listing}
• FBA Sellers: ${analysis.breakdown.fba_sellers}
• Buy Box Eligible: ${analysis.breakdown.buy_box_eligible}
• Variation Listing: ${analysis.breakdown.variation_listing}
• Sales Rank Impact: ${analysis.breakdown.sales_rank_impact}
• Estimated Demand: ${analysis.breakdown.estimated_demand}
• Offer Count: ${analysis.breakdown.offer_count}
• Profitability: ${analysis.breakdown.profitability}

Now you can ask me any questions about this product! 💬`

        dispatch(addMessage({
          sender: "ai",
          text: analysisMessage,
          type: "analysis"
        }))

        // Try to get purchase quantity as well
        try {
          const quantityResult = await getPurchaseQuantity(asin).unwrap()
          const quantityData = quantityResult.data
          const quantityMessage = `📦 **Purchase Quantity Recommendations:**
• **Conservative Approach**: ${Math.round(quantityData.conservative_quantity)} units
• **Aggressive Approach**: ${Math.round(quantityData.aggressive_quantity)} units`
          
          dispatch(addMessage({
            sender: "ai",
            text: quantityMessage,
            type: "analysis"
          }))
        } catch (error) {
          console.error("Failed to get purchase quantity:", error)
        }

        // Navigate to Totan component
        if (onNavigateToTotan) {
          onNavigateToTotan()
        }
      }
    } catch (error) {
      console.error("Failed to perform analysis for navigation:", error)
      // Handle error - could add error message to chat
      dispatch(addMessage({
        sender: "ai",
        text: "❌ Sorry, I couldn't analyze this product. Please try again.",
        type: "error"
      }))
      
      if (onNavigateToTotan) {
        onNavigateToTotan()
      }
    }
  }

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
          {/* Header with reload button */}
         

          {!profitabilityCalc?.costPrice ? (
            // Show nudge message when no profitability calculation exists
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className=" rounded-lg p-6 max-w-md">
                <div className="text-primary mb-3">
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
                <div className="bg-primary/20 border border-primary rounded-md p-3">
                  <p className="text-xs text-black">
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
                  <Link
                    href={`/totan`}>
                  <div 
                    className="bg-[#F3F4F6] rounded-lg p-3 text-[#676A75] text-sm hover:bg-primary hover:text-white cursor-pointer transition-colors duration-200"
                    onClick={handleNavigateToTotanWithData}
                    title="Click to open detailed analysis in Totan chat"
                  >
                    <p className="font-semibold">Analysis</p>
                    <p>
                      {analysisData ? 
                        `Average Return On...` :
                        "Calculating metrics..."
                      }
                    </p>
                    
                  </div>
                  </Link>

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
                <span className="text-sm text-[#676A75] font-medium">
                  Suggested Purchase Quantity
                </span>
                
                <div className="flex items-center gap-2">
                  <AntTooltip
                    title="Conservative recommended quantity based on low-risk market analysis and steady demand patterns."
                    placement="top"
                  >
                    <div className="border border-input rounded-md px-3 py-1 text-sm cursor-help">
                      {isLoadingQuantity ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        `C: ${purchaseQuantityData?.conservative_quantity || "0"}`
                      )}
                    </div>
                  </AntTooltip>

                  <AntTooltip
                    title="Aggressive recommended quantity based on optimistic market projections and higher risk tolerance."
                    placement="top"
                  >
                    <div className="border border-input rounded-md px-3 py-1 text-sm cursor-help">
                      {isLoadingQuantity ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : (
                        `A: ${purchaseQuantityData?.aggressive_quantity || "0"}`
                      )}
                    </div>
                  </AntTooltip>
                </div>
                 <div className="flex items-center justify-between mb-2">
          
            {profitabilityCalc?.costPrice && (
              <AntTooltip
                title="Refresh analysis and purchase quantity data"
                placement="top"
              >
                <button
                  onClick={handleReload}
                  disabled={isAnalyzing || isLoadingQuantity}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isAnalyzing || isLoadingQuantity
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 hover:bg-primary hover:text-white text-gray-600"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 ${isAnalyzing || isLoadingQuantity ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </AntTooltip>
            )}
          </div>
              </div>
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