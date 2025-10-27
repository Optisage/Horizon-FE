"use client"
import { Tooltip as AntTooltip } from "antd"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useGetBuyboxInfoQuery } from "@/redux/api/productsApi"
import CustomDatePicker from "../CustomDatePicker"
import type { BuyboxItem } from "./types"
import type dayjs from "dayjs"
import { ImSpinner9 } from "react-icons/im"

interface BuyBoxAnalysisProps {
  asin: string
  marketplaceId: number
  statStartDate: string
  statEndDate: string
  onDateChange?: (dates: dayjs.Dayjs | [dayjs.Dayjs, dayjs.Dayjs]) => void
  isLoading?: boolean
}

interface PieChartData {
  name: string
  value: number
  color: string
}

const OldBuyBoxAnalysis = ({
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

  // Find the buybox winner for the tooltip
  const buyboxWinner = buybox.find((seller) => seller.is_buybox_winner)
  const buyboxWinnerName = buyboxWinner?.seller || "No current winner"
  const totalSellers = buybox.length

  if (isLoading || isLoadingBuybox) {
    return (
      <div className="p-6 border rounded-lg h-[400px] flex items-center justify-center">
        <ImSpinner9 className="animate-spin size-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 border rounded-lg">
      <div className="flex flex-col xl:flex-row gap-4 justify-between xl:items-center">
        <AntTooltip
          title={`Analysis of Buy Box ownership across ${totalSellers} sellers from ${statStartDate} to ${statEndDate}. The current Buy Box winner is ${buyboxWinnerName}.`}
          placement="top"
        >
          <h2 className="text-lg font-semibold">Buy Box Analysis</h2>
        </AntTooltip>
        <CustomDatePicker isRange onChange={onDateChange} />
      </div>

      {buybox.length > 0 ? (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6">
          {isLoadingBuybox ? (
            <div className="h-40 flex items-center justify-center font-medium">Loading...</div>
          ) : buyboxError ? (
            <div className="h-40 flex items-center justify-center text-red-500 font-medium">Error loading buybox</div>
          ) : (
            <AntTooltip
              title={`Buy Box distribution chart showing ${totalSellers} sellers competing for the Buy Box. Date range: ${statStartDate} to ${statEndDate}.`}
              placement="top"
            >
              <ResponsiveContainer width={250} height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" outerRadius={90}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </AntTooltip>
          )}

          <ul className="max-h-56 overflow-y-scroll py-1">
            {pieData.map((entry, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="size-3 rounded-lg" style={{ backgroundColor: entry.color }} />
                <AntTooltip
                  title={`Seller: ${entry.name} | Buy Box Share: ${entry.value}% | ${buybox[index]?.is_buybox_winner ? "Current Buy Box Winner" : "Not currently winning the Buy Box"} | Rating: ${buybox[index]?.rating || "N/A"} | Reviews: ${buybox[index]?.review_count || "N/A"}`}
                  placement="top"
                >
                  <span>
                    {entry.name} &nbsp; - {entry.value}%
                  </span>
                </AntTooltip>
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

export default OldBuyBoxAnalysis
