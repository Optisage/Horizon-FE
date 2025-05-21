"use client"
import { useState } from "react"
import { Skeleton, Tooltip as AntTooltip } from "antd"
import dayjs from "dayjs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useGetMarketAnalysisQuery } from "@/redux/api/productsApi"
import CustomDatePicker from "../CustomDatePicker"
import type { MarketAnalysisData, MergedDataPoint } from "./types"

interface MarketAnalysisProps {
  asin: string
  marketplaceId: number
  isLoading?: boolean
  data: MarketAnalysisData | undefined
}

const MarketAnalysis = ({ asin, marketplaceId, isLoading }: MarketAnalysisProps) => {
  const [statStartDate, setStatStartDate] = useState(dayjs().format("YYYY-MM-DD"))
  const [statEndDate, setStatEndDate] = useState(dayjs().add(1, "month").format("YYYY-MM-DD"))

  const {
    data: marketAnalysisData,
    error: marketAnalysisError,
    isLoading: isLoadingMarketAnalysis,
  } = useGetMarketAnalysisQuery({
    marketplaceId,
    itemAsin: asin,
    statStartDate,
    statEndDate,
  })
/* eslint-disable @typescript-eslint/no-explicit-any */
  const handleDateChange = (date: any) => {
  const [startDate, endDate] = date;
  setStatStartDate(startDate.format("YYYY-MM-DD"));
  setStatEndDate(endDate.format("YYYY-MM-DD"));
};

  // Transform the API data to match the chart's expected format
  const transformData = (data: MarketAnalysisData | undefined): MergedDataPoint[] => {
    if (!data) return []

    const buyboxMap = new Map(data.buybox.map((item) => [dayjs(item.date).format("MMM D"), item.price]))

    const amazonMap = new Map(data.amazon.map((item) => [dayjs(item.date).format("MMM D"), item.price]))

    const allDates = new Set([...Array.from(buyboxMap.keys()), ...Array.from(amazonMap.keys())])

    const mergedData: MergedDataPoint[] = Array.from(allDates).map((date) => ({
      date,
      buyBox: buyboxMap.get(date) ?? null,
      amazon: amazonMap.get(date) ?? null,
    }))

    return mergedData.sort((a, b) => (dayjs(a.date, "MMM D").isBefore(dayjs(b.date, "MMM D")) ? -1 : 1))
  }

  const chartData = transformData(marketAnalysisData?.data)

  // Get price range for tooltips
  const getMinMaxPrices = () => {
    if (!chartData.length) return { min: 'N/A', max: 'N/A' };
    
    const allPrices = chartData.flatMap(item => {
      const prices = [];
      if (item.amazon !== null) prices.push(item.amazon);
      if (item.buyBox !== null) prices.push(item.buyBox);
      return prices;
    });
    
    if (!allPrices.length) return { min: 'N/A', max: 'N/A' };
    
    return {
      min: `$${Math.min(...allPrices).toFixed(2)}`,
      max: `$${Math.max(...allPrices).toFixed(2)}`
    };
  };

  const priceRange = getMinMaxPrices();

  const getMonthTicks = (data: MergedDataPoint[]): string[] => {
    if (!data?.length) return []

    const ticks: string[] = []
    let lastMonth: number | null = null

    data.forEach((item) => {
      const date = new Date(item.date)
      const currentMonth = date.getMonth()

      if (currentMonth !== lastMonth) {
        ticks.push(item.date)
        lastMonth = currentMonth
      }
    })

    return ticks
  }

  // Custom tooltip formatter for the chart
  const CustomTooltipFormatter = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toFixed(2) || 'N/A'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading || isLoadingMarketAnalysis) {
    return <MarketAnalysisSkeleton />
  }

  return (
    <div className="p-6 border rounded-lg">
      <div className="flex flex-col xl:flex-row gap-4 justify-between xl:items-center">
        <AntTooltip title={`Price analysis from ${statStartDate} to ${statEndDate}. Price range: ${priceRange.min} - ${priceRange.max}`} placement="top">
          <h2 className="text-lg font-semibold">Market Analysis</h2>
        </AntTooltip>
        <CustomDatePicker isRange onChange={handleDateChange} />
      </div>

      <p className="mt-4 text-black">Price</p>

      {chartData.length > 0 ? (
        <div className="mt-6 flex flex-col gap-4">
          {/* Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-lg bg-[#FF0080]" />
              <AntTooltip title="Price history when sold directly by Amazon" placement="top">
                <span>Amazon</span>
              </AntTooltip>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-lg bg-[#00E4E4]" />
              <AntTooltip title="Price history of the Buy Box (featured offer on Amazon)" placement="top">
                <span>Buy Box</span>
              </AntTooltip>
            </div>
          </div>

          {isLoadingMarketAnalysis ? (
            <div className="h-40 flex items-center justify-center font-medium">Loading...</div>
          ) : marketAnalysisError ? (
            <div className="h-40 flex items-center justify-center text-red-500 font-medium">
              Error loading market analysis data
            </div>
          ) : (
            <AntTooltip title={`Price trends from ${statStartDate} to ${statEndDate}. Hover over the chart to see exact prices.`} placement="top">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleString("default", {
                        month: "short",
                      })
                    }
                    ticks={getMonthTicks(chartData)}
                    interval={0}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltipFormatter />} />
                  <Line type="monotone" dataKey="amazon" name="Amazon" stroke="#FF0080" strokeWidth={2} />
                  <Line type="monotone" dataKey="buyBox" name="Buy Box" stroke="#00E4E4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </AntTooltip>
          )}
        </div>
      ) : (
        <div className="p-3 py-24 text-center text-gray-500">No market analysis data available.</div>
      )}
    </div>
  )
}

const MarketAnalysisSkeleton = () => {
  return (
    <div className="p-6 border rounded-lg">
      <div className="flex flex-col xl:flex-row gap-4 justify-between xl:items-center">
        <h2 className="text-lg font-semibold">Market Analysis</h2>
        <Skeleton.Button active size="small" style={{ width: 200 }} />
      </div>
      <p className="mt-4 text-black">Price</p>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Skeleton.Button active size="small" style={{ width: 100 }} />
          <Skeleton.Button active size="small" style={{ width: 100 }} />
        </div>
        <Skeleton.Button active size="large" block style={{ height: 300 }} />
      </div>
    </div>
  )
}

export default MarketAnalysis
