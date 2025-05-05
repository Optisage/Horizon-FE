"use client"
import { useState } from "react"
import { Skeleton } from "antd"
import { IoMdRefresh } from "react-icons/io"
import { BsArrowUp } from "react-icons/bs"
import { useGetRankingsAndPricesQuery } from "@/redux/api/productsApi"

interface RanksPricesSectionProps {
  asin: string
  marketplaceId: number
  isLoading?: boolean
}

const RanksPricesSection = ({ asin, marketplaceId, isLoading }: RanksPricesSectionProps) => {
  const [activeTab, setActiveTab] = useState<"current" | "30" | "90" | "180" | "all">("current")
  const [isRefetching, setIsRefetching] = useState(false)

  const {
    data: rankingsData,
    isLoading: isLoadingRankings,
    error: rankingsError,
    refetch,
  } = useGetRankingsAndPricesQuery({
    marketplaceId,
    itemAsin: asin,
    period: activeTab,
  })

  const handleRefetch = async () => {
    setIsRefetching(true)
    try {
      await refetch()
    } finally {
      // Add a slight delay so the user can see the refresh animation
      setTimeout(() => {
        setIsRefetching(false)
      }, 500)
    }
  }

  const isLoadingRefetch = isLoadingRankings || isRefetching
  const rankings = rankingsData?.data?.[activeTab.toLowerCase()] ?? {}

  const ranks = {
    netBBPriceChanges: rankings?.net_bb_price_changes?.price ?? "-",
    changePercent: rankings?.net_bb_price_changes?.percentage ? `${rankings.net_bb_price_changes.percentage}%` : "-",
    buyBox: rankings?.buybox ? `${rankings.buybox.toFixed(2)}` : "-",
    amazon: rankings?.amazon ? `${rankings.amazon.toFixed(2)}` : "-",
    lowestFBA: rankings?.lowest_fba ? `${rankings.lowest_fba.toFixed(2)}` : "-",
    lowestFBM: rankings?.lowest_fbm ? `${rankings.lowest_fbm.toFixed(2)}` : "-",
    keepaBSRDrops: rankings?.keepa_bsr_drops ?? "N/A",
    estimatedSales: rankings?.estimated_sales ?? "N/A",
    estTimeToSale: rankings?.estimated_time_to_sale ?? "N/A",
  }

  if (isLoading || (isLoadingRankings && !isRefetching)) {
    return <RanksPricesSectionSkeleton />
  }

  return (
    <div className="border border-border p-4 flex flex-col gap-2 rounded-xl">
      <div className="flex gap-4 items-center justify-between">
        <h2 className="text-lg font-semibold">Ranks & Prices</h2>
        <button
          type="button"
          className="flex gap-1.5 items-center px-3 py-1.5 rounded-md hover:bg-gray-100 outline-none active:scale-95 duration-200"
          onClick={handleRefetch}
          disabled={isLoadingRefetch}
        >
          <div className={isLoadingRefetch ? "animate-spin" : ""}>
            <IoMdRefresh className="size-5" />
          </div>
          {isRefetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* period tabs/filter */}
      <div className="flex items-center gap-1 mt-4">
        {["current", "30", "90", "180", "all"].map((tab) => (
          <button
            key={tab}
            className={`px-3 py-1 rounded-full text-black border capitalize ${
              tab === activeTab ? "bg-[#E7EBFE] border-transparent" : "bg-transparent border-border"
            }`}
            onClick={() => setActiveTab(tab as "current" | "30" | "90" | "180" | "all")}
            disabled={isLoadingRefetch}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoadingRefetch ? (
        <div className="h-40 flex items-center justify-center font-medium">
          {isRefetching ? "Refreshing..." : "Loading..."}
        </div>
      ) : rankingsError ? (
        <div className="h-40 flex items-center justify-center text-red-500 font-medium">Error fetching ranks</div>
      ) : (
        <>
          <div className="p-3 bg-[#F6FEFC] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-12 rounded-2xl bg-[#CEF8F5] text-[#08DCCF] flex items-center justify-center">
                <BsArrowUp className="size-6" />
              </span>
              <span>
                <p className="text-black font-semibold">{ranks.netBBPriceChanges}</p>
                <p>Net BB Price Changes</p>
              </span>
            </div>

            <div className="text-black text-xs bg-[#E7EBFE] rounded-full px-1 flex items-center gap-1">
              <BsArrowUp className="text-primary size-3" /> {ranks.changePercent}
            </div>
          </div>

          <div className="mt-2 text-sm text-[#595959]">
            <div className="flex justify-between py-1">
              <span>Buy Box</span>
              <span className="font-semibold text-black">${ranks.buyBox}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Amazon</span>
              <span className="font-semibold text-black">${ranks.amazon}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Lowest FBA</span>
              <span className="font-semibold text-black">${ranks.lowestFBA}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Lowest FBM</span>
              <span className="font-semibold text-black">${ranks.lowestFBM}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Keepa BSR Drops</span>
              <span className="font-semibold text-black">{ranks.keepaBSRDrops}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Estimated Sales</span>
              <span className="font-semibold text-black">{ranks.estimatedSales}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Est. Time to Sale</span>
              <span className="font-semibold text-black">{ranks.estTimeToSale}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const RanksPricesSectionSkeleton = () => {
  return (
    <div className="border border-border p-4 flex flex-col gap-2 rounded-xl">
      <div className="flex gap-4 items-center justify-between">
        <h2 className="text-lg font-semibold">Ranks & Prices</h2>
        <Skeleton.Button active size="small" />
      </div>
      <div className="flex items-center gap-1 mt-4">
        {["current", "30", "90", "180", "all"].map((tab) => (
          <Skeleton.Button key={tab} active size="small" style={{ width: 60 }} />
        ))}
      </div>
      <Skeleton.Button active size="large" block style={{ height: 80 }} />
      <Skeleton active paragraph={{ rows: 7 }} />
    </div>
  )
}

export default RanksPricesSection
