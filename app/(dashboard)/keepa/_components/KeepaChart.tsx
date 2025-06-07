"use client"

import React, { useState, useMemo, useCallback } from "react"

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
}

export default function KeepaChart({ product, isLoading }: KeepaChartProps) {
  // Individual chart metric states
  const [priceMetrics, setPriceMetrics] = useState({
    buyBox: true,
    amazon: true,
    new: true,
    newThirdPartyFBM: true,
    newPrimeExclusive: false,
    listPrice: false
  })
  
  const [salesRankMetrics, setSalesRankMetrics] = useState({
    salesRank: true,
    fashion: true,
    womenBoots: true
  })
  
  const [ratingMetrics, setRatingMetrics] = useState({
    rating: true,
    ratingCount: true,
    newOfferCount: true
  })
  
  // Universal time range and individual close-up states
  const [universalTimeRange, setUniversalTimeRange] = useState("3months")
  const [priceCloseUpView, setPriceCloseUpView] = useState(false)
  const [salesRankCloseUpView, setSalesRankCloseUpView] = useState(false)
  const [ratingCloseUpView, setRatingCloseUpView] = useState(false)
  
  const [hoverTime, setHoverTime] = useState<string | null>(null)

  // Memoize chart data generation for better performance
  const chartData = useMemo(() => {
    const data = []
    const startDate = new Date("2024-01-01")
    
    // Optimized data points for better performance
    const getDataPointsForTimeframe = (timeframe: string) => {
      switch(timeframe) {
        case 'day': return 12 // Reduced from 24
        case 'week': return 14 // Reduced from 21
        case 'month': return 20 // Reduced from 30
        case '3months': return 30 // Reduced from 45
        case 'all': return 40 // Reduced from 60
        default: return 30
      }
    }
    
    const totalPoints = getDataPointsForTimeframe(universalTimeRange)
    
    // Create more structured price changes (less wobbly)
    const priceSegments = [
      { buyBox: 83.44, amazon: 83.44, new: 79.99, newThirdParty: 75.50, newPrime: 81.20, amount: 1250, count: 45 },
      { buyBox: 82.10, amazon: 82.10, new: 78.50, newThirdParty: 74.20, newPrime: 80.00, amount: 1180, count: 38 },
      { buyBox: 84.50, amazon: 84.50, new: 81.20, newThirdParty: 76.80, newPrime: 82.90, amount: 1320, count: 52 },
      { buyBox: 81.75, amazon: 81.75, new: 77.99, newThirdParty: 73.50, newPrime: 79.40, amount: 1150, count: 35 },
      { buyBox: 85.20, amazon: 85.20, new: 82.10, newThirdParty: 78.00, newPrime: 83.80, amount: 1400, count: 58 },
      { buyBox: 83.90, amazon: 83.90, new: 80.50, newThirdParty: 76.20, newPrime: 82.10, amount: 1280, count: 47 }
    ]
    
    const currentListPrice = 89.99
    
    for (let i = 0; i < totalPoints; i++) {
      const date = new Date(startDate)
      
      // Adjust date increment based on timeframe
      switch(universalTimeRange) {
        case 'day':
          date.setHours(startDate.getHours() + i)
          break
        case 'week':
        case 'month':
        case '3months':
          date.setDate(startDate.getDate() + i)
          break
        case 'all':
          date.setDate(startDate.getDate() + i)
          break
      }
      
      // Use structured segments instead of random wobbles
      const segmentIndex = Math.floor((i / totalPoints) * priceSegments.length)
      const currentSegment = priceSegments[Math.min(segmentIndex, priceSegments.length - 1)]
      
      // Add minor structured variations (not random wobbles)
      const microVariation = Math.sin(i * 0.2) * 0.5 // Small, predictable variations
      
      const formatDate = () => {
        switch(universalTimeRange) {
          case 'day':
            return date.toLocaleTimeString('en-GB', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          case 'week':
            return date.toLocaleDateString('en-GB', { 
              weekday: 'short',
              day: 'numeric' 
            })
          case 'month':
          case '3months':
            return date.toLocaleDateString('en-GB', { 
              month: 'short', 
              day: 'numeric' 
            })
          case 'all':
            return date.toLocaleDateString('en-GB', { 
              month: 'short', 
              day: 'numeric',
              year: '2-digit' 
            })
          default:
            return date.toLocaleDateString('en-GB', { 
              month: 'short', 
              day: 'numeric' 
            })
        }
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        dateFormatted: formatDate(),
        fullDate: date.toLocaleDateString('en-GB', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          ...(universalTimeRange === 'day' && {
            hour: '2-digit',
            minute: '2-digit'
          })
        }),
        // Structured step-like price data (less wobbly)
        buyBox: currentSegment.buyBox + microVariation,
        amazon: currentSegment.amazon + microVariation,
        new: currentSegment.new + microVariation,
        newThirdPartyFBM: currentSegment.newThirdParty + microVariation,
        newPrimeExclusive: currentSegment.newPrime + microVariation,
        listPrice: currentListPrice, // List price stays stable
        // Sales rank data (structured)
        salesRank: 67000 + Math.sin(i * 0.1) * 15000,
        fashionRank: 368 + Math.sin(i * 0.15) * 100,
        bootsRank: 652 + Math.sin(i * 0.1) * 150,
        // Rating data
        rating: 4.1 + Math.sin(i * 0.05) * 0.2,
        ratingCount: 130 + i * 1.5,
        newOfferCount: 3 + Math.sin(i * 0.2) * 0.8,
        // Structured amounts and counts
        amount: currentSegment.amount + Math.sin(i * 0.3) * 100,
        count: currentSegment.count + Math.sin(i * 0.25) * 10
      })
    }
    
    return data
  }, [universalTimeRange])

  // Optimize hover events with throttling
  const handleHoverChange = useCallback((time: string | null) => {
    setHoverTime(time)
  }, [])

  const timeRanges = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' }, 
    { key: 'month', label: 'Month' },
    { key: '3months', label: '3 Months' },
    { key: 'all', label: 'All (351 days)' }
  ]
  
  if (isLoading) {
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
                universalTimeRange === range.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-[#787891] hover:bg-gray-100'
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
    title 
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
            priceMetrics.buyBox ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
          onClick={() => setPriceMetrics(prev => ({ ...prev, buyBox: !prev.buyBox }))}
        >
          <div className={`w-3 h-3 rounded border ${priceMetrics.buyBox ? 'bg-orange-500 border-orange-500' : 'border-orange-500'}`}></div>
          <span className="text-xs flex-1">Buy Box</span>
        </div>
        
        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            priceMetrics.amazon ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
          onClick={() => setPriceMetrics(prev => ({ ...prev, amazon: !prev.amazon }))}
        >
          <div className={`w-3 h-3 rounded border ${priceMetrics.amazon ? 'bg-yellow-500 border-yellow-500' : 'border-yellow-500'}`}></div>
          <span className="text-xs flex-1">Amazon</span>
        </div>
        
        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            priceMetrics.new ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
          onClick={() => setPriceMetrics(prev => ({ ...prev, new: !prev.new }))}
        >
          <div className={`w-3 h-3 rounded border ${priceMetrics.new ? 'bg-blue-500 border-blue-500' : 'border-blue-500'}`}></div>
          <span className="text-xs flex-1">New</span>
        </div>
        
        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            priceMetrics.newThirdPartyFBM ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
          onClick={() => setPriceMetrics(prev => ({ ...prev, newThirdPartyFBM: !prev.newThirdPartyFBM }))}
        >
          <div className={`w-3 h-3 rounded border ${priceMetrics.newThirdPartyFBM ? 'bg-green-500 border-green-500' : 'border-green-500'}`}></div>
          <span className="text-xs flex-1">New, 3rd Party FBM</span>
        </div>
        
        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            priceMetrics.newPrimeExclusive ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
          onClick={() => setPriceMetrics(prev => ({ ...prev, newPrimeExclusive: !prev.newPrimeExclusive }))}
        >
          <div className={`w-3 h-3 rounded border ${priceMetrics.newPrimeExclusive ? 'bg-purple-500 border-purple-500' : 'border-purple-500'}`}></div>
          <span className="text-xs flex-1">New Prime exclusive</span>
        </div>
        
        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            priceMetrics.listPrice ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
          onClick={() => setPriceMetrics(prev => ({ ...prev, listPrice: !prev.listPrice }))}
        >
          <div className={`w-3 h-3 rounded border ${priceMetrics.listPrice ? 'bg-red-500 border-red-500' : 'border-red-500'}`}></div>
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
            salesRankMetrics.salesRank ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
          onClick={() => setSalesRankMetrics(prev => ({ ...prev, salesRank: !prev.salesRank }))}
        >
          <div className={`w-3 h-3 rounded border ${salesRankMetrics.salesRank ? 'bg-purple-500 border-purple-500' : 'border-purple-500'}`}></div>
          <span className="text-xs flex-1">Sales Rank</span>
        </div>
        
        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            salesRankMetrics.fashion ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
          onClick={() => setSalesRankMetrics(prev => ({ ...prev, fashion: !prev.fashion }))}
        >
          <div className={`w-3 h-3 rounded border ${salesRankMetrics.fashion ? 'bg-green-500 border-green-500' : 'border-green-500'}`}></div>
          <span className="text-xs flex-1">Fashion</span>
        </div>
        
        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            salesRankMetrics.womenBoots ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
          onClick={() => setSalesRankMetrics(prev => ({ ...prev, womenBoots: !prev.womenBoots }))}
        >
          <div className={`w-3 h-3 rounded border ${salesRankMetrics.womenBoots ? 'bg-green-600 border-green-600' : 'border-green-600'}`}></div>
          <span className="text-xs flex-1">Women&apos;s Boots</span>
        </div>
      </div>
    </div>
  )

  const RatingController = () => (
    <div className="w-40 border-l border-border bg-[#FAFAFA] p-2">
      <h4 className="font-semibold text-xs text-[#01011D] mb-1">Rating</h4>
      <div className="space-y-1">
        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            ratingMetrics.rating ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
          onClick={() => setRatingMetrics(prev => ({ ...prev, rating: !prev.rating }))}
        >
          <div className={`w-3 h-3 rounded border ${ratingMetrics.rating ? 'bg-cyan-500 border-cyan-500' : 'border-cyan-500'}`}></div>
          <span className="text-xs flex-1">Rating</span>
        </div>
        
        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            ratingMetrics.ratingCount ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
          onClick={() => setRatingMetrics(prev => ({ ...prev, ratingCount: !prev.ratingCount }))}
        >
          <div className={`w-3 h-3 rounded border ${ratingMetrics.ratingCount ? 'bg-teal-600 border-teal-600' : 'border-teal-600'}`}></div>
          <span className="text-xs flex-1">Rating Count</span>
        </div>
        
        <div
          className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
            ratingMetrics.newOfferCount ? 'bg-white shadow-sm' : 'hover:bg-white'
          }`}
          onClick={() => setRatingMetrics(prev => ({ ...prev, newOfferCount: !prev.newOfferCount }))}
        >
          <div className={`w-3 h-3 rounded border ${ratingMetrics.newOfferCount ? 'bg-blue-600 border-blue-600' : 'border-blue-600'}`}></div>
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
    onCloseUpToggle
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
      {/* Chart Close-up Toggle Only */}
      <ChartCloseUpToggle closeUpView={closeUpView} onToggle={onCloseUpToggle} title={title} />
      
      <div className={`${height} relative overflow-hidden`}>
        {/* Y-axis labels */}
        {yAxisLeft && (
          <div className="absolute left-2 top-4 text-xs text-gray-500 writing-mode-vertical-lr transform rotate-180">
            {yAxisLeft}
          </div>
        )}
        {yAxisRight && (
          <div className="absolute right-2 top-4 text-xs text-gray-500 writing-mode-vertical-lr">
            {yAxisRight}
          </div>
        )}
        
        {/* Chart content */}
        <div className="w-full h-full p-4 flex items-center justify-center relative">
          {children}
          
          {/* Hover line */}
          {hoverTime && (
            <div className="absolute top-0 bottom-0 w-px bg-gray-400 pointer-events-none" 
                 style={{ left: `${(chartData.findIndex(d => d.dateFormatted === hoverTime) / chartData.length) * 100}%` }} />
          )}
        </div>
      </div>
    </div>
  )

  // Enhanced MockChart with realistic data visualization
  interface MetricsType {
    [key: string]: boolean
  }

  const MockChart = React.memo(({ type, metrics, closeUpView }: { 
    type: 'price' | 'sales' | 'rating', 
    metrics: MetricsType, 
    closeUpView: boolean 
  }) => {
    
    const getSimplifiedLinePoints = (metricKey: string) => {
      if (!metrics[metricKey]) return null
      
      const points: string[] = []
      
      // Optimized data sampling for better performance
      let dataToUse = chartData
      let sampleRate = Math.max(1, Math.floor(chartData.length / 20)) // Reduced from 30 to 20
      
      if (closeUpView) {
        // Close-up view: Focus on last 25% of data with higher detail
        const focusStartIndex = Math.floor(chartData.length * 0.75)
        dataToUse = chartData.slice(focusStartIndex)
        sampleRate = Math.max(1, Math.floor(dataToUse.length / 30)) // Reduced from 50 to 30
      }
      
      // Calculate enhanced scaling ranges for close-up view
      const getEnhancedRange = (metricKey: string, defaultMin: number, defaultMax: number) => {
        if (!closeUpView) return { min: defaultMin, max: defaultMax }
        
        // In close-up, calculate tighter range based on actual data in focus area
        const values = dataToUse.map(d => {
          switch (metricKey) {
            case 'buyBox': case 'amazon': case 'new': case 'newThirdPartyFBM': case 'newPrimeExclusive': case 'listPrice':
              return d[metricKey]
            case 'salesRank': return d.salesRank
            case 'fashion': return d.fashionRank
            case 'womenBoots': return d.bootsRank
            case 'rating': return d.rating
            case 'ratingCount': return d.ratingCount
            case 'newOfferCount': return d.newOfferCount
            default: return defaultMin
          }
        })
        
        const min = Math.min(...values)
        const max = Math.max(...values)
        const padding = (max - min) * 0.1 // 10% padding
        return { min: min - padding, max: max + padding }
      }

      for (let i = 0; i < dataToUse.length; i += sampleRate) {
        const d = dataToUse[i]
        let value = 0
        let normalizedValue = 0
        
        switch (metricKey) {
          case 'buyBox':
          case 'amazon':
          case 'new':
          case 'newThirdPartyFBM':
          case 'newPrimeExclusive':
          case 'listPrice':
            value = d[metricKey]
            const priceRange = getEnhancedRange(metricKey, 70, 90)
            normalizedValue = 100 - ((value - priceRange.min) / (priceRange.max - priceRange.min)) * 80
            break
          case 'salesRank':
            value = d.salesRank
            const rankRange = getEnhancedRange(metricKey, 50000, 100000)
            normalizedValue = 90 + ((value - rankRange.min) / (rankRange.max - rankRange.min)) * 20
            break
          case 'fashion':
            value = d.fashionRank
            const fashionRange = getEnhancedRange(metricKey, 200, 600)
            normalizedValue = 90 + ((value - fashionRange.min) / (fashionRange.max - fashionRange.min)) * 20
            break
          case 'womenBoots':
            value = d.bootsRank
            const bootsRange = getEnhancedRange(metricKey, 400, 1000)
            normalizedValue = 90 + ((value - bootsRange.min) / (bootsRange.max - bootsRange.min)) * 20
            break
          case 'rating':
            value = d.rating
            const ratingRange = getEnhancedRange(metricKey, 3.5, 5)
            normalizedValue = 100 - ((value - ratingRange.min) / (ratingRange.max - ratingRange.min)) * 80
            break
          case 'ratingCount':
            value = d.ratingCount
            const countRange = getEnhancedRange(metricKey, 120, 300)
            normalizedValue = 100 - ((value - countRange.min) / (countRange.max - countRange.min)) * 80
            break
          case 'newOfferCount':
            value = d.newOfferCount
            const offerRange = getEnhancedRange(metricKey, 2, 6)
            normalizedValue = 100 - ((value - offerRange.min) / (offerRange.max - offerRange.min)) * 80
            break
        }
        
        const x = closeUpView ? (i / (dataToUse.length - 1)) * 400 : ((i + Math.floor(chartData.length * 0.75)) / (chartData.length - 1)) * 400
        const y = Math.max(10, Math.min(110, normalizedValue))
        
        points.push(`${x},${y}`)
      }
      
      // Ensure we include the last point
      if (dataToUse.length > 1) {
        const lastIndex = dataToUse.length - 1
        const d = dataToUse[lastIndex]
        let value = 0
        let normalizedValue = 0
        
        switch (metricKey) {
          case 'buyBox':
          case 'amazon':
          case 'new':
          case 'newThirdPartyFBM':
          case 'newPrimeExclusive':
          case 'listPrice':
            value = d[metricKey]
            const priceRange = getEnhancedRange(metricKey, 70, 90)
            normalizedValue = 100 - ((value - priceRange.min) / (priceRange.max - priceRange.min)) * 80
            break
          case 'salesRank':
            value = d.salesRank
            const rankRange = getEnhancedRange(metricKey, 50000, 100000)
            normalizedValue = 90 + ((value - rankRange.min) / (rankRange.max - rankRange.min)) * 20
            break
          case 'fashion':
            value = d.fashionRank
            const fashionRange = getEnhancedRange(metricKey, 200, 600)
            normalizedValue = 90 + ((value - fashionRange.min) / (fashionRange.max - fashionRange.min)) * 20
            break
          case 'womenBoots':
            value = d.bootsRank
            const bootsRange = getEnhancedRange(metricKey, 400, 1000)
            normalizedValue = 90 + ((value - bootsRange.min) / (bootsRange.max - bootsRange.min)) * 20
            break
          case 'rating':
            value = d.rating
            const ratingRange = getEnhancedRange(metricKey, 3.5, 5)
            normalizedValue = 100 - ((value - ratingRange.min) / (ratingRange.max - ratingRange.min)) * 80
            break
          case 'ratingCount':
            value = d.ratingCount
            const countRange = getEnhancedRange(metricKey, 120, 300)
            normalizedValue = 100 - ((value - countRange.min) / (countRange.max - countRange.min)) * 80
            break
          case 'newOfferCount':
            value = d.newOfferCount
            const offerRange = getEnhancedRange(metricKey, 2, 6)
            normalizedValue = 100 - ((value - offerRange.min) / (offerRange.max - offerRange.min)) * 80
            break
        }
        
        const x = 400
        const y = Math.max(10, Math.min(110, normalizedValue))
        
        if (points[points.length - 1] !== `${x},${y}`) {
          points.push(`${x},${y}`)
        }
      }
      
      return points.join(' ')
    }

    const getHoverData = (i: number, metricKey: string) => {
      const data = chartData[i]
      if (!data) return null
      
      switch (metricKey) {
        case 'buyBox':
        case 'amazon':
        case 'new':
        case 'newThirdPartyFBM':
        case 'newPrimeExclusive':
        case 'listPrice':
          return `£${data[metricKey]?.toFixed(2)}`
        case 'salesRank':
          return `#${data.salesRank?.toFixed(0)}`
        case 'fashion':
          return `#${data.fashionRank?.toFixed(0)}`
        case 'womenBoots':
          return `#${data.bootsRank?.toFixed(0)}`
        case 'rating':
          return data.rating?.toFixed(1)
        case 'ratingCount':
          return data.ratingCount?.toFixed(0)
        case 'newOfferCount':
          return data.newOfferCount?.toFixed(0)
        default:
          return 'N/A'
      }
    }

    const getMetricColor = (metricKey: string) => {
      const colors = {
        buyBox: '#e91e63',
        amazon: '#ff9800',
        new: '#2196f3',
        newThirdPartyFBM: '#4caf50',
        newPrimeExclusive: '#9c27b0',
        listPrice: '#ff5722',
        salesRank: '#4caf50',
        fashion: '#4caf50',
        womenBoots: '#388e3c',
        rating: '#06b6d4',
        ratingCount: '#0d9488',
        newOfferCount: '#2563eb'
      }
      return colors[metricKey as keyof typeof colors] || '#666'
    }

    return (
      <div className="w-full h-full relative bg-white">
        <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
          {/* Grid background */}
          <defs>
            <pattern id={`grid-${type}`} width="20" height="12" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 12" fill="none" stroke="#f5f5f5" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="white" />
          <rect x="0" y="0" width="400" height="120" fill={`url(#grid-${type})`} />
          
          {/* Simplified grid lines for better performance */}
          {(closeUpView ? 
            [20, 40, 60, 80, 100] : // Fewer lines for better performance
            [20, 40, 60, 80, 100] // Consistent simplified grid
          ).map((y) => (
            <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f0f0f0" strokeWidth="0.5" />
          ))}
          
          {/* Simplified vertical grid lines */}
          {Array.from({length: 6}, (_, i) => {
            const x = i * 80 // Simplified spacing
            return (
              <line key={i} x1={x} y1="0" x2={x} y2="120" stroke="#f0f0f0" strokeWidth="0.5" />
            )
          })}
          
          {/* Close-up view indicator */}
          {closeUpView && (
            <rect x="2" y="2" width="60" height="16" fill="rgba(34, 197, 94, 0.1)" stroke="#22c55e" strokeWidth="1" rx="2" />
          )}
          {closeUpView && (
            <text x="32" y="12" fontSize="8" fill="#22c55e" textAnchor="middle" dominantBaseline="central" fontWeight="500">
              CLOSE-UP
            </text>
          )}
          
          {/* Sales rank shaded area for price chart */}
          {type === 'price' && metrics.salesRank && (
            <rect x="0" y="90" width="400" height="30" fill="#e8f5e8" opacity="0.3" />
          )}
          
          {/* Render step-line data for active metrics */}
          {Object.entries(metrics).map(([metricKey, isActive]) => {
            if (!isActive) return null
            
            const points = getSimplifiedLinePoints(metricKey)
            if (!points) return null
            
            return (
              <g key={metricKey}>
                <polyline
                  fill="none"
                  stroke={getMetricColor(metricKey)}
                  strokeWidth={metricKey === 'salesRank' ? "1" : "1.5"}
                  points={points}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ 
                    willChange: 'transform',
                    transform: 'translateZ(0)'
                  }}
                />
              </g>
            )
          })}
        </svg>
        
        {/* Hover area */}
        <div 
          className="absolute inset-0 cursor-crosshair"
          style={{ willChange: 'transform' }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = (e.clientX - rect.left) / rect.width
            const dataIndex = Math.floor(x * chartData.length)
            if (dataIndex >= 0 && dataIndex < chartData.length) {
              handleHoverChange(chartData[dataIndex].dateFormatted)
            }
          }}
          onMouseLeave={() => {
            handleHoverChange(null)
          }}
        />
        
        {/* Optimized callout boxes - limited for performance */}
        {(() => {
          const activeMetrics = Object.entries(metrics).filter(([, isActive]) => isActive).slice(0, 3) // Limit to 3 callouts
                      interface CalloutData {
              metricKey: string
              dataPoint: typeof chartData[0]
              value: string | null
              left: number
              top: number
              index: number
            }
            
            const callouts: CalloutData[] = []
          
          activeMetrics.forEach(([metricKey, isActive], index) => {
            if (!isActive) return
            
            // Generate callout position based on hover state
            const seedValue = metricKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
            
            let targetDataIndex
            if (hoverTime) {
              // When hovering, position callouts relative to hover position with unique offsets
              const hoverIndex = chartData.findIndex(d => d.dateFormatted === hoverTime)
              const hoverOffset = (seedValue % 7 - 3) * 6 // Reduced offset for better grouping
              targetDataIndex = Math.max(5, Math.min(chartData.length - 5, hoverIndex + hoverOffset))
            } else {
              // When not hovering, show callouts at different default positions
              targetDataIndex = Math.floor((Math.sin(seedValue) * 0.5 + 0.5) * (chartData.length - 20)) + 10
            }
            
            const dataPoint = chartData[targetDataIndex]
            const value = getHoverData(targetDataIndex, metricKey)
            
            if (!dataPoint) return
            
            // Calculate position based on actual data point value
            let normalizedValue = 0
            const metricValue = dataPoint[metricKey as keyof typeof dataPoint] as number
            
            switch (metricKey) {
              case 'buyBox':
              case 'amazon':
              case 'new':
              case 'newThirdPartyFBM':
              case 'newPrimeExclusive':
              case 'listPrice':
                normalizedValue = 100 - ((metricValue - 70) / (90 - 70)) * 80
                break
              case 'salesRank':
                normalizedValue = 90 + ((metricValue - 50000) / (100000 - 50000)) * 20
                break
              case 'fashion':
                normalizedValue = 90 + ((metricValue - 200) / (600 - 200)) * 20
                break
              case 'womenBoots':
                normalizedValue = 90 + ((metricValue - 400) / (1000 - 400)) * 20
                break
              case 'rating':
                normalizedValue = 100 - ((metricValue - 3.5) / (5 - 3.5)) * 80
                break
              case 'ratingCount':
                normalizedValue = 100 - ((metricValue - 120) / (300 - 120)) * 80
                break
              case 'newOfferCount':
                normalizedValue = 100 - ((metricValue - 2) / (6 - 2)) * 80
                break
              default:
                normalizedValue = 60
            }
            
            const x = (targetDataIndex / (chartData.length - 1)) * 400
            const y = Math.max(10, Math.min(110, normalizedValue))
            
            // Convert SVG coordinates to container percentage
            const leftPercent = (x / 400) * 100
            const topPercent = (y / 120) * 100
            
            // Calculate initial offset
            let offsetX, offsetY
            if (hoverTime) {
              const hoverProgress = chartData.findIndex(d => d.dateFormatted === hoverTime) / chartData.length
              offsetX = ((Math.sin(seedValue * 1.5 + hoverProgress * 6) * 0.5 + 0.5) - 0.5) * 25
              offsetY = ((Math.cos(seedValue * 1.3 + hoverProgress * 4) * 0.5 + 0.5) - 0.5) * 20
            } else {
              offsetX = ((Math.sin(seedValue * 1.5) * 0.5 + 0.5) - 0.5) * 18
              offsetY = ((Math.cos(seedValue * 1.3) * 0.5 + 0.5) - 0.5) * 12
            }
            
            // Collision detection and spacing
            let finalLeft = Math.max(5, Math.min(95, leftPercent + offsetX))
            let finalTop = Math.max(5, Math.min(90, topPercent + offsetY))
            
            // Check for overlap with existing callouts
            for (const existingCallout of callouts) {
              const xDiff = Math.abs(finalLeft - existingCallout.left)
              const yDiff = Math.abs(finalTop - existingCallout.top)
              
              // If too close (within 15% horizontally or 12% vertically), adjust position
              if (xDiff < 15 && yDiff < 12) {
                // Stagger vertically based on index
                finalTop = Math.max(5, Math.min(85, finalTop + (index * 8)))
                // If still overlapping, stagger horizontally
                if (xDiff < 12) {
                  finalLeft = Math.max(10, Math.min(90, finalLeft + ((index % 2 === 0 ? 1 : -1) * 12)))
                }
              }
            }
            
            callouts.push({
              metricKey,
              dataPoint,
              value,
              left: finalLeft,
              top: finalTop,
              index
            })
          })
          
          return callouts.map(({ metricKey, dataPoint, value, left, top, index }) => (
            <div 
              key={metricKey} 
              className="absolute bg-white border-2 rounded px-2 py-1 text-[10px] shadow-lg transform -translate-x-1/2 -translate-y-full transition-all duration-150 ease-out pointer-events-none"
              style={{ 
                left: `${left}%`,
                top: `${top}%`,
                borderColor: getMetricColor(metricKey),
                backgroundColor: 'rgba(255,255,255,0.95)',
                zIndex: 20 + index,
                minWidth: '70px'
              }}
            >
              <div className="font-medium" style={{ color: getMetricColor(metricKey) }}>
                {metricKey === 'buyBox' ? 'Buy Box' : 
                 metricKey === 'newThirdPartyFBM' ? 'New 3rd Party' :
                 metricKey === 'newPrimeExclusive' ? 'New Prime' :
                 metricKey === 'listPrice' ? 'List Price' :
                 metricKey === 'amazon' ? 'Amazon' :
                 metricKey === 'new' ? 'New' :
                 metricKey === 'fashion' ? 'Fashion' :
                 metricKey === 'womenBoots' ? 'Women Boots' :
                 metricKey}
              </div>
              <div className="font-bold text-gray-800">{value}</div>
              
              {/* Date indicator */}
              <div className="text-[8px] text-gray-500">
                {dataPoint.dateFormatted}
              </div>
              
              {/* Compact amount and count for price metrics */}
              {(['buyBox', 'amazon', 'new', 'newThirdPartyFBM', 'newPrimeExclusive'].includes(metricKey)) && (
                <div className="text-[9px] text-gray-600">
                  £{dataPoint.amount?.toFixed(0)} | {dataPoint.count?.toFixed(0)}
                </div>
              )}
              
              {/* Connecting line to data point */}
              <svg className="absolute w-full h-full pointer-events-none" style={{ left: 0, top: 0 }}>
                <line 
                  x1="50%" 
                  y1="100%" 
                  x2="50%" 
                  y2="120%" 
                  stroke={getMetricColor(metricKey)} 
                  strokeWidth="1" 
                  strokeDasharray="2,2"
                />
              </svg>
            </div>
          ))
        })()}
      </div>
    )
  })
  
  MockChart.displayName = 'MockChart'

  return (
    <div className="border border-border rounded-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg text-[#01011D] mb-1">{product.title}</h3>
            <p className="text-sm text-[#787891]">ASIN: {product.asin} | Category: {product.category}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-[#787891]">Current Price: </span>
              <span className="font-semibold text-[#01011D]">£{product.currentPrice}</span>
            </div>
            <div className="text-sm">
              <span className="text-[#787891]">Sales Rank: </span>
              <span className="font-semibold text-[#01011D]">#{product.salesRank}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Time Range Controller */}
      <UniversalTimeController />

      {/* Chart Container */}
      <div className="p-6 space-y-4">
        {/* Main Price Chart */}
        <div className="flex gap-4">
          <div className="flex-1">
            <ChartSection 
              title="Price History" 
              height="h-72" 
              yAxisLeft="£90" 
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
              yAxisLeft="4.4" 
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
          <p>Select area to zoom in. Double-click to reset.</p>
          <p>Toggle shown data by clicking on the legend.</p>
          <div className="flex items-center gap-4 mt-2">
            <span>Sales Rank Current: #{chartData[chartData.length - 1]?.salesRank.toFixed(0)}</span>
            <span>90d: #111,451</span>
            <span>365d: #118,529</span>
            {hoverTime && (
              <span className="font-semibold text-blue-600">
                Hovering: {hoverTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="p-6 border-t border-border bg-[#FAFAFA]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[#787891] mb-1">Category Sales Ranks</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-green-500"></span>
                <span className="text-[#01011D]">Fashion</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-green-600"></span>
                <span className="text-[#01011D]">Women&apos;s Boots</span>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-[#787891] mb-1">Current Data</p>
            <div className="space-y-1 text-xs">
              <p># {chartData[chartData.length - 1]?.fashionRank.toFixed(0)}</p>
              <p># {chartData[chartData.length - 1]?.bootsRank.toFixed(0)}</p>
              <p>Rating: {chartData[chartData.length - 1]?.rating.toFixed(1)}</p>
            </div>
          </div>
          
          <div>
            <p className="text-[#787891] mb-1">Price Range</p>
            <div className="space-y-1 text-xs">
              <p>High: £{Math.max(...chartData.map(d => d.buyBox)).toFixed(2)}</p>
              <p>Low: £{Math.min(...chartData.map(d => d.buyBox)).toFixed(2)}</p>
              <p>Current: £{chartData[chartData.length - 1]?.buyBox.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium">Fri, May 16 23:49</p>
            {hoverTime && (
              <p className="text-xs text-blue-600 mt-1">Time: {hoverTime}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 