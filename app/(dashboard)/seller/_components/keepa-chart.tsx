import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BiChevronDown } from "react-icons/bi";

interface ChartDataPoint {
  date: string;
  price: number;
}

interface ChartRangeData {
  amazon?: ChartDataPoint[];
  sales_rank?: ChartDataPoint[];
  new_fba?: ChartDataPoint[];
}

interface ChartData {
  [key: string]: ChartRangeData | undefined;
}

interface KeepaChartProps {
  chartData?: ChartData | null;
  currency?: string;
}

const KeepaChart = ({ chartData, currency = "" }: KeepaChartProps) => {
  const [timeRange, setTimeRange] = useState("30");
  const transformData = () => {
    if (!chartData) return [];

    const rangeData = chartData[timeRange];

    if (!rangeData) return [];

    const amazonData = rangeData.amazon || [];
    const salesRankData = rangeData.sales_rank || [];
    const newFBAData = rangeData.new_fba || [];

    // Combine all dates from all data sources
    const allDates = [
      ...amazonData.map((d: ChartDataPoint) => d.date),
      ...salesRankData.map((d: ChartDataPoint) => d.date),
      ...newFBAData.map((d: ChartDataPoint) => d.date),
    ];

    const uniqueDates = [...new Set(allDates)].sort();

    return uniqueDates.map((date) => {
      return {
        date,
        amazon:
          amazonData.find((d: ChartDataPoint) => d.date === date)?.price ||
          null,
        sales_rank:
          salesRankData.find((d: ChartDataPoint) => d.date === date)?.price ||
          null,
        new_fba:
          newFBAData.find((d: ChartDataPoint) => d.date === date)?.price ||
          null,
      };
    });
  };

  const chartDataTransformed = transformData();

  if (
    !chartData ||
    !Object.keys(chartData).length ||
    !chartDataTransformed.length
  ) {
    return (
      <div className="rounded-xl border border-border p-4 bg-white">
        <div className="flex justify-between items-center mb-4">
          <p className="bg-[#F3F4F6] rounded-2xl py-2 px-4 text-[#676A75] font-semibold w-max text-xs">
            Keepa
          </p>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No chart data available
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
        <div className="p-4 flex gap-4 justify-between">
          <p className="bg-[#F3F4F6] rounded-2xl py-2 px-4 text-[#676A75] font-semibold w-max text-xs">
            Keepa
          </p>
          <div className="relative">
            <select
              aria-label="Filter"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-primary flex items-center gap-2.5 rounded-2xl py-2 pl-3 pr-8 text-white font-semibold w-max text-xs appearance-none outline-none"
            >
              <option value="30" className="bg-white text-black rounded-t-md">
                30 days
              </option>
              <option value="90" className="bg-white text-black rounded-t-md">
                90 days
              </option>
              <option value="180" className="bg-white text-black rounded-t-md">
                180 days
              </option>
              <option value="all" className="bg-white text-black rounded-t-md">
                All time
              </option>
            </select>
            <BiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
          </div>
        </div>

        <div className="p-3 relative h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartDataTransformed}
              margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(date) =>
                  new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                tick={{ fontSize: 10 }}
              />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <Tooltip
                formatter={(value) => [`${currency}${value}`, ""]}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              {chartData[timeRange]?.amazon && (
                <Line
                  type="monotone"
                  dataKey="amazon"
                  stroke="#FF6B6B"
                  strokeWidth={2}
                  dot={false}
                  name="AMAZON"
                  activeDot={{ r: 4 }}
                />
              )}
              {chartData[timeRange]?.sales_rank && (
                <Line
                  type="monotone"
                  dataKey="sales_rank"
                  stroke="#4ECDC4"
                  strokeWidth={4}
                  dot={false}
                  name="SALES RANK"
                  activeDot={{ r: 4 }}
                />
              )}
              {chartData[timeRange]?.new_fba && (
                <Line
                  type="monotone"
                  dataKey="new_fba"
                  stroke="#6A67CE"
                  strokeWidth={4}
                  dot={false}
                  name="NEW FBA"
                  activeDot={{ r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default KeepaChart;

