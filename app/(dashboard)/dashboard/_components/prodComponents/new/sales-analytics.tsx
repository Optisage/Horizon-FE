import { BsArrowDown, BsArrowUp } from "react-icons/bs";

const SalesAnalytics = () => {
  return (
    <div className="rounded-xl bg-white p-4 lg:p-5">
      <span className="bg-[#F3F4F6] px-3 py-1.5 rounded-3xl text-[#676A75] font-semibold text-sm w-max">
        Sales Analytics
      </span>

      <div className="mt-5 bg-[#FEF9F5] rounded-[10px] p-3 text-sm font-medium flex items-center gap-6 justify-between">
        <span className="flex flex-col gap-1.5">
          <p className="text-[#E88001]">Net Revenue</p>
          <p className="text-black text-lg font-semibold">$55.82</p>
        </span>
        <p className="text-[#18CB96] flex items-center gap-1">
          <BsArrowUp /> 23.5%
        </p>
      </div>

      <div className="mt-5 bg-[#FAFAFB] border border-[#E0E4EE] text-[#595959] rounded-[10px] text-sm flex divide-x divide-[#E0E4EE]">
        <div className="flex-1 flex flex-col gap-1 p-3">
          <p className="text-[#009F6D] flex items-center gap-1">
            <BsArrowUp /> 23.5%
          </p>
          <p className="flex items-center gap-1">Price</p>
          <p className="text-[#596375] font-bold text-lg">$34.19</p>
        </div>

        <div className="flex-1 flex flex-col gap-1 p-3">
          <p className="text-[#009F6D] flex items-center gap-1">
            <BsArrowUp /> 23.5%
          </p>
          <p className="flex items-center gap-1">Monthly Units Sold</p>
          <p className="text-[#596375] font-bold text-lg">8000 / month</p>
        </div>
      </div>

      <div className="mt-4 border border-[#E0E4EE] text-[#595959] rounded-[10px] text-sm flex divide-x divide-[#E0E4EE]">
        <div className="flex-1 flex flex-col gap-1 p-3">
          <p className="text-[#FD3E3E] flex items-center gap-1">
            <BsArrowDown /> 23.5%
          </p>
          <p className="flex items-center gap-1">Daily Units Sold</p>
          <p className="text-[#596375] font-bold text-lg">573</p>
        </div>

        <div className="flex-1 flex flex-col gap-1 p-3">
          <p className="text-[#009F6D] flex items-center gap-1">
            <BsArrowUp /> 23.5%
          </p>
          <p className="flex items-center gap-1">Monthly Revenue</p>
          <p className="text-[#596375] font-bold text-lg">$481,278</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-1.5 text-sm text-[#595959] px-2">
        <span className="flex items-center gap-4 justify-between">
          <p>Date First Available</p>
          <p className="text-black font-semibold">07/05/2021</p>
        </span>
        <span className="flex items-center gap-4 justify-between">
          <p>Seller Type</p>
          <p className="text-black font-semibold">AMZ</p>
        </span>
        <span className="flex items-center gap-4 justify-between">
          <p>No of Sellers</p>
          <p className="text-black font-semibold flex items-center gap-2">
            <span className="bg-[#009F6D0A] py-1 px-2 rounded-full text-[8px] text-[#008E61] flex items-center gap-1">
              <BsArrowUp />
              23.5%
            </span>
            5 Sellers
          </p>
        </span>
      </div>
    </div>
  );
};

export default SalesAnalytics;

