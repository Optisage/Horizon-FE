"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useLazyPriceHistoryQuery,
  useLazyProductSummaryQuery,
  useLazyRatingReviewQuery,
  useLazySalesRankQuery,
} from "@/redux/api/keepa";
import { useAppSelector } from "@/redux/hooks";

interface Product {
  title: string;
  asin: string;
  category: string;
  currentPrice: number;
  salesRank: number;
}

interface KeepaChartProps {
  product: Product;
  isLoading: boolean;
  asin: string;
}

interface ChartDataPoint {
  date: string;
  dateFormatted: string;
  fullDate: string;
  amazon: number | null;
  buybox: number | null;
  new: number | null;
  rating: number | null;
  rating_count: number | null;
  new_offer_count: number | null;
  [key: string]: number | null | string;
}

// Constants for better maintainability
const TIME_RANGES = [
  { key: "7d", label: "Week" },
  { key: "30d", label: "Month" },
  { key: "90d", label: "3 Months" },
  { key: "1y", label: "Year" },
  { key: "all", label: "All" },
];
const CLOSE_UP_THRESHOLD = 0.75; // 75% of data for close-up view
const DAY_IN_MS = 86400000;

export default function KeepaChart({
  product,
  isLoading,
  asin,
}: KeepaChartProps) {
  const { marketplaceId } = useAppSelector((state) => state?.global);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // Add this new state after the existing useState declarations
  const [isTimeRangeChanging, setIsTimeRangeChanging] = useState(false);

  function formatUnits(value: string | number): string {
    const num = typeof value === "number" ? value : Number.parseFloat(value);
    return isNaN(num)
      ? String(value)
      : `${Math.round(num).toLocaleString()} units`;
  }

  function formatDecimal(value: string | number, decimals = 1): string {
    const num = typeof value === "number" ? value : Number.parseFloat(value);
    return isNaN(num) ? String(value) : num.toFixed(decimals);
  }

  // API queries with error handling
  const [
    getPriceHistory,
    { data: priceData, isLoading: priceLoading, error: priceError },
  ] = useLazyPriceHistoryQuery();
  const [
    getProductSummary,
    { data: summaryData, isLoading: summaryLoading, error: summaryError },
  ] = useLazyProductSummaryQuery();
  const [
    getRatingReview,
    { data: ratingData, isLoading: ratingLoading, error: ratingError },
  ] = useLazyRatingReviewQuery();
  const [
    getSalesRank,
    { data: salesRankData, isLoading: salesRankLoading, error: salesRankError },
  ] = useLazySalesRankQuery();

  // Loading states - separate initial loading from chart updates
  const isInitialLoading = useMemo(
    () =>
      isLoading ||
      (priceLoading && !priceData) ||
      (summaryLoading && !summaryData) ||
      (ratingLoading && !ratingData) ||
      (salesRankLoading && !salesRankData),
    [
      isLoading,
      priceLoading,
      priceData,
      summaryLoading,
      summaryData,
      ratingLoading,
      ratingData,
      salesRankLoading,
      salesRankData,
    ]
  );

  const isLoadingOverall = useMemo(
    () =>
      isLoading ||
      priceLoading ||
      summaryLoading ||
      ratingLoading ||
      salesRankLoading ||
      isTimeRangeChanging,
    [
      isLoading,
      priceLoading,
      summaryLoading,
      ratingLoading,
      salesRankLoading,
      isTimeRangeChanging,
    ]
  );

  // Individual chart metric states
  const [priceMetrics, setPriceMetrics] = useState({
    amazon: true,
    buybox: true,
    new: true,
  });

  const [salesRankMetrics, setSalesRankMetrics] = useState<
    Record<string, boolean>
  >({});
  const [ratingMetrics, setRatingMetrics] = useState({
    rating: true,
    rating_count: true,
    new_offer_count: true,
  });

  // Universal time range and individual close-up states
  const [universalTimeRange, setUniversalTimeRange] = useState("90d");
  const [priceCloseUpView, setPriceCloseUpView] = useState(false);
  const [salesRankCloseUpView, setSalesRankCloseUpView] = useState(false);
  const [ratingCloseUpView, setRatingCloseUpView] = useState(false);

  // Check for API errors
  useEffect(() => {
    const errors = [
      priceError,
      summaryError,
      ratingError,
      salesRankError,
    ].filter(Boolean);
    if (errors.length > 0) {
      setFetchError("Failed to load chart data. Please try again later.");
    }
  }, [priceError, summaryError, ratingError, salesRankError]);

  // Fetch data when asin or time range changes
  useEffect(() => {
    if (asin && marketplaceId) {
      setFetchError(null);

      const getRatingPeriod = (range: string): string => {
        switch (range) {
          case "7d":
            return "week";
          case "30d":
            return "month";
          case "90d":
            return "3months";
          case "1y":
          case "all":
            return "all";
          default:
            return "3months";
        }
      };
      const ratingPeriod = getRatingPeriod(universalTimeRange);

      Promise.all([
        getPriceHistory({
          asin,
          id: marketplaceId,
          period: universalTimeRange,
        }),
        getProductSummary({ asin, id: marketplaceId }),
        getRatingReview({ asin, id: marketplaceId, period: ratingPeriod }),
        getSalesRank({ asin, id: marketplaceId, period: universalTimeRange }),
      ])
        .then(() => {
          setIsTimeRangeChanging(false);
        })
        .catch((error) => {
          console.error("API Error:", error);
          setFetchError("Failed to load data. Please try again.");
          setIsTimeRangeChanging(false);
        });
    }
  }, [
    asin,
    marketplaceId,
    universalTimeRange,
    getPriceHistory,
    getProductSummary,
    getRatingReview,
    getSalesRank,
  ]);

  // Initialize salesRankMetrics with default values
  useEffect(() => {
    if (salesRankData?.data?.sales_rank?.sales_rank_data) {
      setSalesRankMetrics((prev) => {
        const updatedMetrics = { ...prev };
        Object.keys(salesRankData.data.sales_rank.sales_rank_data).forEach(
          (key) => {
            if (updatedMetrics[key] === undefined) {
              updatedMetrics[key] = true;
            }
          }
        );
        return updatedMetrics;
      });
    }
  }, [salesRankData]);

  // Process chart data from API responses
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!priceData?.data?.price_history) return [];

    const priceHistory = priceData.data.price_history.price_types;
    const salesRankHistory =
      salesRankData?.data?.sales_rank?.sales_rank_data || {};
    const ratingHistory = ratingData?.data?.chart_data || {};

    // Get all unique timestamps from all data sources
    const allTimestamps = new Set<string>();

    // Add price timestamps
    Object.values(priceHistory).forEach((priceType: any) => {
      if (priceType.data) {
        Object.keys(priceType.data).forEach((timestamp) => {
          allTimestamps.add(timestamp);
        });
      }
    });

    // Add sales rank and monthly sold timestamps
    Object.entries(salesRankHistory).forEach(
      ([key, rankType]: [string, any]) => {
        if (rankType.data) {
          if (key === "monthly_sold") {
            Object.keys(rankType.data).forEach((timestamp) => {
              allTimestamps.add(timestamp);
            });
          } else if (Array.isArray(rankType.data)) {
            rankType.data.forEach((entry: any) =>
              allTimestamps.add(entry.date)
            );
          } else {
            Object.keys(rankType.data).forEach((timestamp) => {
              allTimestamps.add(timestamp);
            });
          }
        }
      }
    );

    // Add rating timestamps
    if (ratingHistory.rating_count?.data) {
      Object.values(ratingHistory.rating_count.data).forEach((entry: any) => {
        allTimestamps.add(entry.date);
      });
    }

    if (ratingHistory.new_offer_count?.data) {
      ratingHistory.new_offer_count.data.forEach((entry: any) => {
        allTimestamps.add(entry.date);
      });
    }

    // Convert to sorted array
    const sortedTimestamps = Array.from(allTimestamps).sort();

    return sortedTimestamps
      .map((timestamp) => {
        const date = new Date(timestamp);

        // Format date based on time range
        const formatDate = () => {
          switch (universalTimeRange) {
            case "7d":
              return date.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
              });
            case "30d":
              return date.toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
              });
            case "90d":
              return date.toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
              });
            case "1y":
            case "all":
              return date.toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
                year: "2-digit",
              });
            default:
              return date.toLocaleDateString("en-GB", {
                month: "short",
                day: "numeric",
              });
          }
        };

        // Get price data for this timestamp
        const amazonPrice =
          priceHistory.amazon?.data?.[timestamp]?.price ?? null;
        const buyboxPrice =
          priceHistory.buybox?.data?.[timestamp]?.price ?? null;
        const newPrice = priceHistory.new?.data?.[timestamp]?.price ?? null;

        // Get sales rank data for this timestamp dynamically
        const salesRankDataForTimestamp: Record<string, number | null> = {};
        Object.keys(salesRankHistory).forEach((key) => {
          if (key === "main_bsr") {
            salesRankDataForTimestamp[key] =
              salesRankHistory[key]?.data?.[timestamp]?.rank ?? null;
          } else if (key.startsWith("category_")) {
            const categoryEntry = salesRankHistory[key]?.data?.find(
              (entry: any) =>
                Math.abs(new Date(entry.date).getTime() - date.getTime()) <
                DAY_IN_MS
            );
            salesRankDataForTimestamp[key] = categoryEntry?.rank ?? null;
          } else if (key === "monthly_sold") {
            salesRankDataForTimestamp[key] =
              salesRankHistory[key]?.data?.[timestamp]?.value ?? null;
          }
        });

        // Get rating data for this timestamp
        const ratingCountEntry = Object.values(
          ratingHistory.rating_count?.data || {}
        ).find(
          (entry: any) =>
            Math.abs(new Date(entry.date).getTime() - date.getTime()) <
            DAY_IN_MS
        ) as any;

        const newOfferCountEntry = ratingHistory.new_offer_count?.data?.find(
          (entry: any) =>
            Math.abs(new Date(entry.date).getTime() - date.getTime()) <
            DAY_IN_MS
        ) as any;

        // Rating is typically static, use from summary or default
        const rating = summaryData?.data?.current_data?.rating || 4.0;

        return {
          date: timestamp,
          dateFormatted: formatDate(),
          fullDate: date.toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          // Price data
          amazon: amazonPrice,
          buybox: buyboxPrice,
          new: newPrice,
          // Sales rank data (now dynamic, including monthly_sold)
          ...salesRankDataForTimestamp,
          // Rating data
          rating: rating,
          rating_count: ratingCountEntry?.value ?? null,
          new_offer_count: newOfferCountEntry?.value ?? null,
        };
      })
      .filter(
        (item) =>
          // Filter out entries with no data
          item.amazon !== null ||
          item.buybox !== null ||
          item.new !== null ||
          Object.keys(salesRankHistory).some(
            (key) =>
              (item as any)[key] !== null && (item as any)[key] !== undefined
          ) ||
          item.rating_count !== null ||
          item.new_offer_count !== null
      ) as ChartDataPoint[];
  }, [priceData, salesRankData, ratingData, summaryData, universalTimeRange]);

  // Get available price types from API data
  const availablePriceTypes = useMemo(() => {
    if (!priceData?.data?.price_history?.summary) return [];
    return priceData.data.price_history.summary.available_types || [];
  }, [priceData]);

  // Handle time range change with loading state
  const handleTimeRangeChange = useCallback((newRange: string) => {
    setIsTimeRangeChanging(true);
    setUniversalTimeRange(newRange);
  }, []);

  // Tooltip props interface
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      dataKey: string;
      value: any;
      color: string;
      name: string;
    }>;
    label?: string;
  }

  function abbreviateNumber(value: number): string {
  if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toString();
}

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const dataPoint = chartData.find((d) => d.dateFormatted === label);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-medium text-gray-800 mb-2">
            {dataPoint?.fullDate || label}
          </p>
          {payload.map((entry, index) => {
            if (entry.value === null || entry.value === undefined) return null;
            return (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}:{" "}
                {entry.dataKey.includes("price") ||
                entry.dataKey === "amazon" ||
                entry.dataKey === "buybox" ||
                entry.dataKey === "new"
                  ? `$${Number(entry.value).toFixed(2)}`
                  : entry.dataKey === "monthly_sold"
                  ? formatUnits(entry.value)
                  : entry.dataKey === "rating"
                  ? formatDecimal(entry.value)
                  : entry.dataKey.includes("rank") ||
                    entry.dataKey.includes("bsr")
                  ? `#${Math.round(Number(entry.value)).toLocaleString()}`
                  : formatDecimal(entry.value)}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (isInitialLoading) {
    return (
      <div className="border border-border rounded-xl p-6 bg-white">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Universal Time Range Controller
  const UniversalTimeController = () => (
    <div className="px-6 py-3 border-b border-border bg-[#FAFAFA] flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-[#01011D]">Time Range:</span>
        <div className="flex items-center gap-2">
          {TIME_RANGES.map((range) => (
            <button
              key={range.key}
              onClick={() => handleTimeRangeChange(range.key)}
              disabled={isLoadingOverall}
              className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                universalTimeRange === range.key
                  ? "bg-primary text-white"
                  : "bg-white text-[#787891] hover:bg-gray-100"
              } ${isLoadingOverall ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label={`Set time range to ${range.label}`}
            >
              {isLoadingOverall && universalTimeRange === range.key && (
                <LoadingOutlined spin style={{ fontSize: "12px" }} />
              )}
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <div className="text-xs text-[#787891] flex items-center gap-2">
        {isLoadingOverall && (
          <div className="flex items-center gap-1">
            <LoadingOutlined spin style={{ fontSize: "12px" }} />
            <span>Loading...</span>
          </div>
        )}
        <span>
          Total Price Types:{" "}
          {priceData?.data?.price_history?.summary?.total_price_types || 0} |
          Data Points: {chartData.length}
        </span>
      </div>
    </div>
  );

  const ChartCloseUpToggle = ({
    closeUpView,
    onToggle,
    title,
  }: {
    closeUpView: boolean;
    onToggle: (enabled: boolean) => void;
    title: string;
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
            aria-label={`Toggle close-up view for ${title}`}
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    </div>
  );

  // Interactive Chart Controllers with actual API data
  const PriceChartController = () => (
    <div className="w-40 border-l border-border bg-[#FAFAFA] p-2">
      <h4 className="font-semibold text-xs text-[#01011D] mb-1">Price Types</h4>
      <div className="space-y-1">
        {availablePriceTypes.map((priceType: any) => {
          const priceTypeData =
            priceData?.data?.price_history?.price_types?.[priceType];
          if (!priceTypeData) return null;

          return (
            <div
              key={priceType}
              className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
                priceMetrics[priceType as keyof typeof priceMetrics]
                  ? "bg-white shadow-sm"
                  : "hover:bg-white"
              }`}
              onClick={() =>
                setPriceMetrics((prev) => ({
                  ...prev,
                  [priceType]: !prev[priceType as keyof typeof prev],
                }))
              }
              aria-label={`Toggle ${priceTypeData.label} visibility`}
            >
              <div
                className={`w-3 h-3 rounded border`}
                style={{
                  backgroundColor: priceMetrics[
                    priceType as keyof typeof priceMetrics
                  ]
                    ? priceTypeData.color
                    : "transparent",
                  borderColor: priceTypeData.color,
                }}
              ></div>
              <span className="text-xs flex-1">{priceTypeData.label}</span>
              <span className="text-xs text-gray-500">
                ({priceTypeData.data_points})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const SalesRankController = () => (
    <div className="w-40 border-l border-border bg-[#FAFAFA] p-2">
      <h4 className="font-semibold text-xs text-[#01011D] mb-1">
        Sales Rank & Volume
      </h4>
      <div className="space-y-1">
        {Object.entries(
          salesRankData?.data?.sales_rank?.sales_rank_data || {}
        ).map(([key, rankData]: [string, any]) => (
          <div
            key={key}
            className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
              salesRankMetrics[key] ? "bg-white shadow-sm" : "hover:bg-white"
            }`}
            onClick={() =>
              setSalesRankMetrics((prev) => ({ ...prev, [key]: !prev[key] }))
            }
            aria-label={`Toggle ${rankData.label} visibility`}
          >
            <div
              className={`w-3 h-3 rounded border`}
              style={{
                backgroundColor: salesRankMetrics[key]
                  ? rankData.color
                  : "transparent",
                borderColor: rankData.color,
              }}
            ></div>
            <span className="text-xs flex-1">{rankData.label}</span>
            <span className="text-xs text-gray-500">
              ({rankData.data_points})
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const RatingController = () => (
    <div className="w-40 border-l border-border bg-[#FAFAFA] p-2">
      <h4 className="font-semibold text-xs text-[#01011D] mb-1">
        Rating & Reviews
      </h4>
      <div className="space-y-1">
        {Object.entries(ratingData?.data?.chart_data || {}).map(
          ([key, ratingDataItem]: [string, any]) => {
            if (!ratingDataItem.label) return null;

            return (
              <div
                key={key}
                className={`flex items-center gap-1 p-1 rounded cursor-pointer transition-colors ${
                  ratingMetrics[key as keyof typeof ratingMetrics]
                    ? "bg-white shadow-sm"
                    : "hover:bg-white"
                }`}
                onClick={() =>
                  setRatingMetrics((prev) => ({
                    ...prev,
                    [key]: !prev[key as keyof typeof prev],
                  }))
                }
                aria-label={`Toggle ${ratingDataItem.label} visibility`}
              >
                <div
                  className={`w-3 h-3 rounded border`}
                  style={{
                    backgroundColor: ratingMetrics[
                      key as keyof typeof ratingMetrics
                    ]
                      ? ratingDataItem.color
                      : "transparent",
                    borderColor: ratingDataItem.color,
                  }}
                ></div>
                <span className="text-xs flex-1">{ratingDataItem.label}</span>
                <span className="text-xs text-gray-500">
                  ({ratingData?.data?.metadata?.data_points?.[key] || 0})
                </span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );

  // Filter data for close-up view
  const getFilteredData = (closeUpView: boolean) => {
    if (!closeUpView || chartData.length === 0) return chartData;
    const focusStartIndex = Math.max(
      0,
      Math.floor(chartData.length * (1 - CLOSE_UP_THRESHOLD))
    );
    return chartData.slice(focusStartIndex);
  };

  // Filter out points with all null values for active metrics
  const filterChartData = (
    data: ChartDataPoint[],
    metrics: Record<string, boolean>
  ) => {
    return data.filter((point) =>
      Object.keys(metrics).some(
        (key) => metrics[key] && point[key] !== null && point[key] !== undefined
      )
    );
  };

  return (
    <div className="border border-border rounded-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg text-[#01011D] mb-1">
              {priceData?.data?.product?.name || product.title}
            </h3>
            <p className="text-sm text-[#787891]">
              ASIN: {priceData?.data?.product?.asin || product.asin} |
              Marketplace: {priceData?.data?.product?.marketplace_id || "N/A"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-[#787891]">Current Price: </span>
              <span className="font-semibold text-[#01011D]">
                {priceData?.data?.price_history?.price_types?.buybox
                  ?.current_price
                  ? `$${priceData.data.price_history.price_types.buybox.current_price}`
                  : `$${product.currentPrice}`}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-[#787891]">Sales Rank: </span>
              <span className="font-semibold text-[#01011D]">
                #
                {salesRankData?.data?.sales_rank?.sales_rank_data?.main_bsr
                  ?.current_rank || product.salesRank}
              </span>
            </div>
          </div>
        </div>
      </div>

      <UniversalTimeController />

      {/* Error message display */}
      {fetchError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-6 py-3"
          role="alert"
        >
          <strong className="font-bold">Error! </strong>
          <span>{fetchError}</span>
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Main Price Chart */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative border border-gray-200 rounded bg-white overflow-hidden">
              <ChartCloseUpToggle
                closeUpView={priceCloseUpView}
                onToggle={setPriceCloseUpView}
                title="Price History"
              />

              <div className="h-72 relative overflow-hidden">
                {isLoadingOverall && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <LoadingOutlined spin />
                      Loading chart data...
                    </div>
                  </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filterChartData(
                      getFilteredData(priceCloseUpView),
                      priceMetrics
                    )}
                    margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
                    aria-label="Price history chart"
                  >
                    <CartesianGrid strokeDasharray="1 1" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="dateFormatted"
                      tick={{ fontSize: 10 }}
                      interval={Math.max(
                        1,
                        Math.floor(getFilteredData(priceCloseUpView).length / 8)
                      )}
                      minTickGap={30}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {priceMetrics.amazon && (
                      <Line
                        type="linear"
                        dataKey="amazon"
                        name="Amazon"
                        stroke={
                          priceData?.data?.price_history?.price_types?.amazon
                            ?.color || "#FF6B6B"
                        }
                        strokeWidth={1}
                        dot={false}
                        connectNulls={true}
                      />
                    )}
                    {priceMetrics.buybox && (
                      <Line
                        type="linear"
                        dataKey="buybox"
                        name="Buy Box"
                        stroke={
                          priceData?.data?.price_history?.price_types?.buybox
                            ?.color || "#4ECDC4"
                        }
                        strokeWidth={1}
                        dot={false}
                        connectNulls={true}
                      />
                    )}
                    {priceMetrics.new && (
                      <Line
                        type="linear"
                        dataKey="new"
                        name="New"
                        stroke={
                          priceData?.data?.price_history?.price_types?.new
                            ?.color || "#45B7D1"
                        }
                        strokeWidth={1}
                        dot={false}
                        connectNulls={true}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <PriceChartController />
        </div>

        {/* Category Sales Ranks Chart */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative border border-gray-200 rounded bg-white overflow-hidden">
              <ChartCloseUpToggle
                closeUpView={salesRankCloseUpView}
                onToggle={setSalesRankCloseUpView}
                title="Sales Rank & Volume"
              />

              <div className="h-56 relative overflow-hidden">
                {isLoadingOverall && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <LoadingOutlined spin />
                      Loading chart data...
                    </div>
                  </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filterChartData(
                      getFilteredData(salesRankCloseUpView),
                      salesRankMetrics
                    )}
                    margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
                    aria-label="Sales rank chart"
                  >
                    <CartesianGrid strokeDasharray="1 1" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="dateFormatted"
                      tick={{ fontSize: 10 }}
                      interval={Math.max(
                        1,
                        Math.floor(
                          getFilteredData(salesRankCloseUpView).length / 8
                        )
                      )}
                      minTickGap={30}
                    />

                    {/* Left axis for monthly sold */}
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      tick={{ fontSize: 10 }}
                     tickFormatter={(value) => abbreviateNumber(value)}
                    />

                    {/* Right axis for all sales ranks */}
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `#${abbreviateNumber(value)}`}
                      reversed={true}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {/* Map lines to correct axes */}
                    {Object.entries(salesRankMetrics).map(([key, isActive]) => {
                      if (!isActive) return null;
                      const rankData =
                        salesRankData?.data?.sales_rank?.sales_rank_data?.[key];
                      if (!rankData) return null;

                      // Assign monthly_sold to left axis, others to right
                      const yAxisIdToUse =
                        key === "monthly_sold" ? "left" : "right";

                      return (
                        <Line
                          key={key}
                          type="linear"
                          dataKey={key}
                          name={rankData.label}
                          stroke={rankData.color}
                          strokeWidth={1}
                          dot={false}
                          connectNulls={true}
                          yAxisId={yAxisIdToUse}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <SalesRankController />
        </div>

        {/* Rating Chart */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative border border-gray-200 rounded bg-white overflow-hidden">
              <ChartCloseUpToggle
                closeUpView={ratingCloseUpView}
                onToggle={setRatingCloseUpView}
                title="Rating & Reviews"
              />

              <div className="h-56 relative overflow-hidden">
                {isLoadingOverall && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <LoadingOutlined spin />
                      Loading chart data...
                    </div>
                  </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filterChartData(
                      getFilteredData(ratingCloseUpView),
                      ratingMetrics
                    )}
                    margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
                    aria-label="Rating and reviews chart"
                  >
                    <CartesianGrid strokeDasharray="1 1" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="dateFormatted"
                      tick={{ fontSize: 10 }}
                      interval={Math.max(
                        1,
                        Math.floor(
                          getFilteredData(ratingCloseUpView).length / 8
                        )
                      )}
                      minTickGap={30}
                    />
                    <YAxis
                      yAxisId="count"
                      orientation="left"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) =>
                        Math.round(value).toLocaleString()
                      }
                    />
                    <YAxis
                      yAxisId="rating"
                      orientation="right"
                      tick={{ fontSize: 10 }}
                      domain={[0, 5]}
                      tickFormatter={(value) => value.toFixed(1)}
                    />
                    <YAxis
                      yAxisId="offers"
                      orientation="right"
                      tick={{ fontSize: 10 }}
                      domain={[0, 5]} // Fixed domain for offer count (0-5)
                      hide={true} // Hide this axis since it's not used in the chart
                      tickFormatter={(value) => Math.round(value).toString()}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {ratingMetrics.rating_count && (
                      <Line
                        type="linear"
                        dataKey="rating_count"
                        name="Rating Count"
                        stroke={
                          ratingData?.data?.chart_data?.rating_count?.color ||
                          "#8884d8"
                        }
                        strokeWidth={1}
                        dot={false}
                        connectNulls={true}
                        yAxisId="count"
                      />
                    )}
                    {ratingMetrics.rating && (
                      <Line
                        type="linear"
                        dataKey="rating"
                        name="Rating"
                        stroke={
                          ratingData?.data?.chart_data?.rating?.color ||
                          "#82ca9d"
                        }
                        strokeWidth={1}
                        dot={false}
                        connectNulls={true}
                        yAxisId="rating"
                      />
                    )}
                    {ratingMetrics.new_offer_count && (
                      <Line
                        type="linear"
                        dataKey="new_offer_count"
                        name="New Offer Count"
                        stroke={
                          ratingData?.data?.chart_data?.new_offer_count
                            ?.color || "#ffc658"
                        }
                        strokeWidth={1}
                        dot={false}
                        connectNulls={true}
                        yAxisId="offers"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <RatingController />
        </div>

        {/* Chart Footer Info */}
        <div className="mt-4 text-xs text-[#787891] space-y-1">
          <div className="flex items-center gap-4 mt-2">
            <span>
              Current BSR: #
              {salesRankData?.data?.sales_rank?.sales_rank_data?.main_bsr
                ?.current_value || "N/A"}
            </span>
            <span>
              Best: #
              {salesRankData?.data?.sales_rank?.sales_rank_data?.main_bsr
                ?.best_value || "N/A"}
            </span>
            <span>
              Worst: #
              {salesRankData?.data?.sales_rank?.sales_rank_data?.main_bsr
                ?.worst_value || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="p-6 border-t border-border bg-[#FAFAFA]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[#787891] mb-1">Category Sales Ranks</p>
            <div className="space-y-1">
              {summaryData?.data?.category_sales_ranks
                ?.slice(0, 2)
                .map((category: any, index: number) => (
                  <div key={category.name} className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded bg-green-${
                        500 + index * 100
                      }`}
                    ></span>
                    <span className="text-[#01011D] text-xs">
                      {category.name}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <p className="text-[#787891] mb-1">Current Data</p>
            <div className="space-y-1 text-xs">
              <p>
                Rating:{" "}
                {summaryData?.data?.current_data?.rating?.toFixed(1) || "N/A"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[#787891] mb-1">Price Range</p>
            <div className="space-y-1 text-xs">
              <p>
                High: {summaryData?.data?.price_range?.currency || "$"}
                {summaryData?.data?.price_range?.high || "N/A"}
              </p>
              <p>
                Low: {summaryData?.data?.price_range?.currency || "$"}
                {summaryData?.data?.price_range?.low || "N/A"}
              </p>
              <p>
                Current: {summaryData?.data?.price_range?.currency || "$"}
                {summaryData?.data?.price_range?.current || "N/A"}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium">
              {summaryData?.data?.metadata?.timestamp || "N/A"}
            </p>
            {isLoadingOverall && (
              <div className="flex items-center gap-1 justify-end mt-1">
                <LoadingOutlined spin style={{ fontSize: "12px" }} />
                <span className="text-xs text-blue-600">Updating...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
