import MiniDatePicker from "@/app/(dashboard)/upc-scanner/_components/date-picker";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TooltipProps } from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

type ChartData = {
  date: string;
  Amazon: number;
  BuyBox: number;
};

const data: ChartData[] = [
  { date: "Jan 1", Amazon: 8000, BuyBox: 3000 },
  { date: "Jan 2", Amazon: 4000, BuyBox: 3500 },
  { date: "Jan 3", Amazon: 2000, BuyBox: 2000 },
  { date: "Jan 4", Amazon: 5000, BuyBox: 4000 },
  { date: "Jan 5", Amazon: 4500, BuyBox: 3700 },
];

const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-white p-2 border rounded shadow text-xs">
        <p className="text-gray-700">{`${payload[0].payload.date}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: $${(Number(entry.value) / 1000).toFixed(0)}k`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const MarketAnalysis = () => {
  return (
    <div className="rounded-xl bg-white p-4 lg:p-5">
      <div className="flex items-center gap-4 justify-between">
        <span className="bg-[#F3F4F6] px-3 py-1.5 rounded-3xl text-[#676A75] font-semibold text-sm w-max">
          Market Analysis
        </span>

        <MiniDatePicker />
      </div>

      <div className="mt-5 flex items-center gap-1 text-xs">
        <button
          type="button"
          className="bg-[#18CB961F] border border-transparent rounded-full px-3 py-2 text-[#009F6D] font-semibold"
        >
          Price
        </button>
        <button
          type="button"
          className="border border-border rounded-full px-3 py-2 text-[#939AA6]"
        >
          Volume
        </button>
        <button
          type="button"
          className="border border-border rounded-full px-3 py-2 text-[#939AA6]"
        >
          Reviews
        </button>
      </div>

      {/* legend */}
      <div className="mt-5 text-[#596375] text-sm font-semibold flex items-center gap-4">
        <span className="flex gap-1 items-center">
          <span className="size-3.5 bg-[#F20B7A] rounded-md" />
          <p>Amazon</p>
        </span>
        <span className="flex gap-1 items-center">
          <span className="size-3.5 bg-[#18CB96] rounded-md" />
          <p>Buy Box</p>
        </span>
      </div>

      <div className="mt-5">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 20, right: -10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="Amazon"
              stroke="#f81d75"
              strokeWidth={3}
              dot={{ stroke: "#f81d75", strokeWidth: 2, fill: "#fff", r: 6 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="BuyBox"
              stroke="#00c48c"
              strokeWidth={3}
              dot={{ stroke: "#00c48c", strokeWidth: 2, fill: "#fff", r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MarketAnalysis;

