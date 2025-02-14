import { useState } from "react";

import {
  CustomSwitch as Switch,
  CustomInput as Input,
  CustomPasswordInput,
} from "@/lib/AntdComponents";
import { IoMdInformationCircleOutline } from "react-icons/io";

const UserDetails = () => {
  const [vatEnabled, setVatEnabled] = useState(true);
  const [vatType, setVatType] = useState<"standard" | "flat">("standard");

  return (
    <div className="flex flex-col gap-6">
      {/* Email Address */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-between sm:items-center">
        <span className="flex flex-col gap-1 sm:min-w-[400px] max-w-[412px] text-[#C2C2CE]">
          <label htmlFor="email" className="text-[#01011D] font-medium">
            Email Address<span className="text-red-500">*</span>
          </label>

          <p className="text-sm flex gap-1 items-center">
            <IoMdInformationCircleOutline className="size-4" />
            To change this email,{" "}
            <button type="button" className="underline">
              click here
            </button>
          </p>
        </span>
        <Input
          id="email"
          type="email"
          placeholder="Tunde@yahoo.com"
          className="px-3 py-2"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-between sm:items-center">
        <span className="flex flex-col gap-1 sm:min-w-[400px] max-w-[412px] text-[#C2C2CE]">
          <label htmlFor="password" className="text-[#01011D] font-medium">
            Password
          </label>
          <p className="text-sm flex gap-1 items-center">
            <IoMdInformationCircleOutline className="size-4" /> Keep your
            password safe and secured
          </p>
        </span>

        <CustomPasswordInput
          id="password"
          placeholder="******"
          className="px-3 py-2"
        />
      </div>

      {/* VAT Scheme Toggle */}
      <div className="flex items-center gap-2">
        <p className="font-medium flex items-center gap-1">
          VAT Scheme<span className="text-red-500">*</span>{" "}
          <span className="text-sm text-[#787891] flex items-center gap-1">
            (optional){" "}
            <button type="button" aria-label="Info">
              <IoMdInformationCircleOutline className="size-4" />
            </button>
          </span>
        </p>
        <Switch checked={vatEnabled} onChange={setVatEnabled} />
      </div>

      {/* VAT Type Selection */}
      {vatEnabled && (
        <div className="bg-[#F7F7F7] border border-border rounded-2xl p-4 flex flex-col gap-1">
          <label className="font-medium">
            VAT Type<span className="text-red-500">*</span>
          </label>

          <div className="flex flex-col gap-6">
            <div className="flex justify-between gap-2">
              <button
                type="button"
                className={`flex-1 p-1.5 rounded-md border border-border text-sm font-medium ${
                  vatType === "standard" ? "bg-white" : "text-gray-600"
                }`}
                onClick={() => setVatType("standard")}
              >
                Standard Rate
              </button>
              <button
                type="button"
                className={`flex-1 p-1.5 rounded-md border border-border text-sm font-medium ${
                  vatType === "flat" ? "bg-white" : "text-gray-600"
                }`}
                onClick={() => setVatType("flat")}
              >
                Flat Rate
              </button>
            </div>

            {/* VAT Rate Fields */}
            {vatType === "standard" && (
              <div className="grid grid-cols-2 gap-4">
                <span className="flex flex-col gap-4">
                  <label
                    htmlFor="standard-rates"
                    className="text-sm font-medium"
                  >
                    Standard Rate
                  </label>
                  <Input
                    id="standard-rates"
                    defaultValue="10%"
                    className="px-3 py-2"
                  />
                </span>
                <span className="flex flex-col gap-4">
                  <label
                    htmlFor="reduced-rates"
                    className="text-sm font-medium"
                  >
                    Reduced Rate
                  </label>
                  <Input
                    id="reduced-rates"
                    defaultValue="0.00%"
                    className="px-3 py-2"
                  />
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          className="px-6 py-2 bg-primary hover:bg-primary-hover rounded-xl text-white text-sm font-medium"
        >
          Save
        </button>
      </div>

      {/* others */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-between sm:items-center">
          <span className="flex flex-col gap-1 sm:min-w-[400px] max-w-[412px] text-[#C2C2CE]">
            <span className="text-sm text-[#787891] flex items-center gap-1">
              <label
                htmlFor="prep-fee"
                className="text-base text-[#01011D] font-medium"
              >
                Prep Fee
              </label>
              (optional)
            </span>
            <p className="text-sm flex gap-1 items-center">
              <IoMdInformationCircleOutline className="size-4" /> Fees if using
              a prep centre for FBA, to include in calculations.
            </p>
          </span>

          <Input id="prep-fee" defaultValue="$0.00" className="px-3 py-2" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-between sm:items-center">
          <span className="flex flex-col gap-1 sm:min-w-[400px] max-w-[412px] text-[#C2C2CE]">
            <span className="text-sm text-[#787891] flex items-center gap-1">
              <label
                htmlFor="misc-fee"
                className="text-base text-[#01011D] font-medium"
              >
                Misc Fee
              </label>
              (optional)
            </span>
            <p className="text-sm flex gap-1 items-center">
              <IoMdInformationCircleOutline className="size-4" /> Any other per
              item costs to include in calculations
            </p>
          </span>

          <Input id="misc-fee" defaultValue="$0.00" className="px-3 py-2" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-between sm:items-center">
          <span className="flex flex-col gap-1 sm:min-w-[400px] max-w-[412px] text-[#C2C2CE]">
            <label
              htmlFor="misc-fee-percent"
              className=" text-[#01011D] font-medium"
            >
              Misc Fee %
            </label>

            <p className="text-sm flex gap-1 items-center">
              <IoMdInformationCircleOutline className="size-4" /> Any other per
              item cost, as a percentage of the product cost,to include in
              calculations
            </p>
          </span>

          <Input
            id="misc-fee-percent"
            defaultValue="$0.00"
            className="px-3 py-2"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-between sm:items-center">
          <span className="flex flex-col gap-1 sm:min-w-[400px] max-w-[412px] text-[#C2C2CE]">
            <span className="text-sm text-[#787891] flex items-center gap-1">
              <label
                htmlFor="inbound-shipping"
                className="text-base text-[#01011D] font-medium"
              >
                Inbound Shipping
              </label>
              (optional)
            </span>
            <p className="text-sm flex gap-1 items-center">
              <IoMdInformationCircleOutline className="size-4" /> Your FBA
              inbound shipping rates to include in calculations
            </p>
          </span>

          <Input
            id="inbound-shipping"
            defaultValue="$0.00"
            className="px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
