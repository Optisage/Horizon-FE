"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from "react"
import type React from "react"

import { message, Skeleton, Tooltip as AntTooltip } from "antd"
import { debounce } from "lodash"
import { evaluate } from "mathjs"
import { CustomSlider as Slider } from "@/lib/AntdComponents"
import { useCalculateProfitablilityMutation, useGetBuyboxDetailsQuery } from "@/redux/api/productsApi"
import { useAppSelector } from "@/redux/hooks"
import type { BuyboxItem, Product, ProfitabilityData } from "./types"

interface ProfitabilityCalculatorProps {
  asin: string
  marketplaceId: number
  product: Product | undefined
  isLoading?: boolean
  onCalculationComplete?: (data: ProfitabilityData) => void
   offers: BuyboxItem[];
}

interface FeesState {
  referralFee: number
  fulfillmentType: string
  fullfillmentFee: number
  closingFee: number
  storageFee: number
  prepFee: number
  shippingFee: number
  digitalServicesFee: number
  miscFee: number
}

interface ResponseData {
  fba: ProfitabilityData | null
  fbm: ProfitabilityData | null
}

interface CalculationBody {
  asin: string
  marketplaceId: string
  isAmazonFulfilled: boolean
  currencyCode: string
  storage: number
  costPrice: string
  salePrice: number | string
  pointsNumber: number
  pointsAmount: number
   
}

const ProfitabilityCalculator = ({
  asin,
  marketplaceId,
  product,
  isLoading,
  onCalculationComplete,
    offers
}: ProfitabilityCalculatorProps) => {
  const [costPrice, setCostPrice] = useState<string>("")
  const [costPriceInput, setCostPriceInput] = useState<string>("")
  const [salePrice, setSalePrice] = useState<string>("")
  const [storageMonths, setStorageMonths] = useState(0)
  const [fulfillmentType, setFulfillmentType] = useState("FBA")
  const [activeTab, setActiveTab] = useState("maximumCost")
  const [isCalculating, setIsCalculating] = useState(false)
  const [isValidExpression, setIsValidExpression] = useState(true)

  const { currencyCode } = useAppSelector((state) => state.global) || { currencyCode: "USD" }
  const [calculateProfitability] = useCalculateProfitablilityMutation()

  const { data: buyboxDetailsData, isLoading: isLoadingBuyboxDetails } = useGetBuyboxDetailsQuery({
    marketplaceId,
    itemAsin: asin,
  })

  const buyboxDetails = (buyboxDetailsData?.data?.buybox as BuyboxItem[]) ?? []
  const buyboxWinnerPrice = buyboxDetails.find((offer) => offer.is_buybox_winner)?.listing_price ?? 0

  const lastProfitabilityCalc = product?.last_profitability_calculation
  const lastCostPrice = lastProfitabilityCalc?.fba?.costPrice

  const [fees, setFees] = useState<FeesState>({
    referralFee: lastProfitabilityCalc?.fba?.referralFee || 0,
    fulfillmentType: lastProfitabilityCalc?.fba?.fulfillmentType || "FBA",
    fullfillmentFee: lastProfitabilityCalc?.fba?.fullfillmentFee || 0,
    closingFee: lastProfitabilityCalc?.fba?.closingFee || 0,
    storageFee: lastProfitabilityCalc?.fba?.storageFee || 0,
    prepFee: Number(lastProfitabilityCalc?.fba?.prepFee || 0),
    shippingFee: Number(lastProfitabilityCalc?.fba?.shippingFee || 0),
    digitalServicesFee: Number(lastProfitabilityCalc?.fba?.digitalServicesFee || 0),
    miscFee: Number(lastProfitabilityCalc?.fba?.miscFee || 0),
  })

  const [totalFees, setTotalFees] = useState(lastProfitabilityCalc?.fba?.totalFees || 0)
  const [minROI, setMinROI] = useState(lastProfitabilityCalc?.fba?.minRoi || 0)
  const [ROI, setROI] = useState(lastProfitabilityCalc?.fba?.roi || 0)
  const [minProfit, setMinProfit] = useState(lastProfitabilityCalc?.fba?.minProfit || 0)
  const [profitAmount, setProfitAmount] = useState(lastProfitabilityCalc?.fba?.profitAmount || 0)
  const [maxCost, setMaxCost] = useState(lastProfitabilityCalc?.fba?.maxCost || 0)
  const [vatOnFees, setVatOnFees] = useState(lastProfitabilityCalc?.fba?.vatOnFees || 0)
  const [discount, setDiscount] = useState(lastProfitabilityCalc?.fba?.discount || 0)
  const [profitMargin, setProfitMargin] = useState(lastProfitabilityCalc?.fba?.profitMargin || 0)
  const [breakEvenPrice, setBreakEvenPrice] = useState(lastProfitabilityCalc?.fba?.breakevenSalePrice || 0)
  const [estimatedPayout, setEstimatedPayout] = useState(lastProfitabilityCalc?.fba?.estimatedAmzPayout || 0)

  const [responseData, setResponseData] = useState<ResponseData>({
    fba: lastProfitabilityCalc?.fba || null,
    fbm: lastProfitabilityCalc?.fbm || null,
  })

    // Calculate cheapest price from offers
  const cheapestPrice = offers.length > 0 
    ? Math.min(...offers.map(offer => offer.listing_price)) 
    : 0;

  useEffect(() => {
    if (lastCostPrice) {
      setCostPrice(lastCostPrice)
      setCostPriceInput(lastCostPrice)
    }
  }, [lastCostPrice])

 useEffect(() => {
    // Use buybox winner price if available, otherwise use cheapest offer price
    const initialSalePrice = buyboxWinnerPrice > 0 ? buyboxWinnerPrice : cheapestPrice;
    setSalePrice(initialSalePrice.toString());
  }, [buyboxWinnerPrice, cheapestPrice]);

  useEffect(() => {
    if (lastProfitabilityCalc) {
      const data = fulfillmentType === "FBA" ? lastProfitabilityCalc.fba : lastProfitabilityCalc.fbm
      if (data) {
        updateUIWithData(data)
      }
    }
  }, [fulfillmentType, lastProfitabilityCalc])

  const updateUIWithData = (data: ProfitabilityData) => {
    if (!data) return

    setFees({
      referralFee: data.referralFee,
      fulfillmentType: data.fulfillmentType,
      fullfillmentFee: data.fullfillmentFee,
      closingFee: data.closingFee,
      storageFee: data.storageFee,
      prepFee: Number(data.prepFee),
      shippingFee: Number(data.shippingFee),
      digitalServicesFee: data.digitalServicesFee,
      miscFee: Number(data.miscFee),
    })
    setROI(data.roi)
    setMinROI(data.minRoi)
    setMinProfit(data.minProfit)
    setProfitAmount(data.profitAmount)
    setMaxCost(data.maxCost)
    setTotalFees(data.totalFees)
    setVatOnFees(data.vatOnFees)
    setDiscount(data.discount)
    setProfitMargin(data.profitMargin)
    setBreakEvenPrice(data.breakevenSalePrice)
    setEstimatedPayout(data.estimatedAmzPayout)
  }

  const evaluateExpression = (expression: string): { isValid: boolean; result: string } => {
    try {
      const result = evaluate(expression)
      return { isValid: true, result: result.toString() }
    } catch (error) {
      console.error("Invalid mathematical expression", error)
      return { isValid: false, result: expression }
    }
  }

  const handleCalculateProfitability = useCallback(async () => {
    if (!costPrice || !buyboxDetails) return

    if (isNaN(Number(costPrice))) {
      message.error("Please enter a valid number for Cost Price")
      return
    }

    setIsCalculating(true)
    try {
      const body: CalculationBody = {
        asin: asin,
        marketplaceId: `${marketplaceId}`,
        isAmazonFulfilled: fulfillmentType === "FBA",
        currencyCode: currencyCode,
        storage: storageMonths,
        costPrice: costPrice,
        salePrice: salePrice ? Number(salePrice) : buyboxWinnerPrice,
        pointsNumber: 0,
        pointsAmount: 0,
      }

      const response = await calculateProfitability({ body }).unwrap()
      if (response.status === 200) {
        setResponseData({
          fba: response.data.fba,
          fbm: response.data.fbm,
        })
        const data = fulfillmentType === "FBA" ? response.data.fba : response.data.fbm
        updateUIWithData(data)

        if (onCalculationComplete && data) {
          onCalculationComplete(data)
        }
      }
    } catch (error:any) {
      console.error("Calculation error:", error)
      message.error(error?.data?.message as string)
    } finally {
      setIsCalculating(false)
    }
  }, [
    costPrice,
    salePrice,
    storageMonths,
    fulfillmentType,
    asin,
    marketplaceId,
    currencyCode,
    buyboxWinnerPrice,
    calculateProfitability,
    buyboxDetails,
    onCalculationComplete,
  ])

  const debouncedCalculation = useCallback(
    debounce(() => handleCalculateProfitability(), 500),
    [handleCalculateProfitability],
  )

  useEffect(() => {
    if (costPrice && !isNaN(Number(costPrice))) {
      debouncedCalculation()
    }
    return () => debouncedCalculation.cancel()
  }, [costPrice, salePrice, storageMonths, fulfillmentType, debouncedCalculation])

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalePrice(e.target.value)
  }

  const formatValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return "N/A"
    if (typeof value === "number") return `$${value.toFixed(2)}`
    return value
  }

  const StrikethroughIfNull = ({ value, children }: { value: any; children: React.ReactNode }) => {
    if (value === null) {
      return <span style={{ textDecoration: "line-through" }}>{children}</span>
    }
    return <>{children}</>
  }

  const Loader = () => (
    <div className="flex justify-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  if (isLoading || isLoadingBuyboxDetails) {
    return <ProfitabilityCalculatorSkeleton />
  }

  const handleCostPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setCostPriceInput(inputValue)

    const { isValid, result } = evaluateExpression(inputValue)
    setIsValidExpression(isValid)

    if (isValid) {
      setCostPrice(result)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const { isValid, result } = evaluateExpression(costPriceInput)
      if (isValid) {
        setCostPriceInput(result)
        setCostPrice(result)
        setIsValidExpression(true)
      } else {
        setIsValidExpression(false)
        message.error("Invalid mathematical expression")
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-lg">Profitability Calculator</h2>

      <div className="flex flex-col sm:flex-row gap-4 md:items-center justify-between p-3 rounded-xl bg-[#FAFAFA]">
        <h2 className="font-semibold text-black">Fulfilment Type</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFulfillmentType("FBA")}
            className={`px-3 py-1 rounded-full text-black border ${
              fulfillmentType === "FBA" ? "bg-[#E7EBFE]" : "bg-transparent border-border"
            }`}
          >
            FBA
          </button>
          <button
            type="button"
            onClick={() => setFulfillmentType("FBM")}
            className={`px-3 py-1 rounded-full text-black border ${
              fulfillmentType === "FBM" ? "bg-[#E7EBFE]" : "bg-transparent border-border"
            }`}
          >
            FBM
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">Cost Price</label>
          <input
            aria-label="Cost Price"
            type="text"
            placeholder={`${lastCostPrice || "0"} (e.g., 10+5*2)`}
            value={costPriceInput}
            onChange={handleCostPriceChange}
            onBlur={() => {
              const { isValid, result } = evaluateExpression(costPriceInput)
              if (isValid) {
                setCostPriceInput(result)
                setCostPrice(result)
                setIsValidExpression(true)
              } else {
                setIsValidExpression(false)
                message.error("Invalid mathematical expression")
              }
            }}
            onKeyDown={handleKeyDown}
            className={`px-4 py-1.5 w-full border rounded outline-none ${
              isValidExpression ? "focus:border-black" : "border-red-500 focus:border-red-500"
            }`}
          />
          {!isValidExpression && (
            <p className="text-xs text-red-500 mt-1">Please enter a valid mathematical expression</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">Sale Price</label>
          <input
            aria-label="Sale Price"
            type="number"
            value={salePrice}
            onChange={handlePriceChange}
            className="px-4 py-1.5 w-full border rounded outline-none focus:border-black"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Storage (Months)</label>
        <Slider value={storageMonths} onChange={(value: number) => setStorageMonths(value)} max={12} step={1} />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0</span>
          <span>12</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="bg-[#F7F7F7] rounded-[10px] p-1 flex items-center gap-2 w-max mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab("maximumCost")}
            className={`text-sm font-medium p-1.5 rounded-md border ${
              activeTab === "maximumCost" ? "border-border bg-white" : "border-transparent text-[#787891]"
            }`}
          >
            Maximum Cost
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("totalFees")}
            className={`text-sm font-medium p-1.5 rounded-md border ${
              activeTab === "totalFees" ? "border-border bg-white" : "border-transparent text-[#787891]"
            }`}
          >
            Total Fees
          </button>
        </div>
      </div>

      {isCalculating ? (
        <div className="gap-4 grid grid-cols-2">
          <Skeleton.Input active size="large" block style={{ height: 25 }} />
          <Skeleton.Input active size="large" block style={{ height: 25 }} />
          <Skeleton.Input active size="large" block style={{ height: 25 }} />
          <Skeleton.Input active size="large" block style={{ height: 25 }} />
          <Skeleton.Input active size="large" block style={{ height: 25 }} />
          <Skeleton.Input active size="large" block style={{ height: 25 }} />
          <Skeleton.Input active size="large" block style={{ height: 25 }} />
          <Skeleton.Input active size="large" block style={{ height: 25 }} />
        </div>
      ) : (
        <div className="bg-[#F4F4F5] rounded-xl p-2">
          {activeTab === "maximumCost" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <StrikethroughIfNull value={minROI}>
                  <AntTooltip
                    title="Minimum Return on Investment - The lowest acceptable percentage return on your investment for this product to be considered profitable."
                    placement="top"
                  >
                    <span className="text-[#595959]">Min. ROI</span>
                  </AntTooltip>
                </StrikethroughIfNull>
                <StrikethroughIfNull value={minROI}>
                  <span className="font-semibold text-black">{minROI || 0}%</span>
                </StrikethroughIfNull>
              </div>
              <div className="flex justify-between text-sm">
                <StrikethroughIfNull value={minProfit}>
                  <AntTooltip
                    title="Minimum Profit - The smallest dollar amount of profit you should accept when selling this product."
                    placement="top"
                  >
                    <span className="text-[#595959]">Min. Profit</span>
                  </AntTooltip>
                </StrikethroughIfNull>
                <StrikethroughIfNull value={minProfit}>
                  <span className="font-semibold text-black">${minProfit.toFixed(2)}</span>
                </StrikethroughIfNull>
              </div>
              <div className="border-t pt-2 font-semibold flex justify-between">
                <AntTooltip
                  title="The highest price you should pay for this product to maintain your target profit margin and ROI."
                  placement="top"
                >
                  <span>Maximum Cost</span>
                </AntTooltip>
                <span>${maxCost.toFixed(2)}</span>
              </div>
            </div>
          )}

          {activeTab === "totalFees" && (
            <div className="space-y-2">
              {Object.entries(fees).map(([key, value]) => {
                const feeTooltips: Record<string, string> = {
                  referralFee:
                    "Amazon's commission for selling your product on their platform, usually a percentage of the sale price.",
                  fulfillmentType:
                    "The method used to fulfill orders (FBA: Fulfilled by Amazon, FBM: Fulfilled by Merchant).",
                  fullfillmentFee:
                    "Fee charged by Amazon for picking, packing, and shipping your product (FBA only).",
                  closingFee: "Fixed fee applied to certain product categories.",
                  storageFee: "Fee charged for storing your product in Amazon's warehouses.",
                  prepFee: "Fee for any product preparation services provided by Amazon.",
                  shippingFee: "Cost to ship the product to the customer (primarily for FBM).",
                  digitalServicesFee: "Fee related to digital services or content.",
                  miscFee: "Any additional or miscellaneous fees not covered by other categories.",
                }

                const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())

                return (
                  <div key={key} className="flex justify-between text-sm">
                    <StrikethroughIfNull value={value}>
                      {feeTooltips[key] ? (
                        <AntTooltip title={feeTooltips[key]} placement="top">
                          <span className="text-[#595959] cursor-help border-b border-dotted border-gray-400">
                            {formattedKey}
                          </span>
                        </AntTooltip>
                      ) : (
                        <span className="text-[#595959]">{formattedKey}</span>
                      )}
                    </StrikethroughIfNull>
                    <StrikethroughIfNull value={value}>
                      <span className="font-semibold text-black">{formatValue(value)}</span>
                    </StrikethroughIfNull>
                  </div>
                )
              })}

              <div className="border-t pt-2 font-semibold flex justify-between">
                <AntTooltip
                  title="The sum of all Amazon fees and expenses associated with selling this product."
                  placement="top"
                >
                  <span>Total Fees</span>
                </AntTooltip>
                <span>${totalFees.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 text-[#595959]">
        <div className="flex justify-between text-sm">
          <StrikethroughIfNull value={vatOnFees}>
            <AntTooltip
              title="Tax charged on the sale of your product that you need to collect and remit to tax authorities."
              placement="top"
            >
              <span>Sales Tax</span>
            </AntTooltip>
          </StrikethroughIfNull>
          <StrikethroughIfNull value={vatOnFees}>
            <span className="font-semibold text-black">{formatValue(vatOnFees)}</span>
          </StrikethroughIfNull>
        </div>
        <div className="flex justify-between text-sm">
          <StrikethroughIfNull value={discount}>
            <AntTooltip
              title="Any price reduction applied to the product, which reduces your overall revenue."
              placement="top"
            >
              <span>Discount</span>
            </AntTooltip>
          </StrikethroughIfNull>
          <StrikethroughIfNull value={discount}>
            <span className="font-semibold text-black">{formatValue(discount)}</span>
          </StrikethroughIfNull>
        </div>
        <div className="flex justify-between text-sm">
          <StrikethroughIfNull value={profitMargin}>
            <AntTooltip
              title="The percentage of profit relative to the sale price after all costs have been deducted."
              placement="top"
            >
              <span>Profit Margin</span>
            </AntTooltip>
          </StrikethroughIfNull>
          <StrikethroughIfNull value={profitMargin}>
            <span className="font-semibold text-black">{profitMargin.toFixed(2)}%</span>
          </StrikethroughIfNull>
        </div>
        <div className="flex justify-between text-sm">
          <StrikethroughIfNull value={breakEvenPrice}>
            <AntTooltip
              title="The minimum price you need to sell the product for to cover all costs without making or losing money."
              placement="top"
            >
              <span>Breakeven Sale Price</span>
            </AntTooltip>
          </StrikethroughIfNull>
          <StrikethroughIfNull value={breakEvenPrice}>
            <span className="font-semibold text-black">${breakEvenPrice.toFixed(2)}</span>
          </StrikethroughIfNull>
        </div>
        <div className="flex justify-between text-sm">
          <StrikethroughIfNull value={estimatedPayout}>
            <AntTooltip
              title="The approximate amount Amazon will pay you after deducting all fees and commissions."
              placement="top"
            >
              <span>Estimated Amz. Payout</span>
            </AntTooltip>
          </StrikethroughIfNull>
          <StrikethroughIfNull value={estimatedPayout}>
            <span className="font-semibold text-black">${estimatedPayout.toFixed(2)}</span>
          </StrikethroughIfNull>
        </div>
      </div>
    </div>
  )
}

const ProfitabilityCalculatorSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-lg">Profitability Calculator</h2>
      <Skeleton.Button active size="large" block style={{ height: 50 }} />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton.Input active size="large" block />
        <Skeleton.Input active size="large" block />
      </div>
      <Skeleton.Input active size="large" block />
      <Skeleton.Button active size="large" block style={{ height: 40 }} />
      <Skeleton active paragraph={{ rows: 6 }} />
    </div>
  )
}

export default ProfitabilityCalculator