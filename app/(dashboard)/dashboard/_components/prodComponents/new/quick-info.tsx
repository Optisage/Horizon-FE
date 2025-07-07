import { BiChevronRight } from "react-icons/bi";
import { NotificationIcon } from "./icons";

const QuickInfo = () => {
  return (
    <div className="rounded-xl bg-white">
      <div className="border-b border-[#E7EBEE] p-4 lg:p-5 flex items-center gap-2">
        <span className="bg-primary px-3 py-1.5 rounded-3xl text-white font-semibold text-sm w-max">
          Quick Info
        </span>
        <span className="bg-[#F3F4F6] px-3 py-1.5 rounded-3xl text-[#676A75] font-semibold text-sm w-max">
          Optisage Analysis
        </span>
      </div>

      <div className="p-4 lg:p-5">
        <div className="grid grid-cols-[4fr_2fr] gap-4">
          <div className="border border-[#FFE6C2] text-[#4A4A4A] rounded-[10px] text-xs flex flex-col">
            <span className="px-4 py-3 rounded-t-[10px]">
              Eligible For Sale
            </span>
            <button className="px-4 py-3 rounded-b-[10px] bg-[#FFC56E1F] text-[#FFA216] font-semibold flex items-center justify-between gap-4">
              <p>Check Alerts Panel</p>
              <BiChevronRight size={20} />
            </button>
          </div>
          <div className="border border-[#E0E4EE] text-[#4A4A4A] rounded-[10px] text-xs flex flex-col">
            <span className="p-3 rounded-t-[10px]">Alerts</span>
            <span className="p-3 rounded-b-[10px] bg-[#18CB9612] text-[#009F6D] font-semibold flex items-center justify-between gap-4">
              <p>6</p>
              <NotificationIcon />
            </span>
          </div>
        </div>

        <div className="mt-5 border border-[#E0E4EE] text-[#8E949F] rounded-[10px] text-xs flex divide-x divide-[#E0E4EE]">
          <div className="flex-1 flex flex-col gap-0.5 p-4">
            <span className="flex items-center gap-1">
              BSR
              <span className="bg-[#FF8551] w-[12.5px] h-2 rounded-full" />
            </span>
            <p className="text-[#596375] font-bold text-base">3k (1%)</p>
          </div>
          <div className="flex-1 flex flex-col gap-0.5 p-4 bg-[#FAFBFB]">
            <span className="flex items-center gap-1">
              Est. Sales
              <span className="bg-[#3895F9] w-[12.5px] h-2 rounded-full" />
            </span>
            <p className="text-[#596375] font-bold text-base">
              500+/<span className="text-[#939EB2]">mo</span>
            </p>
          </div>
          <div className="flex-1 flex flex-col gap-0.5 p-4">
            <span className="flex items-center gap-1">
              Max Cost
              <span className="bg-primary w-[12.5px] h-2 rounded-full" />
            </span>
            <p className="text-[#596375] font-bold text-base">C$ 36.50</p>
          </div>
        </div>

        <div className="mt-5 text-[#676A75] font-medium text-xs grid grid-cols-2 gap-4">
          <span className="flex flex-col gap-2">
            <label htmlFor="cost_price">Cost Price</label>
            <input
              id="cost_price"
              type="text"
              defaultValue={"$40,000"}
              className="text-[#596375] text-sm font-normal border border-border focus:border-primary rounded-[10px] px-3 py-2 outline-none transition-colors"
            />
          </span>
          <span className="flex flex-col gap-2">
            <label htmlFor="sales_price">Sales Price</label>
            <input
              id="sales_price"
              type="text"
              defaultValue={"$40,000"}
              className="text-[#596375] text-sm font-normal border border-border focus:border-primary rounded-[10px] px-3 py-2 outline-none transition-colors"
            />
          </span>
        </div>

        <div className="mt-5 bg-[#FAFBFB] border border-[#E0E4EE] text-[#8E949F] rounded-[10px] text-xs flex divide-x divide-[#E0E4EE]">
          <div className="flex-1 flex flex-col gap-0.5 p-4">
            <span className="flex items-center gap-1">
              Profit
              <span className="bg-primary w-[12.5px] h-2 rounded-full" />
            </span>
            <p className="text-[#596375] font-bold text-base">C$ 9.13</p>
          </div>
          <div className="flex-1 flex flex-col gap-0.5 p-4">
            <span className="flex items-center gap-1">
              Profit (%)
              <span className="bg-[#3895F9] w-[12.5px] h-2 rounded-full" />
            </span>
            <p className="text-[#596375] font-bold text-base">14.85%</p>
          </div>
          <div className="flex-1 flex flex-col gap-0.5 p-4">
            <span className="flex items-center gap-1">
              ROI
              <span className="bg-[#FF8551] w-[12.5px] h-2 rounded-full" />
            </span>
            <p className="text-[#596375] font-bold text-base">25.01%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickInfo;

