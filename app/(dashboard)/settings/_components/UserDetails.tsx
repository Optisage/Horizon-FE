import { useEffect, useState } from "react";

import {
  CustomSwitch as Switch,
  CustomInput as Input,
  CustomPasswordInput,
} from "@/lib/AntdComponents";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useUpdateSettingsMutation } from "@/redux/api/user";
import { Button, message } from "antd";
import ChangePasswordModal from "./changePassword";
import { useChangePasswordMutation } from "@/redux/api/auth";
//import { password } from "@/lib/validationSchema";
import { FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface UserData {
  email: string;
  password: string;
  misc_fee: number;
  misc_fee_percentage: number;
  inbound_shipping: number;
  prep_fee: number;
  vat: {
    toggle: boolean;
    flat_rate: { rate: number };
    standard_rate: { rate: number; reduced_rate: number };
  };
}

interface UserDetailsProps {
  userData: {
    email: string;
    password: string;
    misc_fee: number;
    misc_fee_percentage: number;
    inbound_shipping: number;
    prep_fee: number;
    vat: {
      toggle: boolean;
      flat_rate: { rate: number };
      standard_rate: { rate: number; reduced_rate: number };
    };
  };
}

const defaultUserData: UserData = {
  email: "",
  password: "",
  misc_fee: 0,
  misc_fee_percentage: 0,
  inbound_shipping: 0,
  prep_fee: 0,
  vat: {
    toggle: true,
    flat_rate: { rate: 0 },
    standard_rate: { rate: 0, reduced_rate: 0 },
  },
};
const UserDetails = ({ userData }: UserDetailsProps) => {
  const router = useRouter();
  //const [vatEnabled, setVatEnabled] = useState(true);
  const [ChangeVisible, setChangeVisible] = useState(false);

  const [vatType, setVatType] = useState<"standard" | "flat">("standard");
  const [saveSettings, { isLoading }] = useUpdateSettingsMutation();
  const [changePassword, { isLoading: passwordLoading }] =
    useChangePasswordMutation();
  const [changePasswordErrors, setChangePasswordErrors] =
    useState<Record<string, string[]>>();
  const [messageApi, contextHolder] = message.useMessage();

  const [formData, setFormData] = useState<UserData>({
    ...defaultUserData,
    ...userData,
    vat: {
      toggle: userData?.vat?.toggle ?? defaultUserData.vat.toggle,
      flat_rate: {
        ...defaultUserData.vat.flat_rate,
        ...(userData?.vat?.flat_rate || {}),
      },
      standard_rate: {
        ...defaultUserData.vat.standard_rate,
        ...(userData?.vat?.standard_rate || {}),
      },
    },
  });

  // Handle Input Change
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? 0 : parseFloat(value),
    }));
  };

  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        ...userData,
        vat: {
          toggle: userData?.vat?.toggle ?? prev.vat.toggle,
          flat_rate: { ...prev.vat.flat_rate, ...userData?.vat?.flat_rate },
          standard_rate: {
            ...prev.vat.standard_rate,
            ...userData?.vat?.standard_rate,
          },
        },
      }));
    }
  }, [userData]);

  // Handle VAT Change
  const handleVatChange = (field: string, value: string) => {
    // Remove unwanted characters and convert to number
    const cleanValue = Number(value.replace(/[$\s/%]/g, ""));

    setFormData((prev) => ({
      ...prev,
      vat: {
        ...prev.vat,
        [vatType === "standard" ? "standard_rate" : "flat_rate"]: {
          ...(prev.vat[
            vatType === "standard" ? "standard_rate" : "flat_rate"
          ] || {}),
          [field]: isNaN(cleanValue)
            ? 0
            : Math.min(Math.max(cleanValue, 0), 100),
        },
      },
    }));
  };

  const handleSaveUser = () => {
    // Check password validation first
    if (formData.password && formData.password.length < 8) {
      messageApi.error("Password must be at least 8 characters long");
      return;
    }

    const updatedFields: Partial<UserData> = {};

    Object.keys(formData).forEach((key) => {
      const typedKey = key as keyof UserData;

      // Skip empty password fields
      if (typedKey === "password" && !formData.password) return;

      if (
        JSON.stringify(formData[typedKey]) !==
        JSON.stringify(userData[typedKey])
      ) {
        (updatedFields[typedKey] as unknown) = formData[typedKey];
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      messageApi.info("No changes detected.");
      return;
    }

    saveSettings(updatedFields)
      .unwrap()
      .then(() => {
        messageApi.success("Your User Details Saved.");
      })
      .catch(() => {
        messageApi.error("Failed to Save Details");
      });
  };

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Your password was updated successfully",
      icon: <FaCheckCircle color=" #009163" size={20} className=" mr-2" />,
      className: "custom-class",
      style: {
        marginTop: "10vh",
        fontSize: 16,
      },
    });
  };

  const handleCloseModal = () => {
    setChangeVisible(false);
    setChangePasswordErrors(undefined); // Clear errors when closing
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
        </span>
        <Input
          id="email"
          type="email"
          placeholder="Tunde@yahoo.com"
          className="px-3 py-2"
          disabled
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
            <IoMdInformationCircleOutline className="size-4" />
            To change your password,{" "}
            <button
              type="button"
              className="underline"
              onClick={() => setChangeVisible(true)}
            >
              click here
            </button>
          </p>
        </span>

        <CustomPasswordInput
          id="password"
          placeholder="******"
          className="px-3 py-2"
          disabled
          value={formData?.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        {formData.password && formData.password.length < 8 && (
          <span className="text-red-500 text-sm">
            Password must be at least 8 characters
          </span>
        )}
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
        <Switch
          checked={formData.vat.toggle}
          onChange={(checked: boolean) =>
            setFormData((prev) => ({
              ...prev,
              vat: {
                ...prev.vat,
                toggle: checked,
              },
            }))
          }
        />
      </div>

      {/* VAT Type Selection */}
      {formData.vat.toggle && (
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
                    value={`%${formData?.vat?.standard_rate?.rate ?? ""}`}
                    onChange={(e) => handleVatChange("rate", e.target.value)}
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
                    value={`%${
                      formData?.vat?.standard_rate?.reduced_rate ?? ""
                    }`}
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
                    value={`%${formData?.vat?.flat_rate?.rate ?? ""}`}
                    onChange={(e) => handleVatChange("rate", e.target.value)}
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

          <Input
            id="prep-fee"
            defaultValue="$0.00"
            className="px-3 py-2"
            value={`${formData?.prep_fee ?? ""}`}
            onChange={(e) => handleChange("prep_fee", e.target.value)}
          />
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

          <Input
            id="misc-fee"
            defaultValue="$0.00"
            className="px-3 py-2"
            value={`${formData?.misc_fee ?? ""}`}
            onChange={(e) => handleChange("misc_fee", e.target.value)}
          />
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
            onChange={(e) =>
              handleChange("misc_fee_percentage", e.target.value)
            }
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

        <div className=" flex justify-between items-center">
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

      <ChangePasswordModal
        isChangeVisible={ChangeVisible}
        setIsChangeVisible={handleCloseModal}
        loading={passwordLoading}
        errors={changePasswordErrors}
        proceed={(values) => {
          changePassword(values)
            .unwrap()
            .then(() => {
              success();
              setChangeVisible(false);
              // Redirect after 2 seconds to allow message display
              setTimeout(() => router.replace("/"), 2000);
            })
            .catch((err) => {
              messageApi.error(
                err.data?.message || "Failed to change password"
              );
              setChangePasswordErrors(err.data?.errors);
            });
        }}
      />

      <style jsx global>{`
        .custom-class > .ant-message-notice-content {
          background-color: #fffae6 !important;
        }
      `}</style>
    </div>
  );
};

export default UserDetails;
