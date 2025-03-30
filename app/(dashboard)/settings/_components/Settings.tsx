"use client";

import { useEffect, useState } from "react";

import { Heading } from "@/app/(dashboard)/_components";
import UserDetails from "./UserDetails";
import BuyingCriteria from "./BuyingCriteria";
import { useLazyGetSettingsQuery } from "@/redux/api/user";
import { LuDot } from "react-icons/lu";
import { message } from "antd";
import CancelModal from "./cancelModal";
import CancelReason from "./cancelReasons";
import { useCancelSubscriptionMutation } from "@/redux/api/subscriptionApi";
import { useAppSelector } from "@/redux/hooks";
import { formatDate } from "@/utils/dateFormat";
import { useLazyGetProfileQuery } from "@/redux/api/auth";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<"userDetails" | "buyingCriteria">(
    "userDetails"
  );
  const [isCancelVisible, setIsCancelVisible] = useState(false);
  const [isReasonVisible, setIsReasonVisible] = useState(false);
 const {  subscription_type,
  subscription_canceled,
  subscription_will_end_at,
  billing_status,
  trial_ends_at,
  next_billing_date,} =
     useAppSelector((state) => state.api?.user) || {};
  const [messageApi, contextHolder] = message.useMessage();
  const [getProfile] =useLazyGetProfileQuery()

  const [getSettings, { isLoading, data: settingsData }] =
    useLazyGetSettingsQuery();
    const [cancelSubscription, { isLoading: cancelLoading }] =
    useCancelSubscriptionMutation();

  useEffect(() => {
    getSettings({});
  }, []);

  const handleCancelSubscription = (reason: string) => {
    cancelSubscription({ reason }) // Adjust based on your API expectations
      .unwrap()
      .then(() => {
        messageApi.success("Cancelled Subscription Successfully");
        getProfile({});
        setIsReasonVisible(false);
      })
      .catch(() => {
        messageApi.error("Failed to Cancel Subscription");
      });
  };


  // Determine expiration date and message
  let expirationDate;
  let statusMessage = "";
  let statusText = "";

  if (subscription_canceled) {
    statusText = "Canceled";
    statusMessage = "Your subscription will fully expire at";
    expirationDate = subscription_will_end_at;
  } else {
    switch (billing_status) {
      case "trialing":
        statusText = "";
        statusMessage = "Your trial ends at";
        expirationDate = trial_ends_at;
        break;
      case "active":
        statusText = "Active";
        statusMessage = "Your subscription will renew on";
        expirationDate = next_billing_date;
        break;
      default:
        statusText = "Inactive";
        statusMessage = "No active subscription";
    }
  }

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh] ">
      {contextHolder}
      <Heading title="Settings" subtitle="Manage your profile" />

      <div className="border border-border rounded-xl p-4 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <h3 className="text-lg font-medium">
            {activeTab === "userDetails" ? "User Details" : "Buying Criteria"}
          </h3>

          {/* Tabs */}
          <div className="bg-[#F7F7F7] rounded-[10px] p-1 flex items-center gap-2 w-max">
            <button
              type="button"
              onClick={() => setActiveTab("userDetails")}
              className={`text-sm font-medium p-1.5 rounded-md border ${
                activeTab === "userDetails"
                  ? "border-border bg-white"
                  : "border-transparent text-[#787891]"
              }`}
            >
              User Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("buyingCriteria")}
              className={`text-sm font-medium p-1.5 rounded-md border ${
                activeTab === "buyingCriteria"
                  ? "border-border bg-white"
                  : "border-transparent text-[#787891]"
              }`}
            >
              Buying Criteria
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className=" w-full flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : activeTab === "userDetails" ? (
          <UserDetails userData={settingsData?.data || {}} />
        ) : (
          <BuyingCriteria buyingCriteria={settingsData?.data || {}} />
        )}
      </div>
      <div className=" space-y-4">
        <h2 className="text-[#01011D] text-lg font-medium">
          Subscription Status
        </h2>
        <div className=" bg-[#FAFDFC] border border-[#DDE1DF] w-full rounded-xl p-4">
          <div className=" flex justify-between items-center mt-2">
            <div>
              <h5 className=" font-semibold text-[#090F0D] ">{subscription_type} User</h5>
              <h6 className=" flex items-center">
                <span className=" text-sm text-[#1E6B4F] font-semibold">
                {statusText}
                  
                </span>
                {expirationDate && (
                  <>
                    <LuDot size={20} color="#D9D9D9" />
                    <span className="text-sm text-[#5F6362]">
                      {`${statusMessage} ${formatDate(expirationDate)}`}
                    </span>
                  </>
                )}
              </h6>
            </div>
            <div>
              {
                subscription_canceled === false && (
                  <button className=" text-slate-500 rounded-xl text-sm py-1 px-3 hover:bg-red-500 hover:text-white" onClick={() => setIsCancelVisible(true)}>
                  Cancel Subscription
                </button>
                )
              }
            
            </div>
          </div>
        </div>
      </div>

      <CancelModal
      setIsCancelVisible={()=>setIsCancelVisible(false)}
      isCancelVisible={isCancelVisible}
      handleReason={()=>{
        setIsReasonVisible(true);
        setIsCancelVisible(false);
      }}
      />
      <CancelReason 
      setIsReasonVisible={()=>setIsReasonVisible(false)}
      isReasonVisible={isReasonVisible}
      loading={cancelLoading}
      handleCancelSubscription={handleCancelSubscription}
      />
    </section>
  );
};

export default Settings;
