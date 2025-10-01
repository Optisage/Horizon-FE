"use client";

import { BiChevronDown } from "react-icons/bi";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = new Array(50)
  .fill(1)
  .map((_, i) => ({ name: `Step ${i + 1}`, value: 1 }));

const gradientColors = [
  // 8–20: Orange-y yellow
  "#FDCA40",
  "#FDCA40",
  "#FDCA40",
  "#FDCA40",
  "#FDCA40",
  "#FDCA40",
  "#FDCA40",
  "#FDCA40",
  "#FDCA40",
  "#FDCA40",
  "#FDCA40",
  "#FDCA40",
  "#FDCA40",
  // 21–24: Warm orange
  "#FFA15B",
  "#FFA15B",
  "#FFA15B",
  "#FFA15B",
  // 0–4: Purple
  "#6610F2",
  "#6610F2",
  "#6610F2",
  "#6610F2",
  "#6610F2",
  // 5–7: Blue
  "#458BE1",
  "#458BE1",
  "#458BE1",
  // 25–35: Red-orange
  "#FF715B",
  "#FF715B",
  "#FF715B",
  "#FF715B",
  "#FF715B",
  "#FF715B",
  "#FF715B",
  "#FF715B",
  "#FF715B",
  "#FF715B",
  "#FF715B",
  // 36–45: Transition yellow-orange
  "#F38D2E",
  "#F38D2E",
  "#F38D2E",
  "#FDCA40",
  "#FDCA40",
  "#FFA15B",
  "#FFA15B",
  "#FDCA40",
  "#FDCA40",
  "#F38D2E",

  // 46–49: Orange
  "#FFA15B",
  "#FFA15B",
  "#FFA15B",
  "#FFA15B",
];

const BuyboxAnalysis = () => {
  return (
    <div className="rounded-xl bg-white p-4 lg:p-5">
      <div className="flex gap-4 items-center justify-between">
        <span className="bg-[#F3F4F6] px-3 py-1.5 rounded-3xl text-[#676A75] font-semibold text-sm w-max">
          Buy Box Analysis
        </span>

        <div className="relative">
          <select
            aria-label="Filter"
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

      <div className="mt-6">{/* Chart */}</div>

      <div
        className="relative flex items-center justify-center"
        style={{ height: 250 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={100}
              startAngle={90}
              endAngle={-270}
              paddingAngle={1}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={gradientColors[index % gradientColors.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute text-center">
          <div className="text-2xl lg:text-3xl xl:text-[32px] font-bold text-[#414D55]">
            60+
          </div>
          <div className="text-xs text-[#696D6E] font-medium">PRODUCTS</div>
        </div>

        {/* First Step Tag */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 -translate-y-full bg-white px-2 py-1 rounded-full shadow text-xs font-semibold text-black">
          FIRST STEP
        </div>
      </div>
    </div>
  );
};

export default BuyboxAnalysis;

