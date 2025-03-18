"use client";

import { useEffect, useState } from "react";
import { Drawer } from "antd";
import { RxArrowTopRight } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import { useLazyGetIpAlertQuery } from "@/redux/api/productsApi";
import { useDispatch } from "react-redux";
import { setIpAlert, setIpIssues } from "@/redux/slice/globalSlice";

interface prop {
  itemAsin: string;
  marketplaceId: number;
  productName: string
}

const AlertsDrawer = ({ itemAsin, marketplaceId,productName  }: prop) => {
   const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ipAlertData, setIpAlertData] = useState<any>(null);
  
  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  const [getIpAlert] = useLazyGetIpAlertQuery();

  useEffect(() => {
    const fetchData = async () => {
      if (marketplaceId && itemAsin) {
        try {
          const response = await getIpAlert({ itemAsin, marketplaceId }).unwrap();
          setIpAlertData(response.data);
          dispatch(setIpAlert({
            setIpIssue: response?.data?.ip_analysis?.issues,
            eligibility: response?.data?.eligible_to_sell
          }));
          
          dispatch(setIpIssues(response?.data?.ip_analysis?.issues)); 
        } catch (error) {
          console.error("Error fetching IP alert:", error);
        }
      }
    };
    fetchData();
  }, [marketplaceId, itemAsin, getIpAlert]);

  const getFirstDescription = () => {
    if (!ipAlertData?.ip_analysis?.description) return "No known IP issues";
    const descriptions = Object.values(ipAlertData.ip_analysis.description);
    return descriptions.length > 0 ? descriptions[0] : "No known IP issues";
  };

  return (
    <>
      <button
        type="button"
        onClick={showDrawer}
        className="border border-border bg-white px-3 py-2 rounded-xl flex gap-1 items-center font-semibold active:scale-95 duration-200 text-sm md:text-base"
      >
        See all alerts
        <RxArrowTopRight className="size-5" />
      </button>

      <Drawer
        onClose={onClose}
        open={open}
        closable={false}
        width={500}
        styles={{ body: { padding: 0 } }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Alerts</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 border border-border"
          >
            <IoClose className="size-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="border border-border rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900">
             {productName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              ASIN:
              <span className="font-medium ml-1">{itemAsin}</span>
            </p>

            {ipAlertData?.eligible_to_sell ? (
              <h4 className="text-2xl font-semibold mt-4">
                This Product is Eligible to Sell
              </h4>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                <h4 className="text-2xl font-semibold text-[#FF0000]">
                  This Product is not eligible to sell
                </h4>
                <span className=" hidden">
                  <button
                    type="button"
                    className="px-6 py-2 bg-primary hover:bg-primary-hover rounded-xl text-white text-sm font-medium"
                  >
                    Get Approval on Amazon
                  </button>
                </span>
              </div>
            )}

            {/* Alert Details */}
            <div className="mt-4 space-y-3">
              {[
                {
                  label: "Amazon Share Buy Box",
                  value: `${ipAlertData?.amazon_share_buybox ?? 0}%`,
                },
                {
                  label: "Private Label",
                  value: ipAlertData?.private_label ?? "No",
                },
                {
                  label: "IP Analysis",
                  value: getFirstDescription(),
                },
                {
                  label: "Size",
                  value: ipAlertData?.size || ipAlertData?.size_text || "N/A",
                },
                {
                  label: "Meltable",
                  value: ipAlertData?.is_meltable ? "Yes" : "No",
                },
                {
                  label: "Variations",
                  value: ipAlertData?.has_variations ? "Yes" : "No",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="text-sm font-medium flex flex-col gap-1"
                >
                  <p className="text-[#525252]">{item.label}</p>
                  <p className="text-[#0A0A0A] rounded-lg p-4 bg-[#FAFAFA]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default AlertsDrawer;