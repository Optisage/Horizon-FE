/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import SubscriptionHistoryTable from "./SubscriptionHistoryTable";
import { Heading } from "@/app/(dashboard)/_components";
import { useLazyGetSubscriptionsQuery } from "@/redux/api/user";
import { useAppSelector } from "@/redux/hooks";
import {
  useLazyGetPricingQuery,
  useLazyGetProfileQuery,
} from "@/redux/api/auth";
import { Button, message, Modal } from "antd";
import { GoAlert } from "react-icons/go";
import {
  useCancelSubscriptionMutation,
  useChangeSubscriptionMutation,
} from "@/redux/api/subscriptionApi";
import useCurrencyConverter from "@/utils/currencyConverter";
import { MdInfoOutline } from "react-icons/md";
import { LuDot } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";
import { formatDate } from "@/utils/dateFormat";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  stripe_price_id: string;
  meta_data?: {
    features?: string[];
  };
}

const Subscriptions = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const [pricingData, setPricingData] = useState<PricingPlan[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const monthlyPrice = 35;
  const annualPrice = monthlyPrice * 12;

  const [getSubscription, { data: subData, isLoading }] =
    useLazyGetSubscriptionsQuery();
  const { subscription_type, subscription_canceled, subscription_will_end_at, is_subscribed } =
    useAppSelector((state) => state.api?.user) || {};
  const { currencyCode, currencySymbol } =
    useAppSelector((state) => state.global) || {};

  const [getPricing, { data, isLoading: isLoadingPricing }] =
    useLazyGetPricingQuery();
  const [changeSubscription, { isLoading: changeLoading }] =
    useChangeSubscriptionMutation();
  const [getProfile] = useLazyGetProfileQuery();
  const [messageApi, contextHolder] = message.useMessage();

  const { convertPrice } = useCurrencyConverter(currencyCode);

  useEffect(() => {
    getSubscription({});
    getPricing({}).then((response) => {
      if (response.data) {
        setPricingData(response.data.data);
      }
    });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const handleSubscriptionChange = (planId: string) => {
    changeSubscription({ pricing_id: planId })
      .unwrap()
      .then(() => {
        messageApi.success("Changed Subscription Successfully");
        getProfile({});
        getSubscription({});
        setIsModalVisible(false);
      })
      .catch(() => {
        messageApi.error("Failed to change Subscription");
      });
  };

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      {contextHolder}
      <div className=" flex items-center justify-between">
        <Heading
          title="Subscription Plan"
          subtitle={`You are currently on the ${subscription_type} Plan.`}
        />
      </div>

      {/* plans */}
      <div className="flex flex-col gap-12">
        {/* Toggle Buttons */}
        {/* <div className="rounded-xl p-1 border border-[#EBEBEB] flex gap-1 w-max mx-auto">
          <button
            type="button"
            className={`${
              isMonthly
                ? "bg-primary text-white"
                : "hover:bg-gray-50 text-[#01011D]"
            } duration-200 font-medium rounded-xl px-4 py-2`}
            onClick={() => setIsMonthly(true)}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`${
              !isMonthly
                ? "bg-primary text-white"
                : "hover:bg-gray-50 text-[#01011D]"
            } duration-200 font-medium rounded-xl px-4 py-2`}
            onClick={() => setIsMonthly(false)}
          >
            Annually
          </button>
        </div> */}

        {/* grid */}
        <div className="grid sm:grid-cols-3 gap-6">
          {/* Dynamically render pricing plans */}
          {pricingData.map((plan, index) => {
            const features = plan.meta_data?.features || [];
            const firstFeature = features[0] || "";
            const remainingFeatures = features.slice(1, 4);
            return (
            <div
              key={plan.id}
              className={`border border-[#EBEBEB] hover:border-primary duration-200 rounded-3xl p-6 flex flex-col gap-6 ${
                index === 0
                  ? "bg-[url(/path/to/image1.svg)] text-[#787891]"
                  : index === 1
                  ? "bg-[url(/assets/images/pricing-bg.png)] text-[#787891]"
                  : "bg-[url(/assets/svg/pricing.svg)] text-white"
              } bg-no-repeat bg-cover bg-top hover:bg-primary/5`}
            >
              <span className="flex flex-col gap-5">
                <h3 className="capitalize">{plan.name}</h3>
                <p>
                  <span className="text-xl sm:text-2xl font-semibold">
                    {currencySymbol}
                  </span>
                  <span
                    className={`text-[#01011D] text-xl sm:text-2xl font-semibold ${
                      index === 2 ? "text-white" : ""
                    }`}
                  >
                    {isMonthly
                      ? convertPrice(plan.price)
                      : convertPrice(parseFloat(plan.price) * 12)}
                  </span>{" "}
                  &nbsp;
                  <span>/</span> {isMonthly ? "mo" : "yr"}
                </p>
              </span>
              <p className=" truncate">
               {firstFeature}
              </p>

              <ul className=" mt-1 text-left space-y-2 h-fit pt-2">
                  {remainingFeatures.slice(0, 3).map((feature, idx) => (
                    <li className="flex gap-2 items-center" key={idx}>
                      <FaCheckCircle className={`text-green-700 !h-[20px] !w-[20px] ${index === 2? "text-white":""}`} />
                      <span className="truncate w-full">{feature}</span>
                    </li>
                  ))}
                </ul>
                
              <button
                type="button"
                disabled={
                  plan.name !== "STARTER (PRO)" ||
                  plan.name === subscription_type
                }
                className={`px-6 py-2.5 text-sm  rounded-xl font-medium duration-200 ${
                  plan.name === subscription_type
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : plan.name === "STARTER (PRO)"
                    ? "border-transparent text-white bg-primary hover:bg-primary-hover"
                    : " hover:bg-gray-50 text-white cursor-not-allowed bg-primary hover:bg-primary-hover"
                }`}
                onClick={() => {
                  setIsModalVisible(true);
                  setSelectedPlan(plan);
                }}
              >
                {plan.name === subscription_type
                  ? "Active Plan"
                  : `Upgrade to ${plan.name}`}
              </button>
            </div>
            )
})}
        </div>
      </div>

      {/**SUBSCRIPTION STATUS */}
      {
        subscription_canceled && (
          <div className=" space-y-4">
          <h2 className="text-[#01011D] text-lg font-medium">
            Subscription Status
          </h2>
          <div className=" bg-[#FAFDFC] border border-[#DDE1DF] w-full rounded-xl p-4">
            <div className=" flex items-center gap-1 border-[#E6F5F0] border bg-white rounded-xl py-1 px-2">
              <MdInfoOutline />
              <span className=" text-sm font-medium">
                Your subscription will not renew when expired
              </span>
            </div>
            <div className=" flex justify-between items-center mt-2">
              <div>
                <h5 className=" font-semibold text-[#090F0D] ">{subscription_type} User</h5>
                <h6 className=" flex items-center">
                  <span className=" text-sm text-[#1E6B4F] font-semibold">
                    {
                      is_subscribed ? "Active" :"Inactive"
                    }
                    
                  </span>
                  <LuDot size={20} color="#D9D9D9" />
                  <span className=" text-sm text-[#5F6362]">
                    Expires on {formatDate(subscription_will_end_at)}
                  </span>
                </h6>
              </div>
              <div>
                <button className=" bg-primary text-white rounded-xl text-sm py-1 px-3 hover:bg-primary-hover">
                  Renew Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
        )
      }
      {/* table */}
      <div className="flex flex-col gap-8">
        <span className="flex flex-col gap-2">
          <h2 className="text-[#01011D] text-lg font-medium">
            Subscription History
          </h2>
          <p className="text-[#787891] text-sm">
            Track and manage your subscription history effortlessly.
          </p>
        </span>

        <SubscriptionHistoryTable
          tableData={subData}
          loading={isLoading}
          convertPrice={convertPrice}
        />
      </div>

      <Modal
        title="Change Subscription"
        open={isModalVisible}
        footer={null}
        maskClosable={false}
        closable={false}
        centered={true}
      >
        <div className=" space-y-5">
          <div className=" flex justify-center">
            <GoAlert size={60} color="orange" />
          </div>

          <div className=" text-center">
            <h1 className=" font-semibold">
              Please be informed that you are about to switch your subscription
              to{" "}
              <span className=" font-bold">
                {selectedPlan ? selectedPlan.name : ""} Plan
              </span>
            </h1>
          </div>
          <div className=" grid grid-cols-2 gap-10">
            <button
              className="px-4 py-2 bg-gray-300 rounded-lg font-bold !h-[40px]"
              onClick={() => setIsModalVisible(false)}
            >
              Cancel
            </button>

            <Button
              loading={changeLoading}
              disabled={changeLoading}
              className="px-4 py-2 !bg-green-500 !text-white !rounded-lg !font-bold !h-[40px] border-none"
              onClick={() =>
                handleSubscriptionChange(selectedPlan ? selectedPlan.id : "")
              }
            >
              Switch Subscription Now
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default Subscriptions;
