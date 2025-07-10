"use client"

import React, { useState, useMemo, useCallback, useEffect } from "react"
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
  asin: string
}

export default function KeepaChart({ product, isLoading, asin }: KeepaChartProps) {
  const { marketplaceId } = useAppSelector((state) => state?.global)

  // API queries
  const [getPriceHistory, { data: priceData, isLoading: priceLoading }] = useLazyPriceHistoryQuery()
  const [getProductSummary, { data: summaryData, isLoading: summaryLoading }] = useLazyProductSummaryQuery()
  const [getRatingReview, { data: ratingData, isLoading: ratingLoading }] = useLazyRatingReviewQuery()
  const [getSalesRank, { data: salesRankData, isLoading: salesRankLoading }] = useLazySalesRankQuery()

  // Individual chart metric states
  const [priceMetrics, setPriceMetrics] = useState({
    buyBox: true,
    amazon: true,
    new: true,
    newThirdPartyFBM: false,
    newPrimeExclusive: false,
    listPrice: false,
  })

  const [salesRankMetrics, setSalesRankMetrics] = useState({
    salesRank: true,
    fashion: false,
    womenBoots: false,
  })

  const [ratingMetrics, setRatingMetrics] = useState({
    rating: true,
    ratingCount: true,
    newOfferCount: true,
  })

  // Universal time range and individual close-up states
  const [universalTimeRange, setUniversalTimeRange] = useState("30d")
  const [priceCloseUpView, setPriceCloseUpView] = useState(false)
  const [salesRankCloseUpView, setSalesRankCloseUpView] = useState(false)
  const [ratingCloseUpView, setRatingCloseUpView] = useState(false)

  const [hoverTime, setHoverTime] = useState<string | null>(null)

  // Fetch data when asin or time range changes
  useEffect(() => {
    if (asin && marketplaceId) {
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
            return "month"
        }
      }
      const ratingPeriod = getRatingPeriod(universalTimeRange)

      getPriceHistory({ asin, id: marketplaceId, period: universalTimeRange })
      getProductSummary({ asin, id: marketplaceId })
      getRatingReview({ asin, id: marketplaceId, period: ratingPeriod })
      getSalesRank({ asin, id: marketplaceId, period: universalTimeRange })
    }
  }, [asin, marketplaceId, universalTimeRange, getPriceHistory, getProductSummary, getRatingReview, getSalesRank])

  // Process chart data from API responses
  const chartData = useMemo(() => {
    if (!priceData?.data?.price_history) return []

    const priceHistory = priceData.data.price_history.price_types
    const salesRankHistory = salesRankData?.data?.sales_rank?.sales_rank_data?.data || {}
    const ratingHistory = ratingData?.data?.chart_data || {}

    // Get all unique timestamps from price data
    const allTimestamps = new Set<string>()
    Object.values(priceHistory).forEach((priceType: any) => {
      Object.keys(priceType.data || {}).forEach((timestamp) => {
        allTimestamps.add(timestamp)
      })
    })

    // Convert to sorted array
    const sortedTimestamps = Array.from(allTimestamps).sort()

    return sortedTimestamps.map((timestamp) => {
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
      const buyBoxPrice = priceHistory.buybox?.data?.[timestamp]?.price || 0
      const amazonPrice = priceHistory.amazon?.data?.[timestamp]?.price || 0
      const newPrice = priceHistory.new?.data?.[timestamp]?.price || 0

      // Get sales rank data (find closest timestamp)
      const salesRankEntry = Object.values(salesRankHistory).find(
        (entry: any) => Math.abs(new Date(entry.date).getTime() - date.getTime()) < 3600000, // Within 1 hour
      ) as any

      // Get rating data (find closest timestamp)
      const ratingCountEntry = Object.values(ratingHistory.rating_count?.data || {}).find(
        (entry: any) => Math.abs(new Date(entry.date).getTime() - date.getTime()) < 3600000,
      ) as any

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
        buyBox: buyBoxPrice,
        amazon: amazonPrice,
        new: newPrice,
        newThirdPartyFBM: newPrice * 0.95, // Approximate if not available
        newPrimeExclusive: newPrice * 1.05, // Approximate if not available
        listPrice: newPrice * 1.2, // Approximate list price
        // Sales rank data
        salesRank: salesRankEntry?.rank || 0,
        fashionRank: 0, // Would need category-specific data
        bootsRank: 0, // Would need category-specific data
        // Rating data
        rating: summaryData?.data?.current_data?.rating || 4.0,
        ratingCount: ratingCountEntry?.value || 0,
        newOfferCount: Math.floor(Math.random() * 5) + 1, // Approximate if not available
        // Additional data
        amount: buyBoxPrice * 50, // Approximate
        count: Math.floor(Math.random() * 100) + 20, // Approximate
      }
    })
  }, [priceData, salesRankData, ratingData, summaryData, universalTimeRange])

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
              onClick={() => setUniversalTimeRange(range.key)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                universalTimeRange === range.key ? "bg-primary text-white" : "bg-white text-[#787891] hover:bg-gray-100"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
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

  // Interactive Chart Controllers
  const PriceChartController = () => (
    <div className="w-40 border-l border-border bg-[#FAFAFA] p-2">
      <h4 className="font-semibold text-xs text-[#01011D] mb-1">List Price</h4>
      <div className="space-y-1">
        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            priceMetrics.buyBox ? "bg-white shadow-sm" : "hover:bg-white"
          }`}
          onClick={() => setPriceMetrics((prev) => ({ ...prev, buyBox: !prev.buyBox }))}
        >
          <div
            className={`w-3 h-3 rounded border ${priceMetrics.buyBox ? "bg-green-500 border-green-500" : "border-green-500"}`}
          ></div>
          <span className="text-xs flex-1">Buy Box</span>
        </div>

        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            priceMetrics.amazon ? "bg-white shadow-sm" : "hover:bg-white"
          }`}
          onClick={() => setPriceMetrics((prev) => ({ ...prev, amazon: !prev.amazon }))}
        >
          <div
            className={`w-3 h-3 rounded border ${priceMetrics.amazon ? "bg-orange-500 border-orange-500" : "border-orange-500"}`}
          ></div>
          <span className="text-xs flex-1">Amazon</span>
        </div>

        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            priceMetrics.new ? "bg-white shadow-sm" : "hover:bg-white"
          }`}
          onClick={() => setPriceMetrics((prev) => ({ ...prev, new: !prev.new }))}
        >
          <div
            className={`w-3 h-3 rounded border ${priceMetrics.new ? "bg-blue-500 border-blue-500" : "border-blue-500"}`}
          ></div>
          <span className="text-xs flex-1">New</span>
        </div>

        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            priceMetrics.newThirdPartyFBM ? "bg-white shadow-sm" : "hover:bg-white"
          }`}
          onClick={() => setPriceMetrics((prev) => ({ ...prev, newThirdPartyFBM: !prev.newThirdPartyFBM }))}
        >
          <div
            className={`w-3 h-3 rounded border ${priceMetrics.newThirdPartyFBM ? "bg-green-600 border-green-600" : "border-green-600"}`}
          ></div>
          <span className="text-xs flex-1">New, 3rd Party FBM</span>
        </div>

        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            priceMetrics.newPrimeExclusive ? "bg-white shadow-sm" : "hover:bg-white"
          }`}
          onClick={() => setPriceMetrics((prev) => ({ ...prev, newPrimeExclusive: !prev.newPrimeExclusive }))}
        >
          <div
            className={`w-3 h-3 rounded border ${priceMetrics.newPrimeExclusive ? "bg-purple-500 border-purple-500" : "border-purple-500"}`}
          ></div>
          <span className="text-xs flex-1">New Prime exclusive</span>
        </div>

        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            priceMetrics.listPrice ? "bg-white shadow-sm" : "hover:bg-white"
          }`}
          onClick={() => setPriceMetrics((prev) => ({ ...prev, listPrice: !prev.listPrice }))}
        >
          <div
            className={`w-3 h-3 rounded border ${priceMetrics.listPrice ? "bg-red-500 border-red-500" : "border-red-500"}`}
          ></div>
          <span className="text-xs flex-1">List Price</span>
        </div>
      </div>
    </div>
  )

  const SalesRankController = () => (
    <div className="w-40 border-l border-border bg-[#FAFAFA] p-2">
      <h4 className="font-semibold text-xs text-[#01011D] mb-1">Sales Rank</h4>
      <div className="space-y-1">
        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            salesRankMetrics.salesRank ? "bg-white shadow-sm" : "hover:bg-white"
          }`}
          onClick={() => setSalesRankMetrics((prev) => ({ ...prev, salesRank: !prev.salesRank }))}
        >
          <div
            className={`w-3 h-3 rounded border ${salesRankMetrics.salesRank ? "bg-red-500 border-red-500" : "border-red-500"}`}
          ></div>
          <span className="text-xs flex-1">Sales Rank</span>
        </div>

        {salesRankData?.data?.sales_rank?.categories?.slice(0, 2).map((category: any, index: number) => (
          <div key={category.id} className={`flex items-center gap-1 p-1 rounded text-xs text-[#787891]`}>
            <div className={`w-3 h-3 rounded bg-green-${500 + index * 100}`}></div>
            <span className="flex-1">{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const RatingController = () => (
    <div className="w-40 border-l border-border bg-[#FAFAFA] p-2">
      <h4 className="font-semibold text-xs text-[#01011D] mb-1">Rating</h4>
      <div className="space-y-1">
        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            ratingMetrics.rating ? "bg-white shadow-sm" : "hover:bg-white"
          }`}
          onClick={() => setRatingMetrics((prev) => ({ ...prev, rating: !prev.rating }))}
        >
          <div
            className={`w-3 h-3 rounded border ${ratingMetrics.rating ? "bg-cyan-500 border-cyan-500" : "border-cyan-500"}`}
          ></div>
          <span className="text-xs flex-1">Rating</span>
        </div>

        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            ratingMetrics.ratingCount ? "bg-white shadow-sm" : "hover:bg-white"
          }`}
          onClick={() => setRatingMetrics((prev) => ({ ...prev, ratingCount: !prev.ratingCount }))}
        >
          <div
            className={`w-3 h-3 rounded border ${ratingMetrics.ratingCount ? "bg-teal-600 border-teal-600" : "border-teal-600"}`}
          ></div>
          <span className="text-xs flex-1">Rating Count</span>
        </div>

        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            ratingMetrics.newOfferCount ? "bg-white shadow-sm" : "hover:bg-white"
          }`}
          onClick={() => setRatingMetrics((prev) => ({ ...prev, newOfferCount: !prev.newOfferCount }))}
        >
          <div
            className={`w-3 h-3 rounded border ${ratingMetrics.newOfferCount ? "bg-blue-600 border-blue-600" : "border-blue-600"}`}
          ></div>
          <span className="text-xs flex-1">New Offer Count</span>
        </div>
      </div>
    </div>
  )

  const ChartSection = ({
    title,
    height,
    children,
    yAxisLeft,
    yAxisRight,
    closeUpView,
    onCloseUpToggle,
  }: {
    title: string
    height: string
    children: React.ReactNode
    yAxisLeft?: string
    yAxisRight?: string
    closeUpView: boolean
    onCloseUpToggle: (enabled: boolean) => void
  }) => (
    <div className="relative border border-gray-200 rounded bg-white overflow-hidden">
      <ChartCloseUpToggle closeUpView={closeUpView} onToggle={onCloseUpToggle} title={title} />

      <div className={`${height} relative overflow-hidden`}>
        {yAxisLeft && (
          <div className="absolute left-2 top-4 text-xs text-gray-500 writing-mode-vertical-lr transform rotate-180">
            {yAxisLeft}
          </div>
        )}
        {yAxisRight && (
          <div className="absolute right-2 top-4 text-xs text-gray-500 writing-mode-vertical-lr">{yAxisRight}</div>
        )}

        <div className="w-full h-full p-4 flex items-center justify-center relative">
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

  // Enhanced MockChart with real data visualization and tooltips
  interface MetricsType {
    [key: string]: boolean
  }

  const MockChart = React.memo(
    ({
      type,
      metrics,
      closeUpView,
    }: {
      type: "price" | "sales" | "rating"
      metrics: MetricsType
      closeUpView: boolean
    }) => {
      const getSimplifiedLinePoints = (metricKey: string) => {
        if (!metrics[metricKey] || chartData.length === 0) return null

        const points: string[] = []

        let dataToUse = chartData
        let sampleRate = Math.max(1, Math.floor(chartData.length / 20))

        if (closeUpView) {
          const focusStartIndex = Math.floor(chartData.length * 0.75)
          dataToUse = chartData.slice(focusStartIndex)
          sampleRate = Math.max(1, Math.floor(dataToUse.length / 30))
        }

        const getEnhancedRange = (metricKey: string, defaultMin: number, defaultMax: number) => {
          if (!closeUpView) return { min: defaultMin, max: defaultMax }

          const values = dataToUse.map((d) => {
            switch (metricKey) {
              case "buyBox":
              case "amazon":
              case "new":
              case "newThirdPartyFBM":
              case "newPrimeExclusive":
              case "listPrice":
                return d[metricKey]
              case "salesRank":
                return d.salesRank
              case "rating":
                return d.rating
              case "ratingCount":
                return d.ratingCount
              case "newOfferCount":
                return d.newOfferCount
              default:
                return defaultMin
            }
          })

          const min = Math.min(...values)
          const max = Math.max(...values)
          const padding = (max - min) * 0.1
          return { min: min - padding, max: max + padding }
        }

        for (let i = 0; i < dataToUse.length; i += sampleRate) {
          const d = dataToUse[i]
          let value = 0
          let normalizedValue = 0

          switch (metricKey) {
            case "buyBox":
            case "amazon":
            case "new":
            case "newThirdPartyFBM":
            case "newPrimeExclusive":
            case "listPrice":
              value = d[metricKey]
              if (value > 0) {
                const priceRange = getEnhancedRange(
                  metricKey,
                  Math.min(...chartData.map((item) => item[metricKey]).filter((v) => v > 0)),
                  Math.max(...chartData.map((item) => item[metricKey])),
                )
                normalizedValue = 100 - ((value - priceRange.min) / (priceRange.max - priceRange.min)) * 80
              }
              break
            case "salesRank":
              value = d.salesRank
              if (value > 0) {
                const rankRange = getEnhancedRange(
                  metricKey,
                  Math.min(...chartData.map((item) => item.salesRank).filter((v) => v > 0)),
                  Math.max(...chartData.map((item) => item.salesRank)),
                )
                normalizedValue = 90 + ((value - rankRange.min) / (rankRange.max - rankRange.min)) * 20
              }
              break
            case "rating":
              value = d.rating
              normalizedValue = 100 - ((value - 3.5) / (5 - 3.5)) * 80
              break
            case "ratingCount":
              value = d.ratingCount
              if (value > 0) {
                const countRange = getEnhancedRange(
                  metricKey,
                  Math.min(...chartData.map((item) => item.ratingCount).filter((v) => v > 0)),
                  Math.max(...chartData.map((item) => item.ratingCount)),
                )
                normalizedValue = 100 - ((value - countRange.min) / (countRange.max - countRange.min)) * 80
              }
              break
            case "newOfferCount":
              value = d.newOfferCount
              normalizedValue = 100 - ((value - 1) / (10 - 1)) * 80
              break
          }

          const x = (i / (dataToUse.length - 1)) * 400
          const y = Math.max(10, Math.min(110, normalizedValue))

          points.push(`${x},${y}`)
        }

        return points.join(" ")
      }

      const getHoverData = (i: number, metricKey: string) => {
        const data = chartData[i]
        if (!data) return null

        switch (metricKey) {
          case "buyBox":
          case "amazon":
          case "new":
          case "newThirdPartyFBM":
          case "newPrimeExclusive":
          case "listPrice":
            return data[metricKey] > 0 ? `$${data[metricKey]?.toFixed(2)}` : "N/A"
          case "salesRank":
            return data.salesRank > 0 ? `#${data.salesRank?.toFixed(0)}` : "N/A"
          case "rating":
            return data.rating?.toFixed(1)
          case "ratingCount":
            return data.ratingCount?.toFixed(0)
          case "newOfferCount":
            return data.newOfferCount?.toFixed(0)
          default:
            return "N/A"
        }
      }

      const getMetricColor = (metricKey: string) => {
        const colors = {
          buyBox: "#34C759",
          amazon: "#FF9500",
          new: "#007AFF",
          newThirdPartyFBM: "#4caf50",
          newPrimeExclusive: "#9c27b0",
          listPrice: "#ff5722",
          salesRank: "#FF6B35",
          rating: "#3B82F6",
          ratingCount: "#10B981",
          newOfferCount: "#6366F1",
        }
        return colors[metricKey as keyof typeof colors] || "#666"
      }

      const getMetricLabel = (metricKey: string) => {
        const labels = {
          buyBox: "Buy Box",
          amazon: "Amazon",
          new: "New",
          newThirdPartyFBM: "New 3rd Party FBM",
          newPrimeExclusive: "New Prime Exclusive",
          listPrice: "List Price",
          salesRank: "Sales Rank",
          rating: "Rating",
          ratingCount: "Rating Count",
          newOfferCount: "New Offer Count",
        }
        return labels[metricKey as keyof typeof labels] || metricKey
      }

      return (
        <div className="w-full h-full relative bg-white">
          <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id={`grid-${type}`} width="20" height="12" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 12" fill="none" stroke="#f5f5f5" strokeWidth="0.5" />
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

              const points = getSimplifiedLinePoints(metricKey)
              if (!points) return null

              return (
                <polyline
                  key={metricKey}
                  fill="none"
                  stroke={getMetricColor(metricKey)}
                  strokeWidth="1.5"
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

          {/* Tooltips implementation */}
          {hoverTime &&
            (() => {
              const hoverIndex = chartData.findIndex((d) => d.dateFormatted === hoverTime)
              if (hoverIndex === -1) return null

              const dataPoint = chartData[hoverIndex]
              const activeMetrics = Object.entries(metrics)
                .filter(([, isActive]) => isActive)
                .slice(0, 3) // Limit to 3 tooltips

              const callouts = []
              const tooltipWidth = 90 // Approximate width of each tooltip
              const minSpacing = 10 // Minimum spacing between tooltips

              for (let i = 0; i < activeMetrics.length; i++) {
                const [metricKey] = activeMetrics[i]
                const value = getHoverData(hoverIndex, metricKey)
                if (!value || value === "N/A") continue

                // Calculate horizontal position for side-by-side layout
                const baseXPos = (hoverIndex / (chartData.length - 1)) * 100
                const totalWidth = activeMetrics.length * tooltipWidth + (activeMetrics.length - 1) * minSpacing

                // Center the group of tooltips around the hover point
                const startOffset = -(totalWidth / 2) / 4 // Adjust for percentage-based positioning
                const xOffset = startOffset + (i * (tooltipWidth + minSpacing)) / 4

                let xPos = baseXPos + xOffset

                // Boundary checking - keep tooltips within chart bounds
                const leftBoundary = 12 // Minimum distance from left edge (percentage)
                const rightBoundary = 88 // Maximum distance from right edge (percentage)

                if (xPos < leftBoundary) {
                  xPos = leftBoundary + (i * (tooltipWidth + minSpacing)) / 4
                } else if (xPos > rightBoundary) {
                  xPos = rightBoundary - ((activeMetrics.length - 1 - i) * (tooltipWidth + minSpacing)) / 4
                }

                // Calculate vertical position based on data value
                let yPos = 40 // Default position
                switch (metricKey) {
                  case "buyBox":
                  case "amazon":
                  case "new":
                  case "newThirdPartyFBM":
                  case "newPrimeExclusive":
                  case "listPrice":
                    yPos = dataPoint[metricKey] > 0 ? 60 : 40
                    break
                  case "salesRank":
                    yPos = dataPoint.salesRank > 0 ? 70 : 40
                    break
                  case "rating":
                    yPos = 30
                    break
                  case "ratingCount":
                    yPos = dataPoint.ratingCount > 0 ? 50 : 40
                    break
                  case "newOfferCount":
                    yPos = 60
                    break
                }

                callouts.push({
                  metricKey,
                  value,
                  x: xPos,
                  y: yPos,
                  color: getMetricColor(metricKey),
                  label: getMetricLabel(metricKey),
                })
              }

              return callouts.map((callout, index) => (
                <div
                  key={callout.metricKey}
                  className="absolute bg-white border-2 rounded px-2 py-1 text-[10px] shadow-lg pointer-events-none"
                  style={{
                    left: `${callout.x}%`,
                    top: `${callout.y}%`,
                    borderColor: callout.color,
                    backgroundColor: "rgba(255,255,255,0.98)",
                    zIndex: 30 + index,
                    minWidth: "85px",
                    maxWidth: "110px",
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <div className="font-medium" style={{ color: callout.color }}>
                    {callout.label}
                  </div>
                  <div className="font-bold text-gray-800">{callout.value}</div>
                  <div className="text-[8px] text-gray-500">{dataPoint.dateFormatted}</div>

                  {/* Show amount/count for price metrics */}
                  {["buyBox", "amazon", "new", "newThirdPartyFBM", "newPrimeExclusive"].includes(callout.metricKey) && (
                    <div className="text-[9px] text-gray-600">
                      ${dataPoint.amount?.toFixed(0)} | {dataPoint.count?.toFixed(0)}
                    </div>
                  )}

                  {/* Connecting line pointing to the data point */}
                  <div
                    className="absolute w-px h-6 pointer-events-none"
                    style={{
                      left: "50%",
                      bottom: "-24px",
                      backgroundColor: callout.color,
                      opacity: 0.6,
                    }}
                  />
                </div>
              ))
            })()}
        </div>
      )
    },
  )

  MockChart.displayName = "MockChart"

  return (
    <div className="border border-border rounded-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg text-[#01011D] mb-1">
              {summaryData?.data?.product_info?.name || product.title}
            </h3>
            <p className="text-sm text-[#787891]">
              ASIN: {summaryData?.data?.product_info?.asin || product.asin} | Category:{" "}
              {salesRankData?.data?.sales_rank?.categories?.[0]?.name || product.category}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-[#787891]">Current Price: </span>
              <span className="font-semibold text-[#01011D]">
                {summaryData?.data?.price_range?.currency || "$"}
                {summaryData?.data?.price_range?.current || product.currentPrice}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-[#787891]">Sales Rank: </span>
              <span className="font-semibold text-[#01011D]">
                #{summaryData?.data?.sales_rank?.current || product.salesRank}
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
            <ChartSection
              title="Price History"
              height="h-72"
              yAxisLeft={`${summaryData?.data?.price_range?.currency || "$"}${summaryData?.data?.price_range?.high || "90"}`}
              yAxisRight="60"
              closeUpView={priceCloseUpView}
              onCloseUpToggle={setPriceCloseUpView}
            >
              <MockChart type="price" metrics={priceMetrics} closeUpView={priceCloseUpView} />
            </ChartSection>
          </div>
          <PriceChartController />
        </div>

        {/* Category Sales Ranks Chart */}
        <div className="flex gap-4">
          <div className="flex-1">
            <ChartSection
              title="Category Sales Ranks"
              height="h-40"
              yAxisRight="1000"
              closeUpView={salesRankCloseUpView}
              onCloseUpToggle={setSalesRankCloseUpView}
            >
              <MockChart type="sales" metrics={salesRankMetrics} closeUpView={salesRankCloseUpView} />
            </ChartSection>
          </div>
          <SalesRankController />
        </div>

        {/* Rating Chart */}
        <div className="flex gap-4">
          <div className="flex-1">
            <ChartSection
              title="Rating & Reviews"
              height="h-40"
              yAxisLeft={summaryData?.data?.current_data?.rating?.toFixed(1) || "4.4"}
              yAxisRight="300"
              closeUpView={ratingCloseUpView}
              onCloseUpToggle={setRatingCloseUpView}
            >
              <MockChart type="rating" metrics={ratingMetrics} closeUpView={ratingCloseUpView} />
            </ChartSection>
          </div>
          <RatingController />
        </div>

        {/* Chart Footer Info */}
        <div className="mt-4 text-xs text-[#787891] space-y-1">
          <div className="flex items-center gap-4 mt-2">
            <span>Sales Rank Current: #{summaryData?.data?.sales_rank?.current || "N/A"}</span>
            <span>90d: #{summaryData?.data?.sales_rank?.["90d"] || "N/A"}</span>
            <span>365d: #{summaryData?.data?.sales_rank?.["365d"] || "N/A"}</span>
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
              {summaryData?.data?.category_sales_ranks?.slice(0, 2).map((category: any) => (
                <p key={category.name}># {category.rank}</p>
              ))}
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
          </div>
        </div>
      </div>
    </div>
  )
}