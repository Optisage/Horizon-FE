"use client"
import { Skeleton } from "antd"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useGetBuyboxInfoQuery } from "@/redux/api/productsApi"
import CustomDatePicker from "../CustomDatePicker"
import type { BuyboxItem } from "./types"
import type dayjs from "dayjs"

interface BuyBoxAnalysisProps {
  asin: string
  marketplaceId: number
  statStartDate: string
  statEndDate: string
  onDateChange?: (dates: dayjs.Dayjs | [dayjs.Dayjs, dayjs.Dayjs]) => void;
  isLoading?: boolean
}

interface PieChartData {
  name: string
  value: number
  color: string
}

const BuyBoxAnalysis = ({
  asin,
  marketplaceId,
  statStartDate,
  statEndDate,
  onDateChange,
  isLoading,
}: BuyBoxAnalysisProps) => {
  const {
    data: buyboxData,
    isLoading: isLoadingBuybox,
    error: buyboxError,
  } = useGetBuyboxInfoQuery({
    marketplaceId,
    itemAsin: asin,
    statStartDate,
    statEndDate,
  })

  const buybox = (buyboxData?.data?.buybox as BuyboxItem[]) ?? []

  // To have more colors
  const colorPalette = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF"]
  const pieData: PieChartData[] =
    buybox?.map((seller, index) => ({
      name: seller.seller,
      value: seller.weight_percentage,
      color: colorPalette[index % colorPalette.length], // Cycles through predefined colors
    })) || []

  if (isLoading || isLoadingBuybox) {
    return <BuyBoxAnalysisSkeleton />
  }

  return (
    <div className="p-6 border rounded-lg">
      <div className="flex flex-col xl:flex-row gap-4 justify-between xl:items-center">
        <h2 className="text-lg font-semibold">Buy Box Analysis</h2>
        <CustomDatePicker isRange onChange={onDateChange} />
      </div>

      {buybox.length > 0 ? (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
          {isLoadingBuybox ? (
            <div className="h-40 flex items-center justify-center font-medium">Loading...</div>
          ) : buyboxError ? (
            <div className="h-40 flex items-center justify-center text-red-500 font-medium">Error loading buybox</div>
          ) : (
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={90}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}

          <ul className="max-h-56 overflow-y-scroll py-1">
            {pieData.map((entry, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="size-3 rounded-lg" style={{ backgroundColor: entry.color }} />
                {entry.name} &nbsp; - {entry.value}%
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-3 py-24 text-center text-gray-500">No buybox data available.</div>
      )}
    </div>
  )
}

const BuyBoxAnalysisSkeleton = () => {
  return (
    <div className="p-6 border rounded-lg">
      <div className="flex flex-col xl:flex-row gap-4 justify-between xl:items-center">
        <h2 className="text-lg font-semibold">Buy Box Analysis</h2>
        <Skeleton.Button active size="small" style={{ width: 200 }} />
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
        <Skeleton.Image active style={{ width: 250, height: 250 }} />
        <Skeleton active paragraph={{ rows: 5 }} style={{ width: 200 }} />
      </div>
    </div>
  )
}

export default BuyBoxAnalysis
