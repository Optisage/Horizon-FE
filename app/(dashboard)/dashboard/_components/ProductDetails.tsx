"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/redux/hooks"
import { useDispatch } from "react-redux"
import { setIpAlert, setIpIssues } from "@/redux/slice/globalSlice"
import { SearchInput } from "@/app/(dashboard)/_components"
import { useGetBuyboxDetailsQuery, useGetItemQuery, useLazyGetIpAlertQuery } from "@/redux/api/productsApi"
import dayjs from "dayjs"

import ProductHeader from "./prodComponents/product-header"
import ProductInfo from "./prodComponents/product-info"
import ProfitabilityCalculator from "./prodComponents/profitability-calculator"
import ProductStats from "./prodComponents/product-stats"
import OffersSection from "./prodComponents/offers-section"
import RanksPricesSection from "./prodComponents/ranks-prices-section"
import BuyBoxAnalysis from "./prodComponents/buy-box-analysis"
import MarketAnalysis from "./prodComponents/market-analysis"
import SearchResults from "./prodComponents/search-results"
import type { IpAlertData } from "./prodComponents/types"

interface ProductDetailsProps {
  asin: string
  marketplaceId: number
}

interface IpAlertState {
  setIpIssue: number
  eligibility: boolean
}

type Tab = "info" | "totan";

const ProductDetails = ({ asin, marketplaceId }: ProductDetailsProps) => {
  const dispatch = useDispatch()
  const router = useRouter()
  const [getIpAlert] = useLazyGetIpAlertQuery()
  const [ipData, setIpData] = useState<IpAlertData | null>(null)
  const { setIpIssue, eligibility } = useAppSelector(
    (state) => (state?.global?.ipAlert as IpAlertState) || { setIpIssue: 0, eligibility: false },
  )

  const [searchValue, setSearchValue] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [previousPageToken, setPreviousPageToken] = useState<string | null>(null)
  const [currentPageToken, setCurrentPageToken] = useState<string | null>(null)
  const [isPaginationLoading, setIsPaginationLoading] = useState(false)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)

  const [statStartDate, setStatStartDate] = useState(dayjs().format("YYYY-MM-DD"))
  const [statEndDate, setStatEndDate] = useState(dayjs().add(1, "month").format("YYYY-MM-DD"))

  const { data: buyboxDetailsData } = useGetBuyboxDetailsQuery({
    marketplaceId,
    itemAsin: asin,
  });
  
  const { data, error, isLoading } = useGetItemQuery({
    marketplaceId,
    itemAsin: asin,
  })

  // Debounce input to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchValue), 500)
    return () => clearTimeout(handler)
  }, [searchValue])

  // Fetch IP data
  useEffect(() => {
    const fetchIpData = async () => {
      try {
        const response = await getIpAlert({
          itemAsin: asin,
          marketplaceId,
          statStartDate,
          statEndDate,
        }).unwrap()
        dispatch(
          setIpAlert({
            setIpIssue: response?.data?.ip_analysis?.issues?.length ?? 0,
            eligibility: response?.data?.eligible_to_sell ?? false,
          }),
        )
        dispatch(setIpIssues(response?.data?.ip_analysis?.issues ?? []))
        setIpData(response.data as IpAlertData)
      } catch (error) {
        console.error("Error fetching IP alert:", error)
      }
    }

    if (asin && marketplaceId) {
      fetchIpData()
    }
  }, [asin, marketplaceId, dispatch, getIpAlert, statStartDate, statEndDate])

  if (error) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center">
        <h2 className="font-semibold">Error loading product details</h2>
        <p className="text-sm">Product might not be available in the selected country</p>
      </div>
    )
  }

 

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      <SearchInput value={searchValue} onChange={setSearchValue} />

      {/* Show product details when there's no search */}
      {!debouncedSearch && (
        <main className="flex flex-col gap-5">
          <ProductHeader product={data?.data} />

          {/* grid */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* left */}
            <div className="flex flex-col gap-5">
              <ProductInfo
                product={data?.data}
                ipData={ipData}
                eligibility={eligibility}
                setIpIssue={setIpIssue}
                asin={asin}
                marketplaceId={marketplaceId}
                isLoading={isLoading}
              />
              <ProfitabilityCalculator
                asin={asin}
                marketplaceId={marketplaceId}
                product={data?.data}
                isLoading={isLoading}
              />
              <ProductStats product={data?.data}  buyboxDetails={buyboxDetailsData?.data} isLoading={isLoading} />
            </div>

            {/* right */}
            <div className="flex flex-col gap-5">
              <OffersSection asin={asin} marketplaceId={marketplaceId} router={router} isLoading={isLoading} />
              <RanksPricesSection asin={asin} marketplaceId={marketplaceId} isLoading={isLoading} />
              <BuyBoxAnalysis
                asin={asin}
                marketplaceId={marketplaceId}
                statStartDate={statStartDate}
                statEndDate={statEndDate}
                onDateChange={(dates: dayjs.Dayjs | [dayjs.Dayjs, dayjs.Dayjs]) => {
                  if (Array.isArray(dates) && dates.length === 2) {
                    const [startDate, endDate] = dates
                    setStatStartDate(startDate.format("YYYY-MM-DD"))
                    setStatEndDate(endDate.format("YYYY-MM-DD"))
                  }
                }}
                isLoading={isLoading}
              />
              <MarketAnalysis asin={asin} marketplaceId={marketplaceId} isLoading={isLoading} />
            </div>
          </div>
        </main>
      )}

      {/* Show search results when there's a search and results */}
      {debouncedSearch && (
        <SearchResults
          debouncedSearch={debouncedSearch}
          marketplaceId={marketplaceId}
          currentPageToken={currentPageToken}
          setNextPageToken={setNextPageToken}
          setPreviousPageToken={setPreviousPageToken}
          router={router}
          isLoading={isPaginationLoading}
          onPagination={{
            onNext: () => {
              setIsPaginationLoading(true)
              setCurrentPageToken(nextPageToken)
            },
            onPrevious: () => {
              setIsPaginationLoading(true)
              setCurrentPageToken(previousPageToken)
            },
            hasNext: !!nextPageToken,
            hasPrevious: !!previousPageToken,
          }}
        />
      )}
    </section>
  )
}

export default ProductDetails
