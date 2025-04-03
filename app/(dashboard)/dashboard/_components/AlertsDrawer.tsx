"use client";
import { useState } from "react";
import { Drawer } from "antd";
import { RxArrowTopRight } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import { useLazyGetIpAlertQuery } from "@/redux/api/productsApi";

interface AlertDrawerProps {
  itemAsin: string;
  marketplaceId: number;
  productName: string;
  eligibility: boolean;
  ipIssuesCount: number;
}

const AlertsDrawer = ({
  itemAsin,
  marketplaceId,
  productName,
  eligibility,
  ipIssuesCount,
}: AlertDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [additionalData, setAdditionalData] = useState({
    amazonShareBuyBox: 0,
    privateLabel: "No",
    size: "N/A",
    isMeltable: false,
    hasVariations: false,
    ipDescription: "No known IP issues",
  });

  const [getIpAlert] = useLazyGetIpAlertQuery();

  const showDrawer = async () => {
    setOpen(true);
    setIsLoading(true);
    try {
      await fetchAdditionalData();
    } finally {
      setIsLoading(false);
    }
  };

  const onClose = () => setOpen(false);

  const fetchAdditionalData = async () => {
    try {
      const response = await getIpAlert({ itemAsin, marketplaceId }).unwrap();
      setAdditionalData({
        amazonShareBuyBox: response?.data?.amazon_share_buybox ?? 0,
        privateLabel: response?.data?.private_label ?? "No",
        size: response?.data?.size ?? response?.data?.size_text ?? "N/A",
        isMeltable: response?.data?.is_meltable ?? false,
        hasVariations: response?.data?.has_variations ?? false,
        ipDescription: getFirstDescription(
          response?.data?.ip_analysis?.description
        ),
      });
    } catch (error) {
      console.error("Error fetching additional IP data:", error);
    }
  };

  const getFirstDescription = (description: string) => {
    if (!description) return "No known IP issues";
    if (typeof description === "object") {
      const descriptions = Object.values(description);
      return descriptions[0]?.toString() || "No known IP issues";
    }
    return description.toString();
  };

  return (
    <>
      <button
        type="button"
        onClick={showDrawer}
        className="border border-border bg-white px-3 py-2 rounded-xl flex gap-1 items-center font-semibold active:scale-95 duration-200 text-sm md:text-base"
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "See all alerts"}
        <RxArrowTopRight className="size-5" />
      </button>

      <Drawer
        onClose={onClose}
        open={open}
        closable={false}
        width={500}
        styles={{ body: { padding: 0 } }}
      >
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
              {productName || "Product Name Not Available"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              ASIN: <span className="font-medium">{itemAsin || "N/A"}</span>
            </p>

            {eligibility ? (
              <h4 className="text-lg font-semibold mt-4 text-green-500">
                You are authorised to sell this product
              </h4>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                <h4 className="text-lg font-semibold text-[#FF0000]">
                  You are not authorized to sell this product
                </h4>
                {ipIssuesCount > 0 && (
                  <p className="text-red-500 text-sm">
                    There {ipIssuesCount === 1 ? "is" : "are"} {ipIssuesCount}{" "}
                    IP issue{ipIssuesCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            )}

            <div className="mt-4 space-y-3">
              {[
                {
                  label: "Amazon Share Buy Box",
                  value: `${additionalData.amazonShareBuyBox}%`,
                },
                {
                  label: "Private Label",
                  value: additionalData.privateLabel,
                },
                {
                  label: "IP Analysis",
                  value: additionalData.ipDescription,
                },
                {
                  label: "Size",
                  value: additionalData.size,
                },
                {
                  label: "Meltable",
                  value: additionalData.isMeltable ? "Yes" : "No",
                },
                {
                  label: "Variations",
                  value: additionalData.hasVariations ? "Yes" : "No",
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

// "use client";
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useState } from "react";
// import { Drawer } from "antd";
// import { RxArrowTopRight } from "react-icons/rx";
// import { IoClose } from "react-icons/io5";
// import { useLazyGetIpAlertQuery } from "@/redux/api/productsApi";
// import { useDispatch } from "react-redux";
// import { setIpAlert, setIpIssues } from "@/redux/slice/globalSlice";

// interface prop {
//   itemAsin: string;
//   marketplaceId: number;
//   productName: string;
// }

// const AlertsDrawer = ({ itemAsin, marketplaceId, productName }: prop) => {
//   const dispatch = useDispatch();
//   const [open, setOpen] = useState(false);

//   const [ipAlertData, setIpAlertData] = useState<any>(null);

//   const showDrawer = () => setOpen(true);
//   const onClose = () => setOpen(false);

//   const [getIpAlert] = useLazyGetIpAlertQuery();

//   useEffect(() => {
//     const fetchData = async () => {
//       if (marketplaceId && itemAsin) {
//         try {
//           const response = await getIpAlert({ itemAsin, marketplaceId }).unwrap();
//           setIpAlertData(response.data ?? null);

//           dispatch(
//             setIpAlert({
//               setIpIssue: response?.data?.ip_analysis?.issues ?? [],
//               eligibility: response?.data?.eligible_to_sell ?? false,
//             })
//           );

//           dispatch(setIpIssues(response?.data?.ip_analysis?.issues ?? []));
//         } catch (error) {
//           console.error("Error fetching IP alert:", error);
//         }
//       }
//     };
//     fetchData();
//   }, [marketplaceId, itemAsin, getIpAlert, dispatch]);

//   const getFirstDescription = () => {
//     const description = ipAlertData?.ip_analysis?.description;
//     if (!description) return "No known IP issues";

//     if (typeof description === 'object') {
//       const descriptions = Object.values(description);
//       return descriptions[0] || "No known IP issues";
//     }

//     return description.toString();
//   };

//   return (
//     <>
//       <button
//         type="button"
//         onClick={showDrawer}
//         className="border border-border bg-white px-3 py-2 rounded-xl flex gap-1 items-center font-semibold active:scale-95 duration-200 text-sm md:text-base"
//       >
//         See all alerts
//         <RxArrowTopRight className="size-5" />
//       </button>

//       <Drawer
//         onClose={onClose}
//         open={open}
//         closable={false}
//         width={500}
//         styles={{ body: { padding: 0 } }}
//       >
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200 flex justify-between items-center">
//           <h2 className="text-lg font-semibold">Alerts</h2>
//           <button
//             type="button"
//             aria-label="Close"
//             onClick={onClose}
//             className="p-2 rounded-full hover:bg-gray-100 border border-border"
//           >
//             <IoClose className="size-5 text-gray-600" />
//           </button>
//         </div>

//         <div className="p-6">
//           <div className="border border-border rounded-xl shadow-sm p-4">
//             <h3 className="text-lg font-semibold text-gray-900">
//               {productName || 'Product Name Not Available'}
//             </h3>
//             <p className="text-sm text-gray-500 mt-1">
//               ASIN:
//               <span className="font-medium ml-1">{itemAsin ?? 'N/A'}</span>
//             </p>

//             {ipAlertData?.eligible_to_sell ? (
//               <h4 className="text-lg font-semibold mt-4 text-green-500">
//                 You are authorised to sell this product
//               </h4>
//             ) : (
//               <div className="mt-4 flex flex-col gap-4">
//                 <h4 className="text-lg font-semibold text-[#FF0000]">
//                   You are not authorized to sell this product
//                 </h4>
//               </div>
//             )}

//             {/* Alert Details */}
//             <div className="mt-4 space-y-3">
//               {[
//                 {
//                   label: "Amazon Share Buy Box",
//                   value: `${ipAlertData?.amazon_share_buybox ?? 0}%`,
//                 },
//                 {
//                   label: "Private Label",
//                   value: ipAlertData?.private_label ?? "No",
//                 },
//                 {
//                   label: "IP Analysis",
//                   value: getFirstDescription(),
//                 },
//                 {
//                   label: "Size",
//                   value: ipAlertData?.size ?? ipAlertData?.size_text ?? "N/A",
//                 },
//                 {
//                   label: "Meltable",
//                   value: ipAlertData?.is_meltable ? "Yes" : "No",
//                 },
//                 {
//                   label: "Variations",
//                   value: ipAlertData?.has_variations ? "Yes" : "No",
//                 },
//               ].map((item, index) => (
//                 <div
//                   key={index}
//                   className="text-sm font-medium flex flex-col gap-1"
//                 >
//                   <p className="text-[#525252]">{item.label}</p>
//                   <p className="text-[#0A0A0A] rounded-lg p-4 bg-[#FAFAFA]">
//                     {item.value}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </Drawer>
//     </>
//   );
// };

// export default AlertsDrawer;

