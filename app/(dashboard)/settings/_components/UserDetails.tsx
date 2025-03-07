import { useState } from "react";

import {
  CustomSwitch as Switch,
  CustomInput as Input,
  CustomPasswordInput,
} from "@/lib/AntdComponents";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useUpdateSettingsMutation } from "@/redux/api/user";
import { Button, message } from "antd";



interface UserData {
  email: string;
  password:string,
  misc_fee: number;
  misc_fee_percentage: number;
  inbound_shipping: number;
  prep_fee: number;
  vat: {
    flat_rate: { rate: number };
    standard_rate: { rate: number; reduced_rate: number };
  };
}

interface UserDetailsProps {
  userData: {
    email: string;
    password:string,
    misc_fee: number,
    misc_fee_percentage: number,
    inbound_shipping: number,
prep_fee: number,
    vat: {
      flat_rate: { rate: number };
      standard_rate: { rate: number; reduced_rate: number };
    };
  };
}

const UserDetails = ({ userData }: UserDetailsProps) => {
  const [vatEnabled, setVatEnabled] = useState(true);
  const [vatType, setVatType] = useState<"standard" | "flat">("standard");
const [saveSettings,{isLoading}] = useUpdateSettingsMutation()
  const [formData, setFormData] = useState<UserData>(userData);
  const [messageApi, contextHolder] = message.useMessage();

  // Handle Input Change
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? 0 : parseFloat(value),
    }));
  };

  

  // Handle VAT Change
  const handleVatChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      vat: {
        ...prev.vat,
        [vatType === "standard" ? "standard_rate" : "flat_rate"]: {
          ...prev.vat[vatType === "standard" ? "standard_rate" : "flat_rate"],
          [field]: value === "" ? 0 : parseFloat(value), // Ensure it's a valid number
        },
      },
    }));
  };

  const handleSaveUser = () => {
    const updatedFields: Partial<UserData> = {};

    Object.keys(formData).forEach((key) => {
      const typedKey = key as keyof UserData;
      if (JSON.stringify(formData[typedKey]) !== JSON.stringify(userData[typedKey])) {
        (updatedFields[typedKey] as unknown) = formData[typedKey];
      }
    });
  
    if (Object.keys(updatedFields).length === 0) {
      messageApi.info("No changes detected.");
      return;
    }
  
    saveSettings(updatedFields).unwrap()
      .then(() => {
        messageApi.success("Your User Details Saved.");
      })
      .catch(() => {
        messageApi.error("Failed to Save Details");
      });
  };

  return (
    <div className="flex flex-col gap-6">
      {contextHolder}
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
          value={formData?.email}
          onChange={(e) => handleChange("email", e.target.value)}
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
          value={formData?.password}
          onChange={(e) => handleChange("password", e.target.value)}
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
                    value={`${formData?.vat?.standard_rate.rate ?? ""}`}
                    onChange={(e) =>
                      handleVatChange("rate", e.target.value)
                    }
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
                    id="reduced-rate"
                    defaultValue="0.00%"
                    className="px-3 py-2"
                    value={`${formData?.vat?.standard_rate?.reduced_rate ?? ""}`}
                    onChange={(e) =>
                      handleVatChange("reduced_rate", e.target.value)
                    }
                  />
                </span>
              </div>
            )}

            {vatType === "flat" && (
              <div>
                <span className="flex flex-col gap-4">
                  <label htmlFor="flat-rate" className="text-sm font-medium">
                    Flat rate
                  </label>
                  <Input
                    id="flat-rate"
                    defaultValue="0.00%"
                    className="px-3 py-2"
                    value={`${formData?.vat?.flat_rate?.rate ?? ""}`}
                  onChange={(e) =>
                    handleVatChange("rate", e.target.value)
                  }
                  />
                </span>
              </div>
            )}
          </div>
        </div>
      )}

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

          <Input id="prep-fee" defaultValue="$0.00" className="px-3 py-2" 
          value={`${formData?.prep_fee ?? ""}`}
          onChange={(e) => handleChange("prep_fee", e.target.value)} />
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

          <Input id="misc-fee" defaultValue="$0.00" className="px-3 py-2" 
          value={`${formData?.misc_fee ?? ""}`}
          onChange={(e) => handleChange("misc_fee", e.target.value)} />
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
            value={`${formData?.misc_fee_percentage ?? ""}`}
            onChange={(e) => handleChange("misc_fee_percentage", e.target.value)}
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
            value={`${formData?.inbound_shipping ?? ""}`}
            onChange={(e) => handleChange("inbound_shipping", e.target.value)}
          />
        </div>

        <div>
          <Button
            htmlType="submit"
            className="!px-6 !py-2 !bg-primary !border-none hover:!bg-primary-hover !rounded-xl !text-white !text-sm !font-medium"
            loading={isLoading}
            onClick={handleSaveUser}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
