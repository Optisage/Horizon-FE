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

// StatCard component for displaying product statistics with tooltips
const StatCard = ({
  icon,
  title,
  value,
  tooltip,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  tooltip: string;
  bgColor: string;
}) => (
  <div className="flex flex-col gap-2 p-4 border border-border rounded-xl">
    <div className="flex items-center gap-2">
      <span
        className="size-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        {icon}
      </span>
      <div className="flex items-center">
        <AntTooltip title={tooltip} placement="top">
          <h3 className="text-sm font-medium text-gray-700 cursor-help border-b border-dotted border-gray-400">
            {title}
          </h3>
        </AntTooltip>
      </div>
    </div>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

const ProductDetails = ({ asin, marketplaceId }: ProductDetailsProps) => {
  const dispatch = useDispatch()
  const router = useRouter()
  const [getIpAlert] = useLazyGetIpAlertQuery()
  const [ipData, setIpData] = useState<IpAlertData | null>(null)
  const { setIpIssue, eligibility } = useAppSelector(
    (state) => (state?.global?.ipAlert as IpAlertState) || { setIpIssue: 0, eligibility: false },
  )

  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [previousPageToken, setPreviousPageToken] = useState<string | null>(
    null
  );
  const [currentPageToken, setCurrentPageToken] = useState<string | null>(null);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  
  const currencySymbol = "$"; // Default currency symbol
  
  const [itemsToShow, setItemsToShow] = useState(10); // Show 10 items
  const [loading, setLoading] = useState(false); // Add loading state
  const [costPrice, setCostPrice] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>("");
  const [storageMonths, setStorageMonths] = useState(0);
  const [fulfillmentType, setFulfillmentType] = useState("FBA");
  const [activeTab, setActiveTab] = useState("maximumCost");
  // const [selectedDate, setSelectedDate] = useState(dayjs());
  const [statStartDate, setStatStartDate] = useState(
    dayjs().format("YYYY-MM-DD")
  ); // For date range start
  const [statEndDate, setStatEndDate] = useState(
    dayjs().add(1, "month").format("YYYY-MM-DD")
  ); // For date range end

  const [statStartDate2, setStatStartDate2] = useState(
    dayjs().format("YYYY-MM-DD")
  ); // For date range start
  const [statEndDate2, setStatEndDate2] = useState(
    dayjs().add(1, "month").format("YYYY-MM-DD")
  ); // For date range end

  const [calculateProfitability] = useCalculateProfitablilityMutation();

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
  }, [asin, marketplaceId, dispatch, getIpAlert, statStartDate, statEndDate]);

  const {
    data: buyboxDetailsData,
    isLoading: isLoadingBuyboxDetails,
    // error: buyboxDetailsError,
  } = useGetBuyboxDetailsQuery({
    marketplaceId,
    itemAsin: asin,
  });

  const buyboxDetails: BuyboxItem[] = buyboxDetailsData?.data?.buybox ?? [];
  const buyboxWinnerPrice =
    buyboxDetails.find((offer) => offer.is_buybox_winner)?.listing_price ?? 0;
    
  // Product Statistics Section
  const renderProductStatistics = () => {
    if (isLoading || isLoadingBuyboxDetails) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} active paragraph={{ rows: 2 }} />
          ))}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BSRIcon />}
          title="Best Seller Rank"
          value={product?.best_seller_rank || "N/A"}
          tooltip="Amazon's Best Seller Rank indicates how well a product is selling compared to other products in its category. Lower numbers mean better sales performance."
          bgColor="#F3E5F5"
        />
        <StatCard
          icon={<PriceTagIcon />}
          title="Current Price"
          value={`${currencySymbol}${buyboxWinnerPrice.toFixed(2) || "N/A"}`}
          tooltip="The current winning Buy Box price for this product. This is the price most customers will see when viewing the product."
          bgColor="#E8F5E9"
        />
        <StatCard
          icon={<ProductSalesIcon />}
          title="Estimated Sales"
          value={product?.sales_statistics?.estimated_sales_per_month?.amount?.toLocaleString() || "N/A"}
          tooltip="Estimated monthly sales volume for this product based on historical data and market analysis."
          bgColor="#E3F2FD"
        />
        <StatCard
          icon={<ROIIcon />}
          title="ROI Potential"
          value={`${ROI.toFixed(2)}%` || "N/A"}
          tooltip="Return on Investment potential based on current market conditions, pricing, and fees. Higher percentages indicate better profit potential."
          bgColor="#EDE7F6"
        />
      </div>
    );
  };

  // calculating profitability
  // Memoize the calculation handler
  const handleCalculateProfitability = useCallback(async () => {
    if (!costPrice || !buyboxDetails) return; // Skip if no cost price

    setIsCalculating(true);
    try {
      const body = {
        asin: asin,
        marketplaceId: `${marketplaceId}`,
        isAmazonFulfilled: fulfillmentType === "FBA",
        currencyCode: currencyCode,
        storage: storageMonths,
        costPrice: costPrice,
        salePrice: salePrice || buyboxWinnerPrice,
        pointsNumber: 0,
        pointsAmount: 0,
      };

      const response = await calculateProfitability({ body }).unwrap();
      if (response.status === 200) {
        setResponseData({
          fba: response.data.fba,
          fbm: response.data.fbm,
        });
        const data =
          fulfillmentType === "FBA" ? response.data.fba : response.data.fbm;
        updateUIWithData(data);
      }
    } catch (error) {
      console.error("Calculation error:", error);
      message.error("Calculation failed. Please check your inputs.");
    } finally {
      setIsCalculating(false);
    }
  }, [costPrice, salePrice, storageMonths, fulfillmentType]);

  const debouncedCalculation = useCallback(
    debounce(() => handleCalculateProfitability(), 500),
    [handleCalculateProfitability]
  );

  useEffect(() => {
    debouncedCalculation();
    return () => debouncedCalculation.cancel();
  }, [
    costPrice,
    salePrice,
    storageMonths,
    fulfillmentType,
    debouncedCalculation,
  ]);

  // Helper function to update UI with selected data
  const updateUIWithData = (data: ProfitabilityData): void => {
    setFees({
      referralFee: data.referralFee,
      fulfillmentType: data.fulfillmentType,
      fullfillmentFee: data.fullfillmentFee,
      closingFee: data.closingFee,
      storageFee: data.storageFee,
      prepFee: parseFloat(data.prepFee as string),
      shippingFee: parseFloat(data.shippingFee as string),
      digitalServicesFee: data.digitalServicesFee,
      miscFee: parseFloat(data.miscFee as string),
    });
    setROI(data.roi);
    setMinROI(data.minRoi);
    setMinProfit(data.minProfit);
    setProfitAmount(data.profitAmount);
    setMaxCost(data.maxCost);
    setTotalFees(data.totalFees);
    setVatOnFees(data.vatOnFees);
    setDiscount(data.discount);
    setProfitMargin(data.profitMargin);
    setBreakEvenPrice(data.breakevenSalePrice);
    setEstimatedPayout(data.estimatedAmzPayout);
  };

  const [activeTab4, setActiveTab4] = useState<
    "current" | "30" | "90" | "180" | "all"
  >("current");
  const [isRefetching, setIsRefetching] = useState(false);
  const [activeTab5, setActiveTab5] = useState("offers");
  const [activeTab6, setActiveTab6] = useState<Tab>("info");

  const router = useRouter();

  const { currencyCode } = useAppSelector((state) => state.global) || {};

  const {
    data: buyboxData,
    isLoading: isLoadingBuybox,
    error: buyboxError,
  } = useGetBuyboxInfoQuery({
    marketplaceId,
    itemAsin: asin,
    statStartDate,
    statEndDate,
  });

  const {
    data: rankingsData,
    isLoading: isLoadingRankings,
    error: rankingsError,
    refetch,
  } = useGetRankingsAndPricesQuery({
    marketplaceId,
    itemAsin: asin,
    period: activeTab4,
  });

  const {
    data: marketAnalysisData,
    error: marketAnalysisError,
    isLoading: isLoadingMarketAnalysis,
  } = useGetMarketAnalysisQuery({
    marketplaceId,
    itemAsin: asin,
    statStartDate: statStartDate2,
    statEndDate: statEndDate2,
  });

  const handleDateChange = (date: dayjs.Dayjs | [dayjs.Dayjs, dayjs.Dayjs]) => {
    if (Array.isArray(date)) {
      // Handle date range selection
      const [startDate, endDate] = date;
      setStatStartDate(startDate.format("YYYY-MM-DD"));
      setStatEndDate(endDate.format("YYYY-MM-DD"));
    } else {
      // Handle single date selection
      // setSelectedDate(date);
    }
  };

  const handleDateChange2 = (
    date2: dayjs.Dayjs | [dayjs.Dayjs, dayjs.Dayjs]
  ) => {
    if (Array.isArray(date2)) {
      // Handle date range selection
      const [startDate2, endDate2] = date2;
      setStatStartDate2(startDate2.format("YYYY-MM-DD"));
      setStatEndDate2(endDate2.format("YYYY-MM-DD"));
    } else {
      // Handle single date selection
      // setSelectedDate(date);
    }
  };

  // Transform the API data to match the chart's expected format
  const transformData = (
    data: MarketAnalysisData | undefined
  ): MergedDataPoint[] => {
    if (!data) return [];

    const buyboxMap = new Map(
      data.buybox.map((item) => [dayjs(item.date).format("MMM D"), item.price])
    );

    const amazonMap = new Map(
      data.amazon.map((item) => [dayjs(item.date).format("MMM D"), item.price])
    );

    const allDates = new Set([
      ...Array.from(buyboxMap.keys()),
      ...Array.from(amazonMap.keys()),
    ]);

    const mergedData: MergedDataPoint[] = Array.from(allDates).map((date) => ({
      date,
      buyBox: buyboxMap.get(date) ?? null,
      amazon: amazonMap.get(date) ?? null,
    }));

    return mergedData.sort((a, b) =>
      dayjs(a.date, "MMM D").isBefore(dayjs(b.date, "MMM D")) ? -1 : 1
    );
  };

  const chartData = transformData(marketAnalysisData?.data);

  // Fetch products
  const {
    data: searchData,
    error: searchError,
    isLoading: isLoadingSearch,
  } = useSearchItemsQuery(
    debouncedSearch
      ? {
          q: debouncedSearch,
          marketplaceId: marketplaceId,
          //pageSize: itemsPerPage,
          pageToken: currentPageToken,
        }
      : undefined,
    { skip: !debouncedSearch }
  );

  // Update pagination tokens from API response
  useEffect(() => {
    if (searchData?.data?.pagination) {
      setNextPageToken(searchData.data.pagination.nextPageToken);
      setPreviousPageToken(searchData.data.pagination.previousPageToken);
    }
  }, [searchData]);

  // Reset pagination loading when data changes
  useEffect(() => {
    if (searchData || searchError) {
      setIsPaginationLoading(false);
    }
  }, [searchData, searchError]);

  // Debounce input to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchValue), 500);
    return () => clearTimeout(handler);
  }, [searchValue]);

  if (
    // isLoadingBuybox ||
    isLoadingBuyboxDetails ||
    isLoading ||
    isLoadingRankings ||
    isPaginationLoading
  )
    // return <Loader />;
    return (
      <div className="h-[50dvh] flex justify-center items-center">
        <CircularLoader
          duration={3500}
          color="#18CB96"
          size={64}
          strokeWidth={4}
        />
      </div>
    );

  const buybox: BuyboxItem[] = buyboxData?.data?.buybox ?? [];

  const extra = buyboxDetailsData?.data?.extra;
  const rankings = rankingsData?.data?.[activeTab4.toLowerCase()] ?? {};

  // To have more colors
  const colorPalette = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF"];
  const pieData =
    buybox?.map((seller, index) => ({
      name: seller.seller,
      value: seller.weight_percentage,
      color: colorPalette[index % colorPalette.length], // Cycles through predefined colors
    })) || [];

  const ranks = {
    netBBPriceChanges: rankings?.net_bb_price_changes?.price ?? "-",
    changePercent: rankings?.net_bb_price_changes?.percentage
      ? `${rankings.net_bb_price_changes.percentage}%`
      : "-",
    buyBox: rankings?.buybox ? `${rankings.buybox.toFixed(2)}` : "-",
    amazon: rankings?.amazon ? `${rankings.amazon.toFixed(2)}` : "-",
    lowestFBA: rankings?.lowest_fba ? `${rankings.lowest_fba.toFixed(2)}` : "-",
    lowestFBM: rankings?.lowest_fbm ? `${rankings.lowest_fbm.toFixed(2)}` : "-",
    keepaBSRDrops: rankings?.keepa_bsr_drops ?? "N/A",
    estimatedSales: rankings?.estimated_sales ?? "N/A",
    estTimeToSale: rankings?.estimated_time_to_sale ?? "N/A",
  };

  const handleRefetch = async () => {
    setIsRefetching(true);
    try {
      await refetch();
    } finally {
      // Add a slight delay so the user can see the refresh animation
      setTimeout(() => {
        setIsRefetching(false);
      }, 500);
    }
  };

  const isLoadingRefetch = isLoadingRankings || isRefetching;

  // Sort buyboxDetails by price in ascending order
  const sortedBuyboxDetails = [...buyboxDetails].sort(
    (a, b) => a.listing_price - b.listing_price
  );

  const offersData = {
    offers: sortedBuyboxDetails.map((offer: BuyboxItem, index: number) => ({
      id: index + 1,
      seller: offer.seller || "N/A",
      rating: offer.rating || "N/A",
      review_count: offer.review_count || "N/A",
      stock: offer.stock_quantity || "N/A",
      price: offer.listing_price ? `${offer.listing_price.toFixed(2)}` : "N/A",
      buyboxShare:
        offer.weight_percentage != null ? `${offer.weight_percentage}%` : "N/A",
      leader: offer.is_buybox_winner || false,
      seller_id: offer.seller_id || "N/A",
      seller_type: offer.seller_type || "N/A",
    })),
  };

  // for sales price in calculator

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalePrice(e.target.value);
  };

  const sellerFeedbackData = sortedBuyboxDetails.map(
    (seller: BuyboxItem, index: number) => ({
      id: index + 1,
      seller: seller.seller,
      rating: seller.rating,
      review_count: seller.review_count,
      sellerId: seller.seller_id,
      seller_type: seller.seller_type,
      avgPrice: `${seller.seller_feedback?.avg_price?.toFixed(2) ?? "N/A"}`,
      won: `${seller.seller_feedback?.percentage_won ?? 0}%`,
      lastWon: seller.seller_feedback?.last_won
        ? new Date(seller.seller_feedback.last_won).toLocaleString()
        : "N/A",
    })
  );

  const displayedOffers = offersData.offers.slice(0, itemsToShow);
  const displayedFeedback = sellerFeedbackData.slice(0, itemsToShow);
  const fbaCount = offersData.offers.filter(
    (o) => o.seller_type === "FBA"
  ).length;
  const fbmCount = offersData.offers.filter(
    (o) => o.seller_type === "FBM"
  ).length;
  const amzCount = offersData.offers.filter(
    (o) => o.seller_type === "AMZ"
  ).length;

  const handleLoadMore = () => {
    setLoading(true); // Start loading
    setTimeout(() => {
      setItemsToShow(itemsToShow + 10); // Load more items
      setLoading(false); // Stop loading
    }, 2000); // Simulate a 2-second delay
  };

  const renderStars = (rating: number | undefined) => {
    const validRating = Math.floor(rating ?? 0);

    if (validRating <= 0) {
      return <span className="text-gray-400">N/A</span>;
    }

    return Array.from({ length: validRating }, (_, index) => (
      <span key={index} className="text-[#FFD700] text-lg">
        ★
      </span>
    ));
  };

  const products =
    debouncedSearch && searchData?.data?.items
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        searchData.data.items.map((item: any) => ({
          asin: item.basic_details.asin,
          image: item.basic_details.product_image,
          title: item.basic_details.product_name,
          rating: item.basic_details.rating.stars,
          reviews: item.basic_details.rating.count,
          category: item.basic_details.category,
          vendor: item.basic_details.vendor,
          sales_statistics: item.sales_statistics,
          buybox_timeline: item.buybox_timeline,
        }))
      : [];

  if (isLoadingBuybox || isLoading || isLoadingRankings || isLoadingSearch)
    return (
      <div className="h-[50dvh] flex justify-center items-center">
        <CircularLoader
          duration={3500}
          color="#18CB96"
          size={64}
          strokeWidth={4}
        />
      </div>
    );

  if (error)
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
              {/* product details */}
              <div className="border border-border px-4 pt-4 rounded-xl flex flex-col gap-4">
                <div className="grid xl:grid-cols-[2fr_5fr] gap-3">
                  <div className="size-[150px] overflow-hidden rounded-lg">
                    <Image
                      src={product?.product_image || ProductThumbnail}
                      alt="thumbnail"
                      className="size-[150px] object-cover"
                      width={150}
                      height={150}
                      quality={90}
                      priority
                      unoptimized
                    />
                  </div>

                  <div className="text-[#595959]">
                    <h2 className="text-[#252525] font-semibold text-lg md:text-xl">
                      {product?.product_name}
                    </h2>
                    <p>{product?.category}</p>
                    <p>
                      ASIN: {product?.asin}, UPC: {product?.upc}
                    </p>
                    <p className="flex items-center gap-1">
                      <AntTooltip title="Average customer rating out of 5 stars. Higher ratings typically indicate better customer satisfaction and product quality." placement="top">
                        <span className="cursor-help">
                          ⭐⭐⭐⭐⭐ {product?.rating?.stars}/5
                        </span>
                      </AntTooltip>
                      
                      <span className="ml-2">
                        {product?.rating?.count && (
                          <AntTooltip title="The total number of customer reviews. More reviews generally indicate a more established product with reliable feedback." placement="top">
                            <span className="cursor-help border-b border-dotted border-gray-400">
                              ({product.rating.count} reviews)
                            </span>
                          </AntTooltip>
                        )}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-[#F5F3FF] rounded-t-lg flex items-center gap-4 justify-between">
                  <div className="flex flex-col gap-4">
                    <span className="flex flex-col gap-2">
                      {eligibility ? (
                        <p className="text-green-500 font-semibold">
                          You are authorised to sell this product
                        </p>
                      ) : (
                        <p className="text-red-500 font-semibold">
                          You are not authorized to sell this product
                        </p>
                      )}
                      <p
                        className={`text-sm ${
                          setIpIssue ? "text-red-500" : "text-[#09090B]"
                        }`}
                      >
                        {setIpIssue === 1
                          ? "There is 1 issue"
                          : setIpIssue > 1
                          ? `There are ${setIpIssue} issues`
                          : "No issues found"}
                      </p>
                    </span>

                    <div>
                      <AlertsDrawer
                        itemAsin={asin}
                        productName={product?.product_name}
                        eligibility={eligibility}
                        ipIssuesCount={setIpIssue}
                        ipData={ipData}
                      />
                    </div>
                  </div>

                  <div>
                    <Image
                      src={Illustration}
                      alt="illustration"
                      className="w-[144px] object-cover"
                      width={144}
                      height={138}
                    />
                  </div>
                </div>
              </div>

              {/* Profitablility Calculator */}
              <div className="flex flex-col gap-4">
                {/* Profitability Calculator Header */}
                <h2 className="font-semibold text-lg">
                  Profitability Calculator
                </h2>

                {/* Fulfillment Type Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 md:items-center justify-between p-3 rounded-xl bg-[#FAFAFA]">
                  <h2 className="font-semibold text-black">Fulfilment Type</h2>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSwitching(true);
                        setFulfillmentType("FBA");

                        setTimeout(() => {
                          if (responseData.fba) {
                            updateUIWithData(responseData.fba);
                          }
                          setIsSwitching(false);
                        }, 1000);
                      }}
                      className={`px-3 py-1 rounded-full text-black border ${
                        fulfillmentType === "FBA"
                          ? "bg-[#E7EBFE]"
                          : "bg-transparent border-border"
                      }`}
                    >
                      FBA
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSwitching(true);
                        setFulfillmentType("FBM");

                        setTimeout(() => {
                          if (responseData.fbm) {
                            updateUIWithData(responseData.fbm);
                          }
                          setIsSwitching(false);
                        }, 1000);
                      }}
                      className={`px-3 py-1 rounded-full text-black border ${
                        fulfillmentType === "FBM"
                          ? "bg-[#E7EBFE]"
                          : "bg-transparent border-border"
                      }`}
                    >
                      FBM
                    </button>
                  </div>
                </div>

                {/* Price Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-600">Cost Price</label>
                    <input
                      aria-label="Cost Price"
                      type="number"
                      placeholder={lastCostPrice}
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      onBlur={(e) => {
                        try {
                          const result = evaluate(e.target.value);
                          setCostPrice(result.toString());
                        } catch {
                          message.error("Invalid mathematical expression");
                          console.error("Invalid mathematical expression");
                        }
                      }}
                      className="px-4 py-1.5 w-full border rounded outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-600">Sale Price</label>
                    <input
                      aria-label="Sale Price"
                      type="number"
                      placeholder={buyboxWinnerPrice.toString()}
                      defaultValue={buyboxWinnerPrice.toString()}
                      // value={salePrice}
                      onChange={handlePriceChange}
                      className="px-4 py-1.5 w-full border rounded outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Storage Months Slider */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">
                    Storage (Months)
                  </label>
                  <Slider
                    value={storageMonths}
                    onChange={(value: number) => setStorageMonths(value)}
                    max={12}
                    step={1}
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>0</span>
                    <span>12</span>
                  </div>
                </div>

                {/* Calculate Button */}
                {/** 
                <button
                  type="button"
                  onClick={handleCalculateProfitability}
                  disabled={isLoadingProfitability}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
                >
                  {isLoadingProfitability
                    ? "Calculating..."
                    : "Calculate Profitability"}
                </button>
                */}

                <>
                  {/* Fees Section with Tabs */}
                  <div className="flex flex-col gap-2">
                    {/* mac cost & total fees tabs */}
                    <div className="bg-[#F7F7F7] rounded-[10px] p-1 flex items-center gap-2 w-max mx-auto">
                      <button
                        type="button"
                        onClick={() => setActiveTab("maximumCost")}
                        className={`text-sm font-medium p-1.5 rounded-md border ${
                          activeTab === "maximumCost"
                            ? "border-border bg-white"
                            : "border-transparent text-[#787891]"
                        }`}
                      >
                        Maximum Cost
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("totalFees")}
                        className={`text-sm font-medium p-1.5 rounded-md border ${
                          activeTab === "totalFees"
                            ? "border-border bg-white"
                            : "border-transparent text-[#787891]"
                        }`}
                      >
                        Total Fees
                      </button>
                    </div>
                  </div>

                  {isSwitching ? (
                    <div className="flex justify-center py-4">
                      <Loader2 />
                    </div>
                  ) : (
                    <>
                      {isCalculating ? (
                        <div className=" gap-4 grid grid-cols-2">
                          <Skeleton.Input
                            active
                            size="large"
                            block
                            style={{ height: 25 }}
                          />
                          <Skeleton.Input
                            active
                            size="large"
                            block
                            style={{ height: 25 }}
                          />
                          <Skeleton.Input
                            active
                            size="large"
                            block
                            style={{ height: 25 }}
                          />
                          <Skeleton.Input
                            active
                            size="large"
                            block
                            style={{ height: 25 }}
                          />
                          <Skeleton.Input
                            active
                            size="large"
                            block
                            style={{ height: 25 }}
                          />
                          <Skeleton.Input
                            active
                            size="large"
                            block
                            style={{ height: 25 }}
                          />
                          <Skeleton.Input
                            active
                            size="large"
                            block
                            style={{ height: 25 }}
                          />
                          <Skeleton.Input
                            active
                            size="large"
                            block
                            style={{ height: 25 }}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="bg-[#F4F4F5] rounded-xl p-2">
                            {activeTab === "maximumCost" && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <StrikethroughIfNull value={minROI}>
                                    <AntTooltip title="Minimum Return on Investment - The lowest acceptable percentage return on your investment for this product to be considered profitable." placement="top">
                                      <span className="text-[#595959] cursor-help border-b border-dotted border-gray-400">
                                        Min. ROI
                                      </span>
                                    </AntTooltip>
                                  </StrikethroughIfNull>
                                  <StrikethroughIfNull value={minROI}>
                                    <span className="font-semibold text-black">
                                      {minROI || 0}%
                                    </span>
                                  </StrikethroughIfNull>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <StrikethroughIfNull value={minProfit}>
                                    <AntTooltip title="Minimum Profit - The smallest dollar amount of profit you should accept when selling this product." placement="top">
                                      <span className="text-[#595959] cursor-help border-b border-dotted border-gray-400">
                                        Min. Profit
                                      </span>
                                    </AntTooltip>
                                  </StrikethroughIfNull>
                                  <StrikethroughIfNull value={minProfit}>
                                    <span className="font-semibold text-black">
                                      ${minProfit.toFixed(2)}
                                    </span>
                                  </StrikethroughIfNull>
                                </div>
                                <div className="border-t pt-2 font-semibold flex justify-between">
                                  <AntTooltip title="The highest price you should pay for this product to maintain your target profit margin and ROI." placement="top">
                                    <span className="cursor-help border-b border-dotted border-gray-400">
                                      Maximum Cost
                                    </span>
                                  </AntTooltip>
                                  <span>${maxCost.toFixed(2)}</span>
                                </div>
                              </div>
                            )}

                            {activeTab === "totalFees" && (
                              <div className="space-y-2">
                                {Object.entries(fees).map(([key, value]) => {
                                  // Define tooltips for fee types
                                  const feeTooltips: Record<string, string> = {
                                    referralFee: "Amazon's commission for selling your product on their platform, usually a percentage of the sale price.",
                                    fulfillmentType: "The method used to fulfill orders (FBA: Fulfilled by Amazon, FBM: Fulfilled by Merchant).",
                                    fullfillmentFee: "Fee charged by Amazon for picking, packing, and shipping your product (FBA only).",
                                    closingFee: "Fixed fee applied to certain product categories.",
                                    storageFee: "Fee charged for storing your product in Amazon's warehouses.",
                                    prepFee: "Fee for any product preparation services provided by Amazon.",
                                    shippingFee: "Cost to ship the product to the customer (primarily for FBM).",
                                    digitalServicesFee: "Fee related to digital services or content.",
                                    miscFee: "Any additional or miscellaneous fees not covered by other categories."
                                  };
                                  
                                  // Format the key for display
                                  const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                                  
                                  return (
                                    <div
                                      key={key}
                                      className="flex justify-between text-sm"
                                    >
                                      <StrikethroughIfNull value={value}>
                                        {feeTooltips[key] ? (
                                          <AntTooltip title={feeTooltips[key]} placement="top">
                                            <span className="text-[#595959] cursor-help border-b border-dotted border-gray-400">
                                              {formattedKey}
                                            </span>
                                          </AntTooltip>
                                        ) : (
                                          <span className="text-[#595959]">
                                            {formattedKey}
                                          </span>
                                        )}
                                      </StrikethroughIfNull>
                                      <StrikethroughIfNull value={value}>
                                        <span className="font-semibold text-black">
                                          {formatValue(value)}
                                        </span>
                                      </StrikethroughIfNull>
                                    </div>
                                  );
                                })}

                                <div className="border-t pt-2 font-semibold flex justify-between">
                                  <AntTooltip title="The sum of all Amazon fees and expenses associated with selling this product." placement="top">
                                    <span className="cursor-help border-b border-dotted border-gray-400">Total Fees</span>
                                  </AntTooltip>
                                  <span>${totalFees.toFixed(2)}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Summary Items */}
                          <div className="flex flex-col gap-2 text-[#595959]">
                            <div className="flex justify-between text-sm">
                              <StrikethroughIfNull value={vatOnFees}>
                                <AntTooltip title="Tax charged on the sale of your product that you need to collect and remit to tax authorities." placement="top">
                                  <span className="cursor-help border-b border-dotted border-gray-400">Sales Tax</span>
                                </AntTooltip>
                              </StrikethroughIfNull>
                              <StrikethroughIfNull value={vatOnFees}>
                                <span className="font-semibold text-black">
                                  {formatValue(vatOnFees)}
                                </span>
                              </StrikethroughIfNull>
                            </div>
                            <div className="flex justify-between text-sm">
                              <StrikethroughIfNull value={discount}>
                                <AntTooltip title="Any price reduction applied to the product, which reduces your overall revenue." placement="top">
                                  <span className="cursor-help border-b border-dotted border-gray-400">Discount</span>
                                </AntTooltip>
                              </StrikethroughIfNull>
                              <StrikethroughIfNull value={discount}>
                                <span className="font-semibold text-black">
                                  {formatValue(discount)}
                                </span>
                              </StrikethroughIfNull>
                            </div>
                            <div className="flex justify-between text-sm">
                              <StrikethroughIfNull value={profitMargin}>
                                <AntTooltip title="The percentage of profit relative to the sale price after all costs have been deducted." placement="top">
                                  <span className="cursor-help border-b border-dotted border-gray-400">Profit Margin</span>
                                </AntTooltip>
                              </StrikethroughIfNull>
                              <StrikethroughIfNull value={profitMargin}>
                                <span className="font-semibold text-black">
                                  {profitMargin.toFixed(2)}%
                                </span>
                              </StrikethroughIfNull>
                            </div>
                            <div className="flex justify-between text-sm">
                              <StrikethroughIfNull value={breakEvenPrice}>
                                <AntTooltip title="The minimum price you need to sell the product for to cover all costs without making or losing money." placement="top">
                                  <span className="cursor-help border-b border-dotted border-gray-400">Breakeven Sale Price</span>
                                </AntTooltip>
                              </StrikethroughIfNull>
                              <StrikethroughIfNull value={breakEvenPrice}>
                                <span className="font-semibold text-black">
                                  ${breakEvenPrice.toFixed(2)}
                                </span>
                              </StrikethroughIfNull>
                            </div>
                            <div className="flex justify-between text-sm">
                              <StrikethroughIfNull value={estimatedPayout}>
                                <AntTooltip title="The approximate amount Amazon will pay you after deducting all fees and commissions." placement="top">
                                  <span className="cursor-help border-b border-dotted border-gray-400">Estimated Amz. Payout</span>
                                </AntTooltip>
                              </StrikethroughIfNull>
                              <StrikethroughIfNull value={estimatedPayout}>
                                <span className="font-semibold text-black">
                                  ${estimatedPayout.toFixed(2)}
                                </span>
                              </StrikethroughIfNull>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </>
              </div>

              {/* product info and totan ai */}
              <div className="flex flex-col gap-4">
                {/* tabs */}
                <div className="flex gap-4 items-center text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab6("info")}
                    className={`px-4 py-2 rounded-full ${
                      activeTab6 === "info"
                        ? "bg-primary text-white"
                        : "bg-[#F3F4F6] text-[#676A75]"
                    }`}
                  >
                    Product info
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab6("totan")}
                    className={`px-4 py-2 rounded-full ${
                      activeTab6 === "totan"
                        ? "bg-primary text-white"
                        : "bg-[#F3F4F6] text-[#676A75]"
                    }`}
                  >
                    Totan (AI)
                  </button>
                </div>

                {/* Totan */}
                {activeTab6 === "totan" && (
                  <div className="border border-border rounded-xl shadow-sm p-4 flex flex-col gap-3">
                    {/* Score and Info Row */}
                    <div className="flex items-center justify-between">
                      {/* Circular Score */}
                      <div className="relative size-32">
                        <svg
                          className="w-full h-full transform -rotate-90"
                          viewBox="0 0 36 36"
                        >
                          <path
                            className="text-[#F3F4F6]"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            d="M18 2.0845
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-primary"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray="80, 100"
                            fill="none"
                            d="M18 2.0845
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-xs">
                          <span className="text-[10px] text-[#676A75] font-medium uppercase text-center">
                            <p>ABOVE</p>
                            <p>AVERAGE</p>
                          </span>

                          <span className="text-lg font-semibold text-[#060606]">
                            5.19
                          </span>
                        </div>
                      </div>

                      {/* Analysis Box */}
                      <div className="flex flex-col gap-2">
                        <div className="bg-muted rounded-md px-3 py-1 text-sm font-medium text-muted-foreground">
                          <div className="bg-[#F3F4F6] rounded-lg p-3 text-[#676A75] text-sm">
                            <p className="font-semibold">Analysis</p>
                            <p>Average Return on…</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-1 text-sm text-muted-foreground">
                          <span className="bg-[#F3F4F6] rounded-lg p-2">
                            <Image
                              src={AmazonIcon}
                              alt="Amazon icon"
                              width={32}
                              height={32}
                            />
                          </span>

                          <span className="bg-[#F3F4F6] rounded-lg p-3 text-[#676A75] text-xs">
                            Amazon Owns the buybox
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-[#676A75] font-medium">
                        Suggested Purchase Quantity
                      </span>
                      <p className="border border-input rounded-md px-4 py-1 text-sm">
                        5
                      </p>
                    </div>
                  </div>
                )}

                {/* extra stats grid */}
                {activeTab6 === "info" && (
                  <div className="border border-border p-4 rounded-xl flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-3">
                      <InfoCard
                        icon={<PriceTagIcon />}
                        title={
                          <AntTooltip title="The current price of the product in the Amazon Buy Box. This is typically the price most customers see when viewing the product." placement="top">
                            <span className="cursor-help border-b border-dotted border-gray-400">Buy Box Price</span>
                          </AntTooltip>
                        }
                        value={`$ ${extra?.buybox_price ?? "0"}`}
                        bgColor="#F0FFF0"
                      />
                      <InfoCard
                        icon={<ProductSalesIcon />}
                        title={
                          <AntTooltip title="The approximate number of units sold per month based on market analysis and sales rank data." placement="top">
                            <span className="cursor-help border-b border-dotted border-gray-400">Estimated Product Sales</span>
                          </AntTooltip>
                        }
                        value={`${
                          extra?.monthly_est_product_sales?.toLocaleString() ??
                          "0"
                        }/month`}
                        bgColor="#F0F0FF"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InfoCard
                        icon={<BSRIcon />}
                        title={
                          <AntTooltip title="Best Seller Rank (BSR) indicates how well a product is selling in its category. Lower numbers mean better sales performance." placement="top">
                            <span className="cursor-help border-b border-dotted border-gray-400">BSR</span>
                          </AntTooltip>
                        }
                        value={extra?.bsr ?? "0"}
                        bgColor="#FFF0FF"
                      />
                      <InfoCard
                        icon={<MaximumCostIcon />}
                        title={
                          <AntTooltip title="The highest price you should pay for this product to maintain your target profit margin and ROI." placement="top">
                            <span className="cursor-help border-b border-dotted border-gray-400">Maximum Cost</span>
                          </AntTooltip>
                        }
                        value={`$ ${
                          // convertPrice(extra?.max_cost) ?? "0"
                          maxCost ?? "0"
                        }`}
                        bgColor="#FFF0F3"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InfoCard
                        icon={<ROIIcon />}
                        title={
                          <AntTooltip title="Return on Investment - The percentage return you'll earn on your initial investment in this product." placement="top">
                            <span className="cursor-help border-b border-dotted border-gray-400">ROI</span>
                          </AntTooltip>
                        }
                        value={`${ROI ?? "0"}%`}
                        bgColor="#F5EBFF"
                      />
                      <InfoCard
                        icon={<PriceTagIcon />}
                        title={
                          <AntTooltip title="The total profit amount in dollars and profit margin percentage you can expect from selling this product." placement="top">
                            <span className="cursor-help border-b border-dotted border-gray-400">Profit</span>
                          </AntTooltip>
                        }
                        value={`$ ${
                          // convertPrice(extra?.profit) ?? "0"
                          profitAmount ?? "0"
                          // } (${extra?.profit_percentage ?? "0"}%)`}
                        } (${profitMargin.toFixed(0) ?? "0"}%)`}
                        bgColor="#EBFFFE"
                      />
                    </div>
                  </div>
                )}
              </div>
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
