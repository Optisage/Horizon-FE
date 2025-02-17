import { CustomInput as Input } from "@/lib/AntdComponents";
import { IoMdInformationCircleOutline } from "react-icons/io";

const BuyingCriteria = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-between sm:items-center">
        <span className="flex flex-col gap-1 sm:min-w-[400px] max-w-[412px] text-[#C2C2CE]">
          <label htmlFor="mimimum-bsr" className=" text-[#01011D] font-medium">
            Minimum BSR(%)
          </label>

          <p className="text-sm flex gap-1 items-center">
            <IoMdInformationCircleOutline className="size-4" /> Opitsage will
            highlight if the product meets this minimum best sellers rank
            requirement (as a percentage, within the category)
          </p>
        </span>

        <Input id="mimimum-bsr" defaultValue="$0.00" className="px-3 py-2" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-between sm:items-center">
        <span className="flex flex-col gap-1 sm:min-w-[400px] max-w-[412px] text-[#C2C2CE]">
          <label htmlFor="maximum-bsr" className=" text-[#01011D] font-medium">
            Maximum BSR(%)
          </label>

          <p className="text-sm flex gap-1 items-center">
            <IoMdInformationCircleOutline className="size-4" /> Opitsage will
            highlight if the product meets this maximum best sellers rank
            requirement (as a percentage, within the category)
          </p>
        </span>

        <Input id="maximum-bsr" defaultValue="$0.00" className="px-3 py-2" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-between sm:items-center">
        <span className="flex flex-col gap-1 sm:min-w-[400px] max-w-[412px] text-[#C2C2CE]">
          <label
            htmlFor="minimum-profit"
            className=" text-[#01011D] font-medium"
          >
            Minimum Profit
          </label>

          <p className="text-sm flex gap-1 items-center">
            <IoMdInformationCircleOutline className="size-4" /> Opitsage
            highlights if the product meets this minimum profit. Also used to
            calculate the max cost to meet this requirement.
          </p>
        </span>

        <Input id="minimum-profit" defaultValue="$0.00" className="px-3 py-2" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-between sm:items-center">
        <span className="flex flex-col gap-1 sm:min-w-[400px] max-w-[412px] text-[#C2C2CE]">
          <label htmlFor="minimum-roi" className=" text-[#01011D] font-medium">
            Minimum ROI
          </label>

          <p className="text-sm flex gap-1 items-center">
            <IoMdInformationCircleOutline className="size-4" /> Opitsage
            highlights if the product meets this minimum return on investment.
            Also used to calculate the max cost to meet this requirement.
          </p>
        </span>

        <Input id="minimum-roi" defaultValue="$0.00" className="px-3 py-2" />
      </div>
    </div>
  );
};

export default BuyingCriteria;
