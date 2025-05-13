"use client"
import { useState } from "react"
import { Skeleton, Tooltip as AntTooltip } from "antd"
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

  // Helper function to get the tooltip for timeframe buttons
  const getTimeframeTooltip = (tab: string) => {
    switch(tab) {
      case "current":
        return "Current data at this moment";
      case "30":
        return "Data from the last 30 days";
      case "90":
        return "Data from the last 90 days";
      case "180":
        return "Data from the last 180 days";
      case "all":
        return "All historical data available";
      default:
        return "";
    }
  };

  if (isLoading || (isLoadingRankings && !isRefetching)) {
    return <RanksPricesSectionSkeleton />
  }

  return (
    <div className="border border-border p-4 flex flex-col gap-2 rounded-xl">
      <div className="flex gap-4 items-center justify-between">
        <h2 className="text-lg font-semibold">Ranks & Prices</h2>
        <AntTooltip title="Refresh data to get the latest rankings and prices" placement="top">
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
        </AntTooltip>
      </div>

      {/* period tabs/filter */}
      <div className="flex items-center gap-1 mt-4">
        {["current", "30", "90", "180", "all"].map((tab) => (
          <AntTooltip key={tab} title={getTimeframeTooltip(tab)} placement="top">
            <button
              className={`px-3 py-1 rounded-full text-black border capitalize ${
                tab === activeTab ? "bg-[#E7EBFE] border-transparent" : "bg-transparent border-border"
              }`}
              onClick={() => setActiveTab(tab as "current" | "30" | "90" | "180" | "all")}
              disabled={isLoadingRefetch}
            >
              {tab}
            </button>
          </AntTooltip>
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
                <AntTooltip title={`Net change in Buy Box price: ${ranks.netBBPriceChanges}`} placement="top">
                  <p className="text-black font-semibold">{ranks.netBBPriceChanges}</p>
                </AntTooltip>
                <p>Net BB Price Changes</p>
              </span>
            </div>

            <AntTooltip title={`Percentage change in Buy Box price: ${ranks.changePercent}`} placement="top">
              <div className="text-black text-xs bg-[#E7EBFE] rounded-full px-1 flex items-center gap-1">
                <BsArrowUp className="text-primary size-3" /> {ranks.changePercent}
              </div>
            </AntTooltip>
          </div>

          <div className="mt-2 text-sm text-[#595959]">
            <div className="flex justify-between py-1">
              <AntTooltip title="The current price of the product in the Buy Box - the featured offer shown on the product detail page." placement="top">
                <span>Buy Box</span>
              </AntTooltip>
              <AntTooltip title={`Current Buy Box price: $${ranks.buyBox}`} placement="top">
                <span className="font-semibold text-black">${ranks.buyBox}</span>
              </AntTooltip>
            </div>
            <div className="flex justify-between py-1">
              <AntTooltip title="The price of the product when sold directly by Amazon as the seller." placement="top">
                <span>Amazon</span>
              </AntTooltip>
              <AntTooltip title={`Current Amazon price: $${ranks.amazon}`} placement="top">
                <span className="font-semibold text-black">${ranks.amazon}</span>
              </AntTooltip>
            </div>
            <div className="flex justify-between py-1">
              <AntTooltip title="The lowest price offered by third-party sellers using Fulfillment by Amazon (FBA)." placement="top">
                <span>Lowest FBA</span>
              </AntTooltip>
              <AntTooltip title={`Lowest FBA price: $${ranks.lowestFBA}`} placement="top">
                <span className="font-semibold text-black">${ranks.lowestFBA}</span>
              </AntTooltip>
            </div>
            <div className="flex justify-between py-1">
              <AntTooltip title="The lowest price offered by third-party sellers using Fulfillment by Merchant (FBM)." placement="top">
                <span>Lowest FBM</span>
              </AntTooltip>
              <AntTooltip title={`Lowest FBM price: $${ranks.lowestFBM}`} placement="top">
                <span className="font-semibold text-black">${ranks.lowestFBM}</span>
              </AntTooltip>
            </div>
            <div className="flex justify-between py-1">
              <AntTooltip title="The number of times a product's Best Seller Rank has significantly dropped, indicating increased sales velocity, according to Keepa tracking data." placement="top">
                <span>Keepa BSR Drops</span>
              </AntTooltip>
              <AntTooltip title={`Keepa Best Seller Rank drops: ${ranks.keepaBSRDrops}`} placement="top">
                <span className="font-semibold text-black">{ranks.keepaBSRDrops}</span>
              </AntTooltip>
            </div>
            <div className="flex justify-between py-1">
              <AntTooltip title="The projected number of units this product sells per month based on sales rank and category." placement="top">
                <span>Estimated Sales</span>
              </AntTooltip>
              <AntTooltip title={`Estimated monthly sales: ${ranks.estimatedSales} units`} placement="top">
                <span className="font-semibold text-black">{ranks.estimatedSales}</span>
              </AntTooltip>
            </div>
            <div className="flex justify-between py-1">
              <AntTooltip title="The estimated time it would take to sell through inventory based on current sales velocity." placement="top">
                <span>Est. Time to Sale</span>
              </AntTooltip>
              <AntTooltip title={`Estimated time to sell inventory: ${ranks.estTimeToSale}`} placement="top">
                <span className="font-semibold text-black">{ranks.estTimeToSale}</span>
              </AntTooltip>
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
