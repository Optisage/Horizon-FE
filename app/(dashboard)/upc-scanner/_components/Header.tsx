import Image from "next/image";
import { CustomSelect as Select } from "@/lib/AntdComponents";
import { HiOutlineDocumentArrowDown, HiOutlinePrinter } from "react-icons/hi2";
import ExcelIcon from "@/public/assets/svg/excel-icon.svg";

const Header = () => {
  return (
    <div className="p-3 sm:p-4 rounded-xl border border-border flex flex-col lg:flex-row gap-4 justify-between xl:items-center">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        Calculate profit by{" "}
        <Select
          className="sm:min-w-[280px]"
          defaultValue="buybox_price"
          options={[
            {
              value: "buybox_price",
              label: "Buy box price if no selling promo",
            },
          ]}
        />
      </div>

      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
        <button
          type="button"
          className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 transition-colors rounded-full text-white font-semibold py-2 px-4"
        >
          <HiOutlinePrinter className="size-6" />
          Start Scanner
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 hover:bg-gray-50 rounded-full text-[#8C94A2] border border-border font-semibold py-2 px-4"
        >
          <HiOutlineDocumentArrowDown className="size-6" />
          Import
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 hover:bg-gray-50 rounded-full text-[#8C94A2] border border-border font-semibold py-2 px-4"
        >
          <Image
            src={ExcelIcon}
            alt="Excel icon"
            className="size-6"
            width={21}
            height={20}
            unoptimized
          />
          Excel Template
        </button>
      </div>
    </div>
  );
};

export default Header;

