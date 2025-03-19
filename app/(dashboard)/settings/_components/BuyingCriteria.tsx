import { CustomInput as Input } from "@/lib/AntdComponents";
import { useUpdateSettingsMutation } from "@/redux/api/user";
import { Button, message } from "antd";
import { useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";


interface BuyingCriteriaProps {
  buyingCriteria: {
    maximum_bsr_percentage: number;
    minimum_roi_percentage: number;
    minimum_bsr_percentage: number;
    minimum_profit_percentage: number;
  };
  
}
// Default values for the form
const DEFAULT_BUYING_CRITERIA = {
  maximum_bsr_percentage: 0,
  minimum_roi_percentage: 0,
  minimum_bsr_percentage: 0,
  minimum_profit_percentage: 0,
};

const BuyingCriteria = ({ buyingCriteria }: BuyingCriteriaProps)  => {
  const [saveSettings,{isLoading}] = useUpdateSettingsMutation()
  const [formData, setFormData] = useState(buyingCriteria || DEFAULT_BUYING_CRITERIA);
  const [messageApi, contextHolder] = message.useMessage();


  const handleInputChange = (field: keyof typeof buyingCriteria, value: string) => {
    // Remove '$' and spaces, then convert to a number
    const cleanValue = Number(value.replace(/[$\s/%\s]/g, ''));
  
    // Ensure valid number, default to 0 if NaN
    setFormData(prev => ({
      ...prev,
      [field]: isNaN(cleanValue) ? 0 : cleanValue
    }));
  };

  const handleSaveSettings = () => {
    const updatedFields = Object.keys(formData).reduce((acc, key) => {
      const numValue = Number(formData[key as keyof typeof formData]);
  
      // Ensure values are numbers and only send changed fields
      if (!isNaN(numValue) && numValue !== Number(buyingCriteria[key as keyof typeof buyingCriteria])) {
        acc[key as keyof typeof formData] = numValue;
      }
      return acc;
    }, {} as Partial<typeof formData>);
  
    if (Object.keys(updatedFields).length === 0) {
      messageApi.info("No changes made.");
      return;
    }
  
    console.log("Payload being sent:", updatedFields); // Debugging
  
    saveSettings(updatedFields)
      .unwrap()
      .then(() => {
        messageApi.success("Buying Criteria Saved Successfully");
      })
      .catch(() => {
        messageApi.error("Failed to save setting");
      });
  };

  return (
    <div className="flex flex-col gap-6">
      {contextHolder}
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

        <Input id="mimimum-bsr"
         defaultValue="$0.00" className="px-3 py-2"
         value={`% ${formData?.minimum_bsr_percentage}`}
         onChange={(e) => handleInputChange('minimum_bsr_percentage', e.target.value)}
          />
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

        <Input id="maximum-bsr" 
        defaultValue="$0.00" className="px-3 py-2" 
        value={`% ${formData?.maximum_bsr_percentage}`}
        onChange={(e) => handleInputChange('maximum_bsr_percentage', e.target.value)}
        />
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

        <Input id="minimum-profit" 
        defaultValue="$0.00" className="px-3 py-2" 
        value={`$ ${formData?.minimum_profit_percentage}`}
        onChange={(e) => handleInputChange('minimum_profit_percentage', e.target.value)}
        />
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

        <Input id="minimum-roi" 
        defaultValue="$0.00" className="px-3 py-2" 
        value={`$ ${formData?.minimum_roi_percentage}`}
        onChange={(e) => handleInputChange('minimum_roi_percentage', e.target.value)}
        />
      </div>

      <div>
        <Button
          htmlType="submit"
          className="!px-6 !py-2 !bg-primary !border-none hover:!bg-primary-hover !rounded-xl !text-white !text-sm !font-medium"
          onClick={handleSaveSettings}
          loading={isLoading}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default BuyingCriteria;
