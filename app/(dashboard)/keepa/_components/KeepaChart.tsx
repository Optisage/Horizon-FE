"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useCallback, useEffect } from "react"
import { LoadingOutlined } from "@ant-design/icons"
import {
  useLazyPriceHistoryQuery,
  useLazyProductSummaryQuery,
  useLazyRatingReviewQuery,
  useLazySalesRankQuery,
} from "@/redux/api/keepa"
import { useAppSelector } from "@/redux/hooks"

interface Product {
  title: string
  asin: string
  category: string
  currentPrice: number
  salesRank: number
}

interface KeepaChartProps {
  product: Product
  isLoading: boolean
  asin:string
}

interface ChartDataPoint {
  date: string
  dateFormatted: string
  fullDate: string
  amazon: number | null
  buybox: number | null
  new: number | null
  rating: number | null
  rating_count: number | null
  new_offer_count: number | null
  // Add index signature to allow dynamic keys
  [key: string]: number | null | string
}


export default function KeepaChart({ product, isLoading, asin }: KeepaChartProps) {
  const { marketplaceId } = useAppSelector((state) => state?.global)

  function formatUnits(value: string | number): string {
  const num = typeof value === 'number' ? value : parseFloat(value)
  return isNaN(num) ? String(value) : `${Math.round(num).toLocaleString()} units`
}
function formatDecimal(value: string | number, decimals: number = 1): string {
  const num = typeof value === 'number' ? value : parseFloat(value)
  return isNaN(num) ? String(value) : num.toFixed(decimals)
}

  // API queries
  const [getPriceHistory, { data: priceData, isLoading: priceLoading }] = useLazyPriceHistoryQuery()
  const [getProductSummary, { data: summaryData, isLoading: summaryLoading }] = useLazyProductSummaryQuery()
  const [getRatingReview, { data: ratingData, /**isLoading: ratingLoading*/ }] = useLazyRatingReviewQuery()
  const [getSalesRank, { data: salesRankData, /**isLoading: salesRankLoading*/ }] = useLazySalesRankQuery()

  // Loading states for time range changes
  const [isTimeRangeChanging, setIsTimeRangeChanging] = useState(false)

  // Individual chart metric states - using actual available price types
  const [priceMetrics, setPriceMetrics] = useState({
    amazon: true,
    buybox: true,
    new: true,
  })

  // Initialize salesRankMetrics as an empty object, will be populated dynamically
  const [salesRankMetrics, setSalesRankMetrics] = useState<Record<string, boolean>>({})

  const [ratingMetrics, setRatingMetrics] = useState({
    rating: true,
    rating_count: true,
    new_offer_count: true,
  })

  // Universal time range and individual close-up states
  const [universalTimeRange, setUniversalTimeRange] = useState("90d")
  const [priceCloseUpView, setPriceCloseUpView] = useState(false)
  const [salesRankCloseUpView, setSalesRankCloseUpView] = useState(false)
  const [ratingCloseUpView, setRatingCloseUpView] = useState(false)

  const [hoverTime, setHoverTime] = useState<string | null>(null)

  // Fetch data when asin or time range changes
  useEffect(() => {
    if (asin && marketplaceId) {
      setIsTimeRangeChanging(true)

      const getRatingPeriod = (range: string): string => {
        switch (range) {
          case "7d":
            return "week"
          case "30d":
            return "month"
          case "90d":
            return "3months"
          case "1y":
          case "all":
            return "all"
          default:
            return "3months"
        }
      }
      const ratingPeriod = getRatingPeriod(universalTimeRange)

      Promise.all([
        getPriceHistory({ asin, id: marketplaceId, period: universalTimeRange }),
        getProductSummary({ asin, id: marketplaceId }),
        getRatingReview({ asin, id: marketplaceId, period: ratingPeriod }),
        getSalesRank({ asin, id: marketplaceId, period: universalTimeRange }),
      ]).finally(() => {
        setIsTimeRangeChanging(false)
      })
    }
  }, [asin, marketplaceId, universalTimeRange, getPriceHistory, getProductSummary, getRatingReview, getSalesRank])

  // Dynamically initialize salesRankMetrics when salesRankData is available
  useEffect(() => {
    if (salesRankData?.data?.sales_rank?.sales_rank_data) {
      const initialMetrics: Record<string, boolean> = {}
      Object.keys(salesRankData.data.sales_rank.sales_rank_data).forEach((key) => {
        initialMetrics[key] = true // Set all available sales rank types to true by default
      })
      // Ensure monthly_sold is included if it exists
      if (salesRankData.data.sales_rank.sales_rank_data.monthly_sold) {
        initialMetrics.monthly_sold = true
      }
      setSalesRankMetrics(initialMetrics)
    }
  }, [salesRankData])

  // Process chart data from API responses with proper data structure
  const chartData:ChartDataPoint[] = useMemo(() => {
    if (!priceData?.data?.price_history) return []

    const priceHistory = priceData.data.price_history.price_types
    const salesRankHistory = salesRankData?.data?.sales_rank?.sales_rank_data || {}
    const ratingHistory = ratingData?.data?.chart_data || {}

    // Get all unique timestamps from all data sources
    const allTimestamps = new Set<string>()

    // Add price timestamps
    Object.values(priceHistory).forEach((priceType: any) => {
      if (priceType.data) {
        Object.keys(priceType.data).forEach((timestamp) => {
          allTimestamps.add(timestamp)
        })
      }
    })

    // Add sales rank and monthly sold timestamps
    Object.entries(salesRankHistory).forEach(([key, rankType]: [string, any]) => {
      if (rankType.data) {
        if (key === "monthly_sold") {
          Object.keys(rankType.data).forEach((timestamp) => {
            allTimestamps.add(timestamp)
          })
        } else if (Array.isArray(rankType.data)) {
          rankType.data.forEach((entry: any) => allTimestamps.add(entry.date))
        } else {
          Object.keys(rankType.data).forEach((timestamp) => {
            allTimestamps.add(timestamp)
          })
        }
      }
    })

    // Add rating timestamps
    if (ratingHistory.rating_count?.data) {
      Object.values(ratingHistory.rating_count.data).forEach((entry: any) => {
        allTimestamps.add(entry.date)
      })
    }

    if (ratingHistory.new_offer_count?.data) {
      ratingHistory.new_offer_count.data.forEach((entry: any) => {
        allTimestamps.add(entry.date)
      })
    }

    // Convert to sorted array
    const sortedTimestamps = Array.from(allTimestamps).sort()

    return sortedTimestamps
      .map((timestamp) => {
        const date = new Date(timestamp)

        // Format date based on time range
        const formatDate = () => {
          switch (universalTimeRange) {
            case "7d":
              return date.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
              })
            case "30d":
              return date.toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
              })
            case "90d":
              return date.toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
              })
            case "1y":
            case "all":
              return date.toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
                year: "2-digit",
              })
            default:
              return date.toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
              })
          }
        }

        // Get price data for this timestamp
        const amazonPrice = priceHistory.amazon?.data?.[timestamp]?.price || null
        const buyboxPrice = priceHistory.buybox?.data?.[timestamp]?.price || null
        const newPrice = priceHistory.new?.data?.[timestamp]?.price || null

        // Get sales rank data for this timestamp dynamically
        const salesRankDataForTimestamp: Record<string, number | null> = {}
        Object.keys(salesRankHistory).forEach((key) => {
          if (key === "main_bsr") {
            salesRankDataForTimestamp[key] = salesRankHistory[key]?.data?.[timestamp]?.rank || null
          } else if (key.startsWith("category_")) {
            const categoryEntry = salesRankHistory[key]?.data?.find(
              (entry: any) => Math.abs(new Date(entry.date).getTime() - date.getTime()) < 86400000,
            )
            salesRankDataForTimestamp[key] = categoryEntry?.rank || null
          } else if (key === "monthly_sold") {
            salesRankDataForTimestamp[key] = salesRankHistory[key]?.data?.[timestamp]?.value || null
          }
        })

        // Get rating data for this timestamp
        const ratingCountEntry = Object.values(ratingHistory.rating_count?.data || {}).find(
          (entry: any) => Math.abs(new Date(entry.date).getTime() - date.getTime()) < 86400000,
        ) as any

        const newOfferCountEntry = ratingHistory.new_offer_count?.data?.find(
          (entry: any) => Math.abs(new Date(entry.date).getTime() - date.getTime()) < 86400000,
        ) as any

        // Rating is typically static, use from summary or default
        const rating = summaryData?.data?.current_data?.rating || 4.0

        return {
          date: timestamp,
          dateFormatted: formatDate(),
          fullDate: date.toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          // Price data
          amazon: amazonPrice,
          buybox: buyboxPrice,
          new: newPrice,
          // Sales rank data (now dynamic, including monthly_sold)
          ...salesRankDataForTimestamp,
          // Rating data
          rating: rating,
          rating_count: ratingCountEntry?.value || null,
          new_offer_count: newOfferCountEntry?.value || null,
        }
      })
      .filter(
        (item) =>
          // Filter out entries with no data
          item.amazon !== null ||
          item.buybox !== null ||
          item.new !== null ||
         Object.keys(salesRankHistory).some((key) => 
      // Use type assertion to access dynamic properties
      (item as any)[key] !== null && (item as any)[key] !== undefined
    ) ||
          item.rating_count !== null ||
          item.new_offer_count !== null,
      ) as ChartDataPoint[]
  }, [priceData, salesRankData, ratingData, summaryData, universalTimeRange])

  // Calculate actual data ranges for y-axis labels
  const getDataRange = useMemo(() => {
    if (chartData.length === 0)
      return { price: {}, sales: { allRanks: null, monthlySold: null }, rating: { count: null, valueAndOffers: null } }

    const ranges = {
      price: {} as Record<string, { min: number; max: number }>,
      sales: {
        allRanks: null as { min: number; max: number } | null, // For all ranks (left axis)
        monthlySold: null as { min: number; max: number } | null, // For monthly_sold (right axis)
      },
      rating: {
        count: null as { min: number; max: number } | null,
        valueAndOffers: null as { min: number; max: number } | null,
      },
    }

    // Calculate price ranges
    Object.entries(priceMetrics).forEach(([key, isActive]) => {
      if (isActive) {
        const values = chartData.map((d) => d[key]).filter((v) => v !== null && v !== undefined) as number[]
        if (values.length > 0) {
          ranges.price[key] = { min: Math.min(...values), max: Math.max(...values) }
        }
      }
    })

    // Calculate sales rank and monthly sold ranges for dual axis
    const allRankValues: number[] = []
    const monthlySoldValues: number[] = []

    Object.entries(salesRankMetrics).forEach(([key, isActive]) => {
      if (isActive) {
        const values = chartData.map((d) => d[key]).filter((v) => v !== null && v !== undefined) as number[]
        if (values.length > 0) {
          if (key === "monthly_sold") {
            monthlySoldValues.push(...values)
          } else {
            allRankValues.push(...values)
          }
        }
      }
    })

    if (allRankValues.length > 0) {
      ranges.sales.allRanks = { min: Math.min(...allRankValues), max: Math.max(...allRankValues) }
    } else {
      ranges.sales.allRanks = { min: 0, max: 100000 }
    }

    if (monthlySoldValues.length > 0) {
      ranges.sales.monthlySold = { min: Math.min(...monthlySoldValues), max: Math.max(...monthlySoldValues) }
    } else {
      ranges.sales.monthlySold = { min: 0, max: 1000 }
    }

    // Calculate rating ranges
    const ratingCountValues: number[] = []
    const ratingValueAndOfferValues: number[] = []

    if (ratingMetrics.rating_count) {
      const values = chartData.map((d) => d.rating_count).filter((v) => v !== null && v !== undefined) as number[]
      if (values.length > 0) ratingCountValues.push(...values)
    }
    if (ratingMetrics.rating) {
      const values = chartData.map((d) => d.rating).filter((v) => v !== null && v !== undefined) as number[]
      if (values.length > 0) ratingValueAndOfferValues.push(...values)
    }
    if (ratingMetrics.new_offer_count) {
      const values = chartData.map((d) => d.new_offer_count).filter((v) => v !== null && v !== undefined) as number[]
      if (values.length > 0) ratingValueAndOfferValues.push(...values)
    }

    if (ratingCountValues.length > 0) {
      ranges.rating.count = { min: Math.min(...ratingCountValues), max: Math.max(...ratingCountValues) }
    }
    if (ratingValueAndOfferValues.length > 0) {
      ranges.rating.valueAndOffers = {
        min: Math.min(...ratingValueAndOfferValues),
        max: Math.max(...ratingValueAndOfferValues),
      }
    } else {
      ranges.rating.valueAndOffers = { min: 0, max: 5 }
    }

    return ranges
  }, [chartData, priceMetrics, salesRankMetrics, ratingMetrics])

  // Helper function to get overall range for a chart type (single axis)
  const getOverallRange = (type: "price") => {
    const typeRanges = getDataRange[type]
    const allValues: number[] = []

    Object.values(typeRanges).forEach((range) => {
      if (range.min !== undefined) allValues.push(range.min)
      if (range.max !== undefined) allValues.push(range.max)
    })

    if (allValues.length === 0) return { min: 0, max: 100, actualMin: 0 }

    const actualMin = allValues.length > 0 ? Math.min(...allValues) : 0
    return {
      min: type === "price" ? 0 : actualMin,
      max: Math.max(...allValues),
      actualMin: actualMin,
    }
  }

  // New helpers for sales rank chart's dual axes
  const getAllRanksRange = () => {
    const allRanksRange = getDataRange.sales.allRanks
    if (!allRanksRange) return { min: 0, max: 100000 }
    return allRanksRange
  }

  const getMonthlySoldRange = () => {
    const monthlySoldRange = getDataRange.sales.monthlySold
    if (!monthlySoldRange) return { min: 0, max: 1000 }
    return monthlySoldRange
  }

  // New helpers for rating chart's dual axes
  const getRatingCountRange = () => {
    const countRange = getDataRange.rating.count
    if (!countRange) return { min: 0, max: 100 }
    return countRange
  }

  const getRatingValueAndOffersRange = () => {
    const valueAndOffersRange = getDataRange.rating.valueAndOffers
    if (!valueAndOffersRange) return { min: 0, max: 5 }
    return valueAndOffersRange
  }

  // Get available price types from API data
  const availablePriceTypes = useMemo(() => {
    if (!priceData?.data?.price_history?.summary) return []
    return priceData.data.price_history.summary.available_types || []
  }, [priceData])

  // Optimize hover events with throttling
  const handleHoverChange = useCallback((time: string | null) => {
    setHoverTime(time)
  }, [])

  const timeRanges = [
    { key: "7d", label: "Week" },
    { key: "30d", label: "Month" },
    { key: "90d", label: "3 Months" },
    { key: "1y", label: "Year" },
    { key: "all", label: "All" },
  ]

  // Handle time range change with loading state
  const handleTimeRangeChange = useCallback((newRange: string) => {
    setUniversalTimeRange(newRange)
  }, [])

  if (isLoading || priceLoading || summaryLoading) {
    return (
      <div className="border border-border rounded-xl p-6 bg-white">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Universal Time Range Controller
  const UniversalTimeController = () => (
    <div className="px-6 py-3 border-b border-border bg-[#FAFAFA] flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-[#01011D]">Time Range:</span>
        <div className="flex items-center gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.key}
              onClick={() => handleTimeRangeChange(range.key)}
              disabled={isTimeRangeChanging}
              className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                universalTimeRange === range.key ? "bg-primary text-white" : "bg-white text-[#787891] hover:bg-gray-100"
              } ${isTimeRangeChanging ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isTimeRangeChanging && universalTimeRange === range.key && (
                <LoadingOutlined spin style={{ fontSize: "12px" }} />
              )}
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <div className="text-xs text-[#787891] flex items-center gap-2">
        {isTimeRangeChanging && (
          <div className="flex items-center gap-1">
            <LoadingOutlined spin style={{ fontSize: "12px" }} />
            <span>Loading...</span>
          </div>
        )}
        <span>
          Total Price Types: {priceData?.data?.price_history?.summary?.total_price_types || 0} | Data Points:{" "}
          {chartData.length}
        </span>
      </div>
    </div>
  )

  const ChartCloseUpToggle = ({
    closeUpView,
    onToggle,
    title,
  }: {
    closeUpView: boolean
    onToggle: (enabled: boolean) => void
    title: string
  }) => (
    <div className="px-4 py-2 bg-[#FAFAFA] border-b border-border flex items-center justify-between">
      <span className="text-sm font-medium text-[#01011D]">{title}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#787891]">Close-up view</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={closeUpView}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    </div>
  )

  // Interactive Chart Controllers with actual API data
  const PriceChartController = () => (
    <div className="w-40 border-l border-border bg-[#FAFAFA] p-2">
      <h4 className="font-semibold text-xs text-[#01011D] mb-1">Price Types</h4>
      <div className="space-y-1">
        {availablePriceTypes.map((priceType: any) => {
          const priceTypeData = priceData?.data?.price_history?.price_types?.[priceType]
          if (!priceTypeData) return null

          return (
            <div
              key={priceType}
              className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
                priceMetrics[priceType as keyof typeof priceMetrics] ? "bg-white shadow-sm" : "hover:bg-white"
              }`}
              onClick={() =>
                setPriceMetrics((prev) => ({ ...prev, [priceType]: !prev[priceType as keyof typeof prev] }))
              }
            >
              <div
                className={`w-3 h-3 rounded border`}
                style={{
                  backgroundColor: priceMetrics[priceType as keyof typeof priceMetrics]
                    ? priceTypeData.color
                    : "transparent",
                  borderColor: priceTypeData.color,
                }}
              ></div>
              <span className="text-xs flex-1">{priceTypeData.label}</span>
              <span className="text-xs text-gray-500">({priceTypeData.data_points})</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  const SalesRankController = () => (
    <div className="w-40 border-l border-border bg-[#FAFAFA] p-2">
      <h4 className="font-semibold text-xs text-[#01011D] mb-1">Sales Rank & Volume</h4>
      <div className="space-y-1">
        {Object.entries(salesRankData?.data?.sales_rank?.sales_rank_data || {}).map(
          ([key, rankData]: [string, any]) => (
            <div
              key={key}
              className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
                salesRankMetrics[key] ? "bg-white shadow-sm" : "hover:bg-white"
              }`}
              onClick={() => setSalesRankMetrics((prev) => ({ ...prev, [key]: !prev[key] }))}
            >
              <div
                className={`w-3 h-3 rounded border`}
                style={{
                  backgroundColor: salesRankMetrics[key] ? rankData.color : "transparent",
                  borderColor: rankData.color,
                }}
              ></div>
              <span className="text-xs flex-1">{rankData.label}</span>
              <span className="text-xs text-gray-500">({rankData.data_points})</span>
            </div>
          ),
        )}
      </div>
    </div>
  )

  const RatingController = () => (
    <div className="w-40 border-l border-border bg-[#FAFAFA] p-2">
      <h4 className="font-semibold text-xs text-[#01011D] mb-1">Rating & Reviews</h4>
      <div className="space-y-1">
        {Object.entries(ratingData?.data?.chart_data || {}).map(([key, ratingDataItem]: [string, any]) => {
          if (!ratingDataItem.label) return null

          return (
            <div
              key={key}
              className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
                ratingMetrics[key as keyof typeof ratingMetrics] ? "bg-white shadow-sm" : "hover:bg-white"
              }`}
              onClick={() => setRatingMetrics((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
            >
              <div
                className={`w-3 h-3 rounded border`}
                style={{
                  backgroundColor: ratingMetrics[key as keyof typeof ratingMetrics]
                    ? ratingDataItem.color
                    : "transparent",
                  borderColor: ratingDataItem.color,
                }}
              ></div>
              <span className="text-xs flex-1">{ratingDataItem.label}</span>
              <span className="text-xs text-gray-500">({ratingData?.data?.metadata?.data_points?.[key] || 0})</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  const ChartSection = ({
    title,
    height,
    children,
    yAxisLeftTopLabel,
    yAxisLeftBottomLabel,
    yAxisRightTopLabel,
    yAxisRightBottomLabel,
    closeUpView,
    onCloseUpToggle,
    yAxisLeftMidLabel,
    yAxisLeftMidLabelTopPx,
  }: {
    title: string
    height: string
    children: React.ReactNode
    yAxisLeftTopLabel?: string
    yAxisLeftBottomLabel?: string
    yAxisRightTopLabel?: string
    yAxisRightBottomLabel?: string
    closeUpView: boolean
    onCloseUpToggle: (enabled: boolean) => void
    yAxisLeftMidLabel?: string
    yAxisLeftMidLabelTopPx?: number | null
  }) => (
    <div className="relative border border-gray-200 rounded bg-white overflow-hidden">
      <ChartCloseUpToggle closeUpView={closeUpView} onToggle={onCloseUpToggle} title={title} />

      <div className={`${height} relative overflow-hidden`}>
        {/* Left Y-axis labels */}
        {yAxisLeftTopLabel && (
          <div className="absolute left-1 top-4 text-xs text-gray-700 font-medium bg-white px-1 py-0.5 rounded border border-gray-200 shadow-sm z-10">
            {yAxisLeftTopLabel}
          </div>
        )}
        {yAxisLeftBottomLabel && (
          <div className="absolute left-1 bottom-4 text-xs text-gray-700 font-medium bg-white px-1 py-0.5 rounded border border-gray-200 shadow-sm z-10">
            {yAxisLeftBottomLabel}
          </div>
        )}
        {yAxisLeftMidLabel && yAxisLeftMidLabelTopPx !== null && (
          <div
            className="absolute left-1 text-xs text-gray-700 font-medium bg-white px-1 py-0.5 rounded border border-gray-200 shadow-sm z-10"
            style={{ top: `${yAxisLeftMidLabelTopPx}px` }}
          >
            {yAxisLeftMidLabel}
          </div>
        )}
        {/* Right Y-axis labels */}
        {yAxisRightTopLabel && (
          <div className="absolute right-1 top-4 text-xs text-gray-700 font-medium bg-white px-1 py-0.5 rounded border border-gray-200 shadow-sm z-10">
            {yAxisRightTopLabel}
          </div>
        )}
        {yAxisRightBottomLabel && (
          <div className="absolute right-1 bottom-4 text-xs text-gray-700 font-medium bg-white px-1 py-0.5 rounded border border-gray-200 shadow-sm z-10">
            {yAxisRightBottomLabel}
          </div>
        )}

        <div className="w-full h-full p-4 flex items-center justify-center relative">
          {isTimeRangeChanging && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <LoadingOutlined spin />
                Loading chart data...
              </div>
            </div>
          )}
          {children}

          {hoverTime && (
            <div
              className="absolute top-0 bottom-0 w-px bg-gray-400 pointer-events-none"
              style={{
                left: `${(chartData.findIndex((d) => d.dateFormatted === hoverTime) / chartData.length) * 100}%`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )

  const MockChart = React.memo(
    ({
      type,
      metrics,
      closeUpView,
      leftAxisRange,
      rightAxisRange,
      yAxisMapping,
    }: {
      type: "price" | "sales" | "rating"
      metrics: any
      closeUpView: boolean
      leftAxisRange: { min: number; max: number }
      rightAxisRange?: { min: number; max: number }
      yAxisMapping?: Record<string, "left" | "right">
    }) => {
      const getLinePoints = (metricKey: string) => {
        if (!metrics[metricKey] || chartData.length === 0) return null

        const axisType = yAxisMapping?.[metricKey] || "left"
        const currentRange = axisType === "right" && rightAxisRange ? rightAxisRange : leftAxisRange

        const { min: overallMin, max: overallMax } = currentRange
        const range = overallMax - overallMin || 1

        const points: string[] = []
        let dataToUse = chartData
        let sampleRate = Math.max(1, Math.floor(chartData.length / 50))

        if (closeUpView) {
          const focusStartIndex = Math.floor(chartData.length * 0.75)
          dataToUse = chartData.slice(focusStartIndex)
          sampleRate = Math.max(1, Math.floor(dataToUse.length / 30))
        }

        const hasData = dataToUse.some((d) => d[metricKey] !== null && d[metricKey] !== undefined)
        if (!hasData) return null

        for (let i = 0; i < dataToUse.length; i += sampleRate) {
          const d = dataToUse[i]
          const value = d[metricKey]
          const x = (i / (dataToUse.length - 1)) * 400
          let y: number

          if (value === null || value === undefined || typeof value !== 'number') {
            y = 110
          } else {
            if (type === "sales" && metricKey !== "monthly_sold") {
              y = 10 + ((overallMax - value) / range) * 100
            } else {
              y = 110 - ((value - overallMin) / range) * 100
            }
            y = Math.max(10, Math.min(110, y))
          }

          points.push(`${x},${y}`)
        }

        return points.join(" ")
      }

      const getMetricColor = (metricKey: string) => {
        if (type === "price") {
          return priceData?.data?.price_history?.price_types?.[metricKey]?.color || "#666"
        } else if (type === "sales") {
          return salesRankData?.data?.sales_rank?.sales_rank_data?.[metricKey]?.color || "#666"
        } else if (type === "rating") {
          return ratingData?.data?.chart_data?.[metricKey]?.color || "#666"
        }
        return "#666"
      }

      const getHoverData = (i: number, metricKey: string) => {
        const data = chartData[i]
        if (!data) return null

        const value = data[metricKey]
        if (value === null || value === undefined) return "No data"

        if (type === "price") {
           if (typeof value === 'number') {
      return `$${value.toFixed(2)}`
    } else if (typeof value === 'string') {
      const numValue = parseFloat(value)
      return isNaN(numValue) ? value : `$${numValue.toFixed(2)}`
    }
        } else if (type === "sales") {
          if (metricKey === "monthly_sold") {
            return formatUnits(value)
          }
          return formatUnits(value) 
        } else if (type === "rating") {
          if (metricKey === "rating") {
            return formatDecimal(value)  
          } else {
            return formatDecimal(value) 
          }
        }
        return value.toString()
      }

      return (
        <div className="w-full h-full relative bg-white">
          <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id={`grid-${type}`} width="20" height="12" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 12" fill="none" stroke="#f0f0f0" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="white" />
            <rect x="0" y="0" width="400" height="120" fill={`url(#grid-${type})`} />

            {[20, 40, 60, 80, 100].map((y) => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f0f0f0" strokeWidth="0.5" />
            ))}

            {Array.from({ length: 6 }, (_, i) => {
              const x = i * 80
              return <line key={i} x1={x} y1="0" x2={x} y2="120" stroke="#f0f0f0" strokeWidth="0.5" />
            })}

            {closeUpView && (
              <>
                <rect
                  x="2"
                  y="2"
                  width="60"
                  height="16"
                  fill="rgba(34, 197, 94, 0.1)"
                  stroke="#22c55e"
                  strokeWidth="1"
                  rx="2"
                />
                <text
                  x="32"
                  y="12"
                  fontSize="8"
                  fill="#22c55e"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontWeight="500"
                >
                  CLOSE-UP
                </text>
              </>
            )}

            {Object.entries(metrics).map(([metricKey, isActive]) => {
              if (!isActive) return null

              const points = getLinePoints(metricKey)
              if (!points) return null

              return (
                <polyline
                  key={metricKey}
                  fill="none"
                  stroke={getMetricColor(metricKey)}
                  strokeWidth="0.5"
                  points={points}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )
            })}
          </svg>

          <div
            className="absolute inset-0 cursor-crosshair"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = (e.clientX - rect.left) / rect.width
              const dataIndex = Math.floor(x * chartData.length)

              if (dataIndex >= 0 && dataIndex < chartData.length) {
                handleHoverChange(chartData[dataIndex].dateFormatted)
              }
            }}
            onMouseLeave={() => handleHoverChange(null)}
          />

          {hoverTime &&
            (() => {
              const hoverIndex = chartData.findIndex((d) => d.dateFormatted === hoverTime)
              if (hoverIndex === -1) return null

              const dataPoint = chartData[hoverIndex]
              const activeMetrics = Object.entries(metrics)
                .filter(([, isActive]) => isActive)
                .slice(0, 3)

              return activeMetrics.map(([metricKey], index) => {
                const value = getHoverData(hoverIndex, metricKey)
                if (!value) return null

                const xPos = (hoverIndex / (chartData.length - 1)) * 100

                const dataValue = dataPoint[metricKey]
                if (dataValue === null || dataValue === undefined) return null

                const axisType = yAxisMapping?.[metricKey] || "left"
                const currentRange = axisType === "right" && rightAxisRange ? rightAxisRange : leftAxisRange

                const { min: overallMin, max: overallMax } = currentRange
                const range = overallMax - overallMin || 1

                let ySvg: number
                if (dataValue === null || dataValue === undefined || typeof dataValue !== 'number') {
                  ySvg = 110
                } else {
                  if (type === "sales" && metricKey !== "monthly_sold") {
                    ySvg = 10 + ((overallMax - dataValue) / range) * 100
                  } else {
                    ySvg = 110 - ((dataValue - overallMin) / range) * 100
                  }
                  ySvg = Math.max(10, Math.min(110, ySvg))
                }

                let yPercent = (ySvg / 120) * 100
                const verticalOffset = index * 15
                yPercent += verticalOffset

                const horizontalOffset = (index - 1) * 25
                const adjustedXPos = Math.min(Math.max(xPos + horizontalOffset / 10, 12), 78)

                return (
                  <div
                    key={metricKey}
                    className="absolute bg-white border rounded px-2 py-1 text-[8px] shadow-md pointer-events-none"
                    style={{
                      left: `${adjustedXPos}%`,
                      top: `${yPercent}%`,
                      borderColor: getMetricColor(metricKey),
                      backgroundColor: "rgba(255,255,255,0.95)",
                      zIndex: 30 + index,
                      minWidth: "60px",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div className="font-medium truncate" style={{ color: getMetricColor(metricKey) }}>
                      {type === "price" && priceData?.data?.price_history?.price_types?.[metricKey]?.label?.slice(0, 8)}
                      {type === "sales" &&
                        salesRankData?.data?.sales_rank?.sales_rank_data?.[metricKey]?.label?.slice(0, 8)}
                      {type === "rating" && ratingData?.data?.chart_data?.[metricKey]?.label?.slice(0, 8)}
                    </div>
                    <div className="font-bold text-gray-800 text-[9px]">{value}</div>
                  </div>
                )
              })
            })()}
        </div>
      )
    },
  )

  MockChart.displayName = "MockChart"

 const ratingYAxisMapping: Record<string, "left" | "right"> = {
  rating_count: "left",
  rating: "right",
  new_offer_count: "right",
}

  const salesRankYAxisMapping: Record<string, "left" | "right"> = {
  main_bsr: "left",
  monthly_sold: "right",
}
  if (salesRankData?.data?.sales_rank?.sales_rank_data) {
    Object.keys(salesRankData.data.sales_rank.sales_rank_data).forEach((key) => {
      if (key.startsWith("category_")) {
        salesRankYAxisMapping[key] = "left" // All ranks on the left axis
      }
    })
  }

  return (
    <div className="border border-border rounded-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg text-[#01011D] mb-1">
              {priceData?.data?.product?.name || product.title}
            </h3>
            <p className="text-sm text-[#787891]">
              ASIN: {priceData?.data?.product?.asin || product.asin} | Marketplace:{" "}
              {priceData?.data?.product?.marketplace_id || "N/A"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-[#787891]">Current Price: </span>
              <span className="font-semibold text-[#01011D]">
                {priceData?.data?.price_history?.price_types?.buybox?.current_price
                  ? `$${priceData.data.price_history.price_types.buybox.current_price}`
                  : `$${product.currentPrice}`}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-[#787891]">Sales Rank: </span>
              <span className="font-semibold text-[#01011D]">
                #{salesRankData?.data?.sales_rank?.sales_rank_data?.main_bsr?.current_rank || product.salesRank}
              </span>
            </div>
          </div>
        </div>
      </div>

      <UniversalTimeController />

      <div className="p-6 space-y-4">
        {/* Main Price Chart */}
        <div className="flex gap-4">
          <div className="flex-1">
            {(() => {
              const priceOverallRange = getOverallRange("price")
              const actualMinPrice = priceOverallRange.actualMin
              const priceMax = priceOverallRange.max

              let actualMinPriceLabel: string | null = null
              let actualMinPriceLabelTopPx: number | null = null

              if (actualMinPrice > 0 && actualMinPrice < priceMax) {
                const ySvgActualMin = 110 - (actualMinPrice / priceMax) * 100
                const svgPixelHeight = 256
                const svgViewBoxHeight = 120
                const paddingPx = 16
                actualMinPriceLabelTopPx = paddingPx + ySvgActualMin * (svgPixelHeight / svgViewBoxHeight)
                const bottomLabelPx = 288 - 16
                const labelHeightEstimate = 24
                const minDistance = 5
                if (actualMinPriceLabelTopPx > bottomLabelPx - labelHeightEstimate - minDistance) {
                  actualMinPriceLabelTopPx = null
                } else {
                  actualMinPriceLabel = `$${actualMinPrice.toFixed(2)}`
                }
              }

              return (
                <ChartSection
                  title="Price History"
                  height="h-72"
                  yAxisLeftTopLabel={`$${priceOverallRange.max.toFixed(2)}`}
                  yAxisLeftBottomLabel={`$${priceOverallRange.min.toFixed(2)}`}
                  yAxisLeftMidLabel={actualMinPriceLabel || undefined}
                  yAxisLeftMidLabelTopPx={actualMinPriceLabelTopPx}
                  closeUpView={priceCloseUpView}
                  onCloseUpToggle={setPriceCloseUpView}
                >
                  <MockChart
                    type="price"
                    metrics={priceMetrics}
                    closeUpView={priceCloseUpView}
                    leftAxisRange={priceOverallRange}
                  />
                </ChartSection>
              )
            })()}
          </div>
          <PriceChartController />
        </div>

        {/* Category Sales Ranks Chart */}
        <div className="flex gap-4">
          <div className="flex-1">
            <ChartSection
              title="Sales Rank & Volume"
              height="h-56"
              yAxisLeftTopLabel={`#${Math.round(getAllRanksRange().max).toLocaleString()}`}
              yAxisLeftBottomLabel={`#${Math.round(getAllRanksRange().min).toLocaleString()}`}
              yAxisRightTopLabel={`${Math.round(getMonthlySoldRange().max).toLocaleString()} units`}
              yAxisRightBottomLabel={`${Math.round(getMonthlySoldRange().min).toLocaleString()} units`}
              closeUpView={salesRankCloseUpView}
              onCloseUpToggle={setSalesRankCloseUpView}
            >
              <MockChart
                type="sales"
                metrics={salesRankMetrics}
                closeUpView={salesRankCloseUpView}
                leftAxisRange={getAllRanksRange()}
                rightAxisRange={getMonthlySoldRange()}
                yAxisMapping={salesRankYAxisMapping}
              />
            </ChartSection>
          </div>
          <SalesRankController />
        </div>

        {/* Rating Chart */}
        <div className="flex gap-4">
          <div className="flex-1">
            <ChartSection
              title="Rating & Reviews"
              height="h-56"
              yAxisLeftTopLabel={
                getRatingCountRange().max >= 10
                  ? Math.round(getRatingCountRange().max).toLocaleString()
                  : getRatingCountRange().max.toFixed(1)
              }
              yAxisLeftBottomLabel={
                getRatingCountRange().min >= 10
                  ? Math.round(getRatingCountRange().min).toLocaleString()
                  : getRatingCountRange().min.toFixed(1)
              }
              yAxisRightTopLabel={getRatingValueAndOffersRange().max.toFixed(1)}
              yAxisRightBottomLabel={getRatingValueAndOffersRange().min.toFixed(1)}
              closeUpView={ratingCloseUpView}
              onCloseUpToggle={setRatingCloseUpView}
            >
              <MockChart
                type="rating"
                metrics={ratingMetrics}
                closeUpView={ratingCloseUpView}
                leftAxisRange={getRatingCountRange()}
                rightAxisRange={getRatingValueAndOffersRange()}
                yAxisMapping={ratingYAxisMapping}
              />
            </ChartSection>
          </div>
          <RatingController />
        </div>

        {/* Chart Footer Info */}
        <div className="mt-4 text-xs text-[#787891] space-y-1">
          <div className="flex items-center gap-4 mt-2">
            <span>
              Current BSR: #{salesRankData?.data?.sales_rank?.sales_rank_data?.main_bsr?.current_rank || "N/A"}
            </span>
            <span>Best: #{salesRankData?.data?.sales_rank?.sales_rank_data?.main_bsr?.best_rank || "N/A"}</span>
            <span>Worst: #{salesRankData?.data?.sales_rank?.sales_rank_data?.main_bsr?.worst_rank || "N/A"}</span>
            {hoverTime && <span className="font-semibold text-blue-600">Hovering: {hoverTime}</span>}
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="p-6 border-t border-border bg-[#FAFAFA]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[#787891] mb-1">Category Sales Ranks</p>
            <div className="space-y-1">
              {summaryData?.data?.category_sales_ranks?.slice(0, 2).map((category: any, index: number) => (
                <div key={category.name} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded bg-green-${500 + index * 100}`}></span>
                  <span className="text-[#01011D] text-xs">{category.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[#787891] mb-1">Current Data</p>
            <div className="space-y-1 text-xs">
              <p>Rating: {summaryData?.data?.current_data?.rating?.toFixed(1) || "N/A"}</p>
            </div>
          </div>

          <div>
            <p className="text-[#787891] mb-1">Price Range</p>
            <div className="space-y-1 text-xs">
              <p>
                High: {summaryData?.data?.price_range?.currency || "$"}
                {summaryData?.data?.price_range?.high || "N/A"}
              </p>
              <p>
                Low: {summaryData?.data?.price_range?.currency || "$"}
                {summaryData?.data?.price_range?.low || "N/A"}
              </p>
              <p>
                Current: {summaryData?.data?.price_range?.currency || "$"}
                {summaryData?.data?.price_range?.current || "N/A"}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium">{summaryData?.data?.metadata?.timestamp || "N/A"}</p>
            {hoverTime && <p className="text-xs text-blue-600 mt-1">Time: {hoverTime}</p>}
            {isTimeRangeChanging && (
              <div className="flex items-center gap-1 justify-end mt-1">
                <LoadingOutlined spin style={{ fontSize: "12px" }} />
                <span className="text-xs text-blue-600">Updating...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}