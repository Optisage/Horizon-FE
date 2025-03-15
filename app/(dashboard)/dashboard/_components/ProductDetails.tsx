"use client";

import { useEffect, useState } from "react";
import { CustomPagination, SearchInput } from "@/app/(dashboard)/_components";
import Image from "next/image";
import { message } from "antd";
import { CustomSlider as Slider } from "@/lib/AntdComponents";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import AlertsDrawer from "./AlertsDrawer";
import { useRouter } from "next/navigation";
import CustomDatePicker from "./CustomDatePicker";
import Loader from "@/utils/loader";
import SalesStats from "./SalesStats";
import { Product } from "./Dashboard";

import ProductThumbnail from "@/public/assets/images/women-shoes.png";
import Illustration from "@/public/assets/svg/illustration.svg";
import UFO from "@/public/assets/svg/ufo.svg";
import {
  BSRIcon,
  PriceTagIcon,
  ProductSalesIcon,
  MaximumCostIcon,
  ROIIcon,
} from "./icons";
import { BsArrowUp } from "react-icons/bs";
import { RxArrowTopRight } from "react-icons/rx";
import { IoMdRefresh } from "react-icons/io";
import { HiOutlineUsers } from "react-icons/hi";
import { MdOutlineInsertChartOutlined } from "react-icons/md";

import {
  useGetItemQuery,
  useGetBuyboxInfoQuery,
  useGetRankingsAndPricesQuery,
  useSearchItemsQuery,
  useCalculateProfitablilityMutation,
  useGetMarketAnalysisQuery,
} from "@/redux/api/productsApi";
import useCurrencyConverter from "@/utils/currencyConverter";
import { useAppSelector } from "@/redux/hooks";
import dayjs from "dayjs";

interface ProductDetailsProps {
  asin: string;
  marketplaceId: number;
}

interface BuyboxItem {
  seller: string;
  seller_id: string;
  rating: number;
  listing_price: number;
  weight_percentage: number;
  stock_quantity: number;
  is_buybox_winner: boolean;
  currency: string;
  seller_feedback: {
    avg_price: number;
    percentage_won: number;
    last_won: string;
  };
}

interface MarketAnalysisDataPoint {
  date: string;
  price: number;
}

interface BuyboxMarketDataPoint {
  date: string;
  buyBox: number;
}

interface AmazonMarketDataPoint {
  date: string;
  amazon: number;
}

interface MarketAnalysisData {
  buybox: MarketAnalysisDataPoint[];
  amazon: MarketAnalysisDataPoint[];
}

interface MergedDataPoint {
  date: string;
  buyBox: number;
  amazon: number | null;
}

const ProductDetails = ({ asin, marketplaceId }: ProductDetailsProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [previousPageToken, setPreviousPageToken] = useState<string | null>(
    null
  );
  const [currentPageToken, setCurrentPageToken] = useState<string | null>(null);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const [costPrice, setCostPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [storageMonths, setStorageMonths] = useState(0);
  const [fulfillmentType, setFulfillmentType] = useState("FBM");
  const [activeTab, setActiveTab] = useState("maximumCost");
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [fees, setFees] = useState({
    referralFee: 0,
    fulfillmentType: "FBM",
    fullfillmentFee: 0,
    closingFee: 0,
    storageFee: 0,
    prepFee: 0,
    shippingFee: 0,
    digitalServicesFee: 0,
    miscFee: 0,
  });
  const [totalFees, setTotalFees] = useState(0);
  const [minROI, setMinROI] = useState(0);
  const [minProfit, setMinProfit] = useState(0);
  const [maxCost, setMaxCost] = useState(0);
  const [vatOnFees, setVatOnFees] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  const [breakEvenPrice, setBreakEvenPrice] = useState(0);
  const [estimatedPayout, setEstimatedPayout] = useState(0);

  const [calculateProfitability, { isLoading: isLoadingProfitability }] =
    useCalculateProfitablilityMutation();

  // calculating profitability
  const handleCalculateProfitability = async () => {
    const body = {
      asin: asin,
      marketplaceId: `${marketplaceId}`,
      isAmazonFulfilled: fulfillmentType === "FBA",
      currencyCode: currencyCode,
      storage: storageMonths,
      costPrice: costPrice,
      salePrice: salePrice,
      pointsNumber: 0,
      pointsAmount: 0,
    };

    try {
      const response = await calculateProfitability({ body }).unwrap();
      if (response.status === 200) {
        // Update state with the response data
        setFees({
          referralFee: response.data.referralFee,
          fulfillmentType: response.data.fulfillmentType,
          fullfillmentFee: response.data.fullfillmentFee,
          closingFee: response.data.closingFee,
          storageFee: response.data.storageFee,
          prepFee: parseFloat(response.data.prepFee),
          shippingFee: parseFloat(response.data.shippingFee),
          digitalServicesFee: response.data.digitalServicesFee,
          miscFee: parseFloat(response.data.miscFee),
        });
        setMinROI(response.data.minRoi);
        setMinProfit(response.data.minProfit);
        setMaxCost(response.data.maxCost);
        setTotalFees(response.data.totalFees);
        setVatOnFees(response.data.vatOnFees);
        setDiscount(response.data.discount);
        setProfitMargin(response.data.profitMargin);
        setBreakEvenPrice(response.data.breakevenSalePrice);
        setEstimatedPayout(response.data.estimatedAmzPayout);
      }
    } catch (error) {
      console.error("Failed to calculate profitability:", error);
      message.error("Failed to calculate profitability. Please try again.");
    }
  };

  const [activeTab4, setActiveTab4] = useState<
    "current" | "30" | "90" | "180" | "all"
  >("current");
  const [activeTab5, setActiveTab5] = useState("offers");

  const router = useRouter();

  const { currencyCode, currencySymbol } =
    useAppSelector((state) => state.global) || {};
  const { convertPrice } = useCurrencyConverter(currencyCode);

  const { data: buyboxData, isLoading: isLoadingBuybox } =
    useGetBuyboxInfoQuery({
      marketplaceId,
      itemAsin: asin,
    });

  const { data: rankingsData, isLoading: isLoadingRankings } =
    useGetRankingsAndPricesQuery({
      marketplaceId,
      itemAsin: asin,
      period: activeTab4,
    });

  const { data, error, isLoading } = useGetItemQuery({
    marketplaceId,
    itemAsin: asin,
  });

  const {
    data: marketAnalysisData,
    error: marketAnalysisError,
    isLoading: isLoadingMarketAnalysis,
  } = useGetMarketAnalysisQuery({
    marketplaceId,
    itemAsin: asin,
    date: selectedDate.format("YYYY-MM"),
  });

  const handleDateChange = (date: dayjs.Dayjs | [dayjs.Dayjs, dayjs.Dayjs]) => {
    if (!Array.isArray(date)) {
      setSelectedDate(date);
    }
  };

  // Transform the API data to match the chart's expected format
  const transformData = (
    data: MarketAnalysisData | undefined
  ): MergedDataPoint[] => {
    if (!data) return [];

    const buyboxMarketData: BuyboxMarketDataPoint[] = data.buybox.map(
      (item) => ({
        date: dayjs(item.date).format("MMM D"),
        buyBox: item.price,
      })
    );

    const amazonMarketData: AmazonMarketDataPoint[] = data.amazon.map(
      (item: MarketAnalysisDataPoint) => ({
        date: dayjs(item.date).format("MMM D"),
        amazon: item.price,
      })
    );

    // Merge the data by date
    const mergedData: MergedDataPoint[] = buyboxMarketData.map((item) => {
      const amazonItem = amazonMarketData.find(
        (amazon) => amazon.date === item.date
      );
      return {
        ...item,
        amazon: amazonItem ? amazonItem.amazon : null,
      };
    });

    return mergedData;
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

  if (isLoadingBuybox || isLoading || isLoadingRankings || isPaginationLoading)
    return <Loader />;

  const product = data?.data;
  const buybox: BuyboxItem[] = buyboxData?.data?.buybox ?? [];
  const extra = buyboxData?.data?.extra;
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

  const offersData = {
    offers: buybox.map((offer: BuyboxItem, index: number) => ({
      id: index + 1,
      seller: offer.seller,
      stock: offer.stock_quantity,
      price: `${offer.listing_price.toFixed(2)}`,
      buyboxShare: `${offer.weight_percentage}%`,
      leader: offer.is_buybox_winner,
      seller_id: offer.seller_id,
    })),
  };

  const sellerFeedbackData = buybox.map(
    (seller: BuyboxItem, index: number) => ({
      id: index + 1,
      seller: seller.seller,
      rating: seller.rating,
      avgPrice: `${seller.seller_feedback?.avg_price?.toFixed(2) ?? "N/A"}`,
      won: `${seller.seller_feedback?.percentage_won ?? 0}%`,
      lastWon: seller.seller_feedback?.last_won
        ? new Date(seller.seller_feedback.last_won).toLocaleString()
        : "N/A",
    })
  );

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
    return <Loader />;

  if (error)
    return (
      <div className="h-[400px] flex flex-col items-center justify-center">
        <h2 className="font-semibold">Error loading product details</h2>
        <p className=" text-sm">
          Product might not be available in the selected country
        </p>
      </div>
    );

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      <SearchInput value={searchValue} onChange={setSearchValue} />

      {searchError && (
        <div className="text-center text-red-500 mt-4">
          Failed to load products.
        </div>
      )}

      {/* Show product details when there's no search */}
      {!debouncedSearch && !isLoading && !error && (
        <main className="flex flex-col gap-5">
          {/* WorkTools */}
          <div className="flex flex-wrap gap-2 md:gap-4 items-center">
            <p className="font-semibold">Your WorkTools</p>

            <button
              type="button"
              className="border border-border text-primary px-3 py-2 rounded-xl flex gap-1 items-center font-semibold hover:bg-gray-50 active:scale-95 duration-200 text-sm md:text-base"
            >
              Export Data on Google Sheets
              <RxArrowTopRight className="size-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                const query = encodeURIComponent(
                  `${product?.product_name} supplier`
                );
                window.open(
                  `https://www.google.com/search?q=${query}`,
                  "_blank"
                );
              }}
              className="border border-border text-primary px-3 py-2 rounded-xl flex gap-1 items-center font-semibold hover:bg-gray-50 active:scale-95 duration-200 text-sm md:text-base"
            >
              Find Supplier
              <RxArrowTopRight className="size-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (product?.asin) {
                  window.open(
                    `https://www.amazon.com/dp/${product.asin}`,
                    "_blank"
                  );
                } else {
                  message.warning("ASIN not available.");
                }
              }}
              className="border border-border text-primary px-3 py-2 rounded-xl flex gap-1 items-center font-semibold hover:bg-gray-50 active:scale-95 duration-200 text-sm md:text-base"
            >
              See this Product on Amazon
              <RxArrowTopRight className="size-5" />
            </button>
          </div>

          {/* grid */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* left */}
            <div className="flex flex-col gap-5">
              {/* product details */}
              <div className="border border-border px-4 pt-4 rounded-xl flex flex-col gap-4">
                <div className="grid md:grid-cols-[2fr_5fr] gap-3">
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
                    <p>ASIN: {product?.asin}</p>
                    <p>⭐⭐⭐⭐⭐ {product?.rating?.stars}/5</p>
                  </div>
                </div>

                <div className="p-6 bg-[#F5F3FF] rounded-t-lg flex items-center gap-4 justify-between">
                  <div className="flex flex-col gap-4">
                    <span className="flex flex-col gap-2">
                      <p className="text-lg md:text-xl text-[#09090B] font-semibold">
                        This product is eligible to sell
                      </p>
                      <p className="text-red-500 text-sm">There are 2 issues</p>
                    </span>

                    <div>
                      <AlertsDrawer />
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
                      onClick={() => setFulfillmentType("FBA")}
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
                      onClick={() => setFulfillmentType("FBM")}
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
                      value={costPrice}
                      onChange={(e) => setCostPrice(Number(e.target.value))}
                      className="px-4 py-1.5 w-full border rounded"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-600">Sale Price</label>
                    <input
                      aria-label="Sale Price"
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(Number(e.target.value))}
                      className="px-4 py-1.5 w-full border rounded"
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

                {/* Fees Section with Tabs */}
                <div className="flex flex-col gap-2">
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

                  <div className="bg-[#F4F4F5] rounded-xl p-2">
                    {activeTab === "maximumCost" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#595959]">Min. ROI</span>
                          <span className="font-semibold text-black">
                            {minROI || 0}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#595959]">Min. Profit</span>
                          <span className="font-semibold text-black">
                            {currencySymbol}
                            {convertPrice(minProfit.toFixed(2)) || 0}
                          </span>
                        </div>
                        <div className="border-t pt-2 font-semibold flex justify-between">
                          <span>Maximum Cost</span>
                          <span>
                            {currencySymbol}
                            {convertPrice(maxCost.toFixed(2)) || 0}
                          </span>
                        </div>
                      </div>
                    )}

                    {activeTab === "totalFees" && (
                      <div className="space-y-2">
                        {Object.entries(fees).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-[#595959]">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                            </span>
                            <span className="font-semibold text-black">
                              {currencySymbol}
                              {typeof value === "number"
                                ? convertPrice(value.toFixed(2))
                                : value}
                            </span>
                          </div>
                        ))}
                        <div className="border-t pt-2 font-semibold flex justify-between">
                          <span>Total Fees</span>
                          <span>
                            {currencySymbol}
                            {convertPrice(totalFees.toFixed(2))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary Items */}
                <div className="flex flex-col gap-2 text-[#595959]">
                  <div className="flex justify-between text-sm">
                    <span>VAT on Fees</span>
                    <span className="font-semibold text-black">
                      {currencySymbol}
                      {convertPrice(vatOnFees.toFixed(2))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount</span>
                    <span className="font-semibold text-black">
                      {currencySymbol}
                      {convertPrice(discount.toFixed(2))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Profit Margin</span>
                    <span className="font-semibold text-black">
                      {(profitMargin * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Breakeven Sale Price</span>
                    <span className="font-semibold text-black">
                      {currencySymbol}
                      {convertPrice(breakEvenPrice.toFixed(2))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Estimated Amz. Payout</span>
                    <span className="font-semibold text-black">
                      {currencySymbol}
                      {convertPrice(estimatedPayout.toFixed(2))}
                    </span>
                  </div>
                </div>
              </div>

              {/* extra stats grid */}
              <div className="border border-border p-4 rounded-xl flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-3">
                  <InfoCard
                    icon={<PriceTagIcon />}
                    title="Buy Box Price"
                    value={`${currencySymbol}${
                      convertPrice(extra?.buybox_price) ?? "-"
                    }`}
                    bgColor="#F0FFF0"
                  />
                  <InfoCard
                    icon={<ProductSalesIcon />}
                    title="Estimated Product Sales"
                    value={`${extra?.monthly_est_product_sales ?? "-"}/month`}
                    bgColor="#F0F0FF"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoCard
                    icon={<BSRIcon />}
                    title="BSR"
                    value={extra?.bsr ?? "-"}
                    bgColor="#FFF0FF"
                  />
                  <InfoCard
                    icon={<MaximumCostIcon />}
                    title="Maximum Cost"
                    value={`${currencySymbol}${
                      convertPrice(extra?.max_cost) ?? "-"
                    }`}
                    bgColor="#FFF0F3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoCard
                    icon={<ROIIcon />}
                    title="ROI"
                    value={`${extra?.roi ?? "-"}%`}
                    bgColor="#F5EBFF"
                  />
                  <InfoCard
                    icon={<PriceTagIcon />}
                    title="Profit"
                    value={`${currencySymbol}${
                      convertPrice(extra?.profit) ?? "-"
                    } (${extra?.profit_percentage ?? "-"}%)`}
                    bgColor="#EBFFFE"
                  />
                </div>
              </div>
            </div>

            {/* right */}
            <div className="flex flex-col gap-5">
              {/* Offers Section */}
              <div className="border border-border flex flex-col rounded-xl max-h-[375px] overflow-scroll">
                <div className="flex items-center gap-6 font-semibold text-gray-700 p-3">
                  <button
                    type="button"
                    className={`text-lg flex gap-1 items-center border-b-2 ${
                      activeTab5 === "offers"
                        ? "border-black"
                        : "border-transparent"
                    }`}
                    onClick={() => setActiveTab5("offers")}
                  >
                    <HiOutlineUsers className="size-5" /> Offers
                  </button>
                  <button
                    type="button"
                    className={`text-lg flex gap-1 items-center border-b-2 ${
                      activeTab5 === "feedback"
                        ? "border-black"
                        : "border-transparent"
                    }`}
                    onClick={() => setActiveTab5("feedback")}
                  >
                    <MdOutlineInsertChartOutlined className="size-5" /> Seller
                    Feedback
                  </button>
                </div>

                {activeTab5 === "offers" ? (
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b text-left bg-[#F7F7F7]">
                        <th className="p-3">S/N</th>
                        <th className="p-3">Seller</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Buybox Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offersData.offers.map((offer) => (
                        <tr key={offer.id} className="border-b">
                          <td className="p-3">{offer.id}</td>
                          <td className="p-3">
                            <div
                              onClick={() =>
                                router.push(`/seller/${offer.seller_id}`)
                              }
                              className="cursor-pointer"
                            >
                              {offer.seller}
                              {offer.leader && (
                                <span className="text-xs text-primary block">
                                  BuyBox Leader
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">{offer.stock}</td>
                          <td className="p-3">
                            {currencySymbol}
                            {convertPrice(offer.price)}
                          </td>
                          <td className="p-3 flex gap-1 items-center">
                            {offer.buyboxShare}
                            <div className="relative w-20 h-2 bg-gray-200 rounded-full">
                              <div
                                className="absolute top-0 left-0 h-2 bg-green-500 rounded-full"
                                style={{ width: offer.buyboxShare }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b text-left bg-[#F7F7F7]">
                        <th className="p-3">S/N</th>
                        <th className="p-3">Seller</th>
                        <th className="p-3">Avg. Price</th>
                        <th className="p-3">Won</th>
                        <th className="p-3">Last Won</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellerFeedbackData.map((seller) => (
                        <tr key={seller.id} className="border-b">
                          <td className="p-3">{seller.id}</td>
                          <td className="p-3">
                            <div
                              onClick={() => router.push("/seller")}
                              className="cursor-pointer"
                            >
                              {seller.seller}
                              <div className="flex">
                                {renderStars(seller.rating)}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            {currencySymbol}
                            {convertPrice(seller.avgPrice)}
                          </td>
                          <td className="p-3">{seller.won}</td>
                          <td className="p-3">{seller.lastWon}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Ranks & Prices Section */}
              <div className="border border-border p-4 flex flex-col gap-2 rounded-xl">
                <div className="flex gap-4 items-center justify-between">
                  <h2 className="text-lg font-semibold">Ranks & Prices</h2>
                  <button type="button" className="flex gap-1.5 items-center">
                    <IoMdRefresh className="size-5" />
                    Refresh
                  </button>
                </div>

                <div className="flex items-center gap-1 mt-4">
                  {["current", "30", "90", "180", "all"].map((tab) => (
                    <button
                      key={tab}
                      className={`px-3 py-1 rounded-full text-black border capitalize ${
                        tab === activeTab4
                          ? "bg-[#E7EBFE] border-transparent"
                          : "bg-transparent border-border"
                      }`}
                      onClick={() =>
                        setActiveTab4(
                          tab as "current" | "30" | "90" | "180" | "all"
                        )
                      }
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-[#F6FEFC] rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-12 rounded-2xl bg-[#CEF8F5] text-[#08DCCF] flex items-center justify-center">
                      <BsArrowUp className="size-6" />
                    </span>
                    <span>
                      <p className="text-black font-semibold">
                        {ranks.netBBPriceChanges}
                      </p>
                      <p>Net BB Price Changes</p>
                    </span>
                  </div>

                  <div className="text-black text-xs bg-[#E7EBFE] rounded-full px-1 flex items-center gap-1">
                    <BsArrowUp className="text-primary size-3" />{" "}
                    {ranks.changePercent}
                  </div>
                </div>

                <div className="mt-2 text-sm text-[#595959]">
                  <div className="flex justify-between py-1">
                    <span>Buy Box</span>
                    <span className="font-semibold text-black">
                      {currencySymbol}
                      {convertPrice(ranks.buyBox)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Amazon</span>
                    <span className="font-semibold text-black">
                      {currencySymbol}
                      {convertPrice(ranks.amazon)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Lowest FBA</span>
                    <span className="font-semibold text-black">
                      {currencySymbol}
                      {convertPrice(ranks.lowestFBA)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Lowest FBM</span>
                    <span className="font-semibold text-black">
                      {currencySymbol}
                      {convertPrice(ranks.lowestFBM)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Keepa BSR Drops</span>
                    <span className="font-semibold text-black">
                      {ranks.keepaBSRDrops}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Estimated Sales</span>
                    <span className="font-semibold text-black">
                      {ranks.estimatedSales}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Est. Time to Sale</span>
                    <span className="font-semibold text-black">
                      {ranks.estTimeToSale}
                    </span>
                  </div>
                </div>
              </div>

              {/*  */}

              {/* Buy Box Analysis */}
              <div className="p-6 border rounded-lg">
                <h2 className="text-lg font-semibold">Buy Box Analysis</h2>
                <div className="mt-4">
                  <CustomDatePicker />
                </div>

                <div className="flex justify-between items-center mt-6">
                  <ResponsiveContainer width={250} height={250}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" outerRadius={80}>
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <ul>
                    {pieData.map((entry, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-lg"
                          style={{ backgroundColor: entry.color }}
                        ></span>
                        {entry.name} &nbsp; - {entry.value}%
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Market Analysis */}
              <div className="p-6 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Market Analysis</h2>
                  {/* Date Picker */}
                  <CustomDatePicker onChange={handleDateChange} />
                </div>

                <p className="mt-4 text-black">Price</p>

                <div className="mt-6 flex flex-col gap-4">
                  {/* Legend */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-lg bg-[#FF0080]" />
                      <span>Amazon</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-3 rounded-lg bg-[#00E4E4]" />
                      <span>Buy Box</span>
                    </div>
                  </div>

                  {isLoadingMarketAnalysis ? (
                    <div className="h-40 flex items-center justify-center font-medium">
                      Loading...
                    </div>
                  ) : marketAnalysisError ? (
                    <div className="h-40 flex items-center justify-center text-red-500 font-medium">
                      Error loading market analysis data
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="amazon"
                          stroke="#FF0080"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="buyBox"
                          stroke="#00E4E4"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Show search results when there's a search and results */}
      {debouncedSearch && searchData?.data?.items?.length > 0 && (
        <main className="flex flex-col gap-20 justify-between h-full">
          <div className="p-2 rounded-lg border border-border flex flex-col divide-y divide-[#E4E4E7]">
            <span className="bg-[#FAFAFA] px-4 py-3.5">
              <h4 className="text-neutral-900 font-medium text-base md:text-lg">
                Product
              </h4>
            </span>

            {products.map((product: Product) => (
              <div
                key={product.asin}
                className="hover:bg-gray-50 duration-200 cursor-pointer px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <Image
                  onClick={() =>
                    router.push(`/dashboard/product/${product.asin}`)
                  }
                  src={product.image || UFO}
                  alt="product"
                  className="size-16 rounded-lg object-cover"
                  width={64}
                  height={64}
                  quality={90}
                  priority
                  unoptimized
                />
                <div className="flex flex-col gap-1 text-[#09090B]">
                  <p
                    onClick={() =>
                      router.push(`/dashboard/product/${product.asin}`)
                    }
                    className="font-bold hover:underline duration-100"
                  >
                    {product.title}
                  </p>
                  <p>
                    {"⭐".repeat(product.rating || 0)}{" "}
                    <span className="font-bold">({product.reviews || 0})</span>
                  </p>
                  <p className="text-sm">By ASIN: {product.asin}</p>

                  <p className="text-sm">
                    {product.category} | <SalesStats product={product} />
                  </p>
                </div>
              </div>
            ))}
          </div>

          <CustomPagination
            onNext={() => {
              setIsPaginationLoading(true);
              setCurrentPageToken(nextPageToken);
            }}
            onPrevious={() => {
              setIsPaginationLoading(true);
              setCurrentPageToken(previousPageToken);
            }}
            hasNext={!!nextPageToken}
            hasPrevious={!!previousPageToken}
          />
        </main>
      )}

      {/* Show "no results" when there's a search but no results */}
      {debouncedSearch &&
        searchData?.data?.items?.length === 0 &&
        !isLoadingSearch && (
          <div className="flex flex-col gap-6 justify-center items-center py-16">
            <Image
              src={UFO}
              alt="UFO"
              className="sm:size-[200px]"
              width={200}
              height={200}
            />
            <span className="text-center space-y-1">
              <h4 className="text-neutral-900 font-bold text-xl md:text-2xl">
                No products found for &quot;{debouncedSearch}&quot;
              </h4>
              <p className="text-[#52525B] text-sm">
                Try a different search term.
              </p>
            </span>
          </div>
        )}
    </section>
  );
};

const InfoCard = ({
  icon,
  title,
  value,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  bgColor: string;
}) => (
  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
    <span
      className="size-12 rounded-lg flex items-center justify-center"
      style={{ backgroundColor: bgColor }}
    >
      {icon}
    </span>
    <span className="text-black text-sm">
      <p>{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </span>
  </div>
);

export default ProductDetails;
