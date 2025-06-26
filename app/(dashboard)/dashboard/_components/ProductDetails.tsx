"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/redux/hooks"
import { useDispatch } from "react-redux"
import { setIpAlert, setIpIssues } from "@/redux/slice/globalSlice"
import { SearchInput } from "@/app/(dashboard)/_components"
import {
  useGetBuyboxDetailsQuery,
  useGetItemQuery,
  useGetMarketAnalysisQuery,
  useLazyGetIpAlertQuery,
} from "@/redux/api/productsApi"
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
import FinalLoader from "./loader"

interface ProductDetailsProps {
  asin: string
  marketplaceId: number
}

interface IpAlertState {
  setIpIssue: number
  eligibility: boolean
}

const ProductDetails = ({ asin, marketplaceId }: ProductDetailsProps) => {
  const productStatsRef = useRef<{ handleProfitabilityUpdate: (data: any) => void } | null>(null)
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

  // Track marketplace changes for loader
  const [isMarketplaceChanging, setIsMarketplaceChanging] = useState(false)
  const [isLoadingIpData, setIsLoadingIpData] = useState(false)
  const previousMarketplaceId = useRef(marketplaceId)

  // Loading step state
  const [loadingStep, setLoadingStep] = useState(0)
  const [isFullyLoaded, setIsFullyLoaded] = useState(false)
  const hasMounted = useRef(false)

  // RTK Query hooks with isFetching
  const {
    data: buyboxDetailsData,
    isLoading: isLoadingBuybox,
    isFetching: isFetchingBuybox,
  } = useGetBuyboxDetailsQuery({
    marketplaceId,
    itemAsin: asin,
  })

  const {
    data,
    error,
    isLoading: isLoadingItem,
    isFetching: isFetchingItem,
  } = useGetItemQuery({
    marketplaceId,
    itemAsin: asin,
  })

  const {
    data: marketAnalysisData,
    isLoading: isLoadingMarketAnalysis,
    isFetching: isFetchingMarketAnalysis,
  } = useGetMarketAnalysisQuery({
    marketplaceId,
    itemAsin: asin,
    statStartDate: dayjs().format("YYYY-MM-DD"),
    statEndDate: dayjs().add(1, "month").format("YYYY-MM-DD"),
  })

  // Combined fetching state
  const isAnyQueryFetching = isFetchingItem || isFetchingBuybox || isFetchingMarketAnalysis || isLoadingIpData

  // Show loader when marketplace changes or any query is fetching
  const shouldShowLoader = isMarketplaceChanging || isAnyQueryFetching

  const buyboxWinner = buyboxDetailsData?.data?.buybox?.find((offer: any) => offer.is_buybox_winner)
  const buyboxWinnerPrice = buyboxWinner?.listing_price || 0

  const fbaOffers = buyboxDetailsData?.data?.buybox?.filter((offer: any) => offer.seller_type === "FBA")
  const fbmOffers = buyboxDetailsData?.data?.buybox?.filter((offer: any) => offer.seller_type === "FBM")

  const lowestFBAPrice = fbaOffers?.length ? Math.min(...fbaOffers.map((o: any) => o.listing_price)) : 0
  const lowestFBMPrice = fbmOffers?.length ? Math.min(...fbmOffers.map((o: any) => o.listing_price)) : 0
  const monthlySales = data?.data?.sales_statistics?.estimated_sales_per_month?.amount

  // Debounce input to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchValue), 500)
    return () => clearTimeout(handler)
  }, [searchValue])

  // Track marketplace changes
  useEffect(() => {
    if (previousMarketplaceId.current !== marketplaceId) {
      setIsMarketplaceChanging(true)
      previousMarketplaceId.current = marketplaceId

      // Reset states when marketplace changes
      setIpData(null)
      dispatch(
        setIpAlert({
          setIpIssue: 0,
          eligibility: false,
        }),
      )
      dispatch(setIpIssues([] as any))
      setLoadingStep(0)
    }
  }, [marketplaceId, dispatch])

  // Reset marketplace changing state when all queries finish
  useEffect(() => {
    if (isMarketplaceChanging && !isAnyQueryFetching) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsMarketplaceChanging(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isMarketplaceChanging, isAnyQueryFetching])

  // Reset IP data immediately when ASIN changes
  useEffect(() => {
    setIpData(null)
    dispatch(
      setIpAlert({
        setIpIssue: 0,
        eligibility: false,
      }),
    )
    dispatch(setIpIssues([] as any))
    setIsLoadingIpData(true)
    setLoadingStep(0)
  }, [asin, dispatch])

  // Fetch IP data
  useEffect(() => {
    const fetchIpData = async () => {
      setIsLoadingIpData(true)
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
        setLoadingStep((prev) => Math.min(prev + 1, 4))
      } catch (error) {
        console.error("Error fetching IP alert:", error)
      } finally {
        setIsLoadingIpData(false)
      }
    }

    if (asin && marketplaceId) {
      fetchIpData()
    }
  }, [asin, marketplaceId, dispatch, getIpAlert, statStartDate, statEndDate])

  // Update loading steps based on API responses
  useEffect(() => {
    if (!isLoadingItem && data) {
      setLoadingStep((prev) => Math.min(prev + 1, 4))
    }
  }, [isLoadingItem, data])

  useEffect(() => {
    if (!isLoadingBuybox && buyboxDetailsData) {
      setLoadingStep((prev) => Math.min(prev + 1, 4))
    }
  }, [isLoadingBuybox, buyboxDetailsData])

  useEffect(() => {
    if (!isLoadingMarketAnalysis && marketAnalysisData) {
      setLoadingStep((prev) => Math.min(prev + 1, 4))
    }
  }, [isLoadingMarketAnalysis, marketAnalysisData])

  // Set fully loaded when all steps are complete
  useEffect(() => {
    if (loadingStep >= 4 && 
        !isLoadingItem && 
        !isLoadingBuybox && 
        !isLoadingIpData && 
        !isLoadingMarketAnalysis &&
        !hasMounted.current
      ) {
      hasMounted.current = true
      const timer = setTimeout(() => {
        setIsFullyLoaded(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [loadingStep, isLoadingItem, isLoadingBuybox, isLoadingIpData, isLoadingMarketAnalysis])

  if (error) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center">
        <h2 className="font-semibold">Error loading product details</h2>
        <p className="text-sm">Product might not be available in the selected country</p>
      </div>
    )
  }

  const handleCalculationComplete = (data: any) => {
    if (productStatsRef.current) {
      productStatsRef.current.handleProfitabilityUpdate(data)
    }
  }

  const offers = buyboxDetailsData?.data?.buybox || []

  return (
    <>
      {/* Full screen loader overlay */}
      {shouldShowLoader && (
        <div className="fixed inset-0 pl-20 flex items-center justify-center bg-white z-50">
          <div className=" w-[80%]">
          <FinalLoader currentStep={loadingStep} />
          </div>
        </div>
      )}

      <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
        <SearchInput value={searchValue} onChange={setSearchValue} />

        {/* Show product details when there's no search */}
        {!debouncedSearch && (
          <main className="flex flex-col gap-5">
            <ProductHeader
              product={data?.data}
              buyboxWinnerPrice={buyboxWinnerPrice}
              lowestFBAPrice={lowestFBAPrice}
              lowestFBMPrice={lowestFBMPrice}
              monthlySales={monthlySales}
              sellerCount={buyboxDetailsData?.data?.buybox?.length || 0}
              fbaSellers={fbaOffers?.length || 0}
              fbmSellers={fbmOffers?.length || 0}
              stockLevels={buyboxDetailsData?.data?.buybox?.reduce(
                (sum: number, seller: any) => sum + (seller.stock_quantity || 0),
                0,
              )}
            />

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
                  isLoading={false}
                  isLoadingIpData={isLoadingIpData}
                />
                <ProfitabilityCalculator
                  asin={asin}
                  marketplaceId={marketplaceId}
                  product={data?.data}
                  isLoading={false}
                  offers={offers}
                  onCalculationComplete={handleCalculationComplete}
                />
                <ProductStats
                  product={data?.data}
                  buyboxDetails={buyboxDetailsData?.data}
                  isLoading={false}
                  ref={productStatsRef}
                />
              </div>

              {/* right */}
              <div className="flex flex-col gap-5">
                <OffersSection asin={asin} marketplaceId={marketplaceId} router={router} isLoading={false} />
                <RanksPricesSection asin={asin} marketplaceId={marketplaceId} isLoading={false} />
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
                  isLoading={false}
                />
                <MarketAnalysis
                  asin={asin}
                  marketplaceId={marketplaceId}
                  isLoading={false}
                  data={marketAnalysisData?.data}
                />
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
    </>
  )
}

export default ProductDetails