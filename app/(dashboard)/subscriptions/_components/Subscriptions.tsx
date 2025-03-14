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

interface PricingPlan {
  id: string;
  name: string;
  price: string;
}

const Subscriptions = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const [pricingData, setPricingData] = useState<PricingPlan[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCancelVisible, setIsCancelVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const monthlyPrice = 35;
  const annualPrice = monthlyPrice * 12;

  const [getSubscription, { data: subData, isLoading }] =
    useLazyGetSubscriptionsQuery();
  const { subscription_type } =
    useAppSelector((state) => state.api?.user) || {};
  const { currencyCode, currencySymbol } =
    useAppSelector((state) => state.global) || {};

  const [getPricing, { data, isLoading: isLoadingPricing }] =
    useLazyGetPricingQuery();
  const [changeSubscription, { isLoading: changeLoading }] =
    useChangeSubscriptionMutation();
  const [getProfile] = useLazyGetProfileQuery();
  const [messageApi, contextHolder] = message.useMessage();
  const [cancelSubscription, { isLoading: cancelLoading }] =
    useCancelSubscriptionMutation();

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

  const handleCancelSubscription = () => {
    cancelSubscription({})
    .unwrap()
    .then(() => {
      messageApi.success("Cancelled Subscription Successfully");
      setIsCancelVisible(false);
    })
    .catch(() => {
      messageApi.error("Failed to Cancel Subscription");
    });
  };

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
        <button
          className=" bg-red-500 hover:bg-red-500/90 text-white p-2 rounded-lg"
          onClick={() => setIsCancelVisible(true)}
        >
          Cancel Subscription
        </button>
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
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Dynamically render pricing plans */}
          {pricingData.map((plan) => (
            <div
              key={plan.id}
              className={`border border-[#EBEBEB] hover:border-primary duration-200 rounded-3xl p-6 flex flex-col gap-6 text-[#787891] ${
                plan.name === "STARTER (PRO)"
                  ? "bg-[url(/assets/images/pricing-bg.png)] bg-no-repeat bg-cover bg-top"
                  : "hover:bg-primary/5"
              }`}
            >
              <span className="flex flex-col gap-5">
                <h3 className="capitalize">{plan.name}</h3>
                <p>
                  <span className="text-xl sm:text-2xl font-semibold">
                    {currencySymbol}
                  </span>
                  <span className="text-[#01011D] text-xl sm:text-2xl font-semibold">
                    {isMonthly
                      ? convertPrice(plan.price)
                      : convertPrice(parseFloat(plan.price) * 12)}
                  </span>{" "}
                  &nbsp;
                  <span>/</span> {isMonthly ? "per month" : "per year"}
                </p>
              </span>
              <p className="">
                {plan.name === "STARTER (PRO)"
                  ? "Getting Started"
                  : "Getting Serious"}
              </p>
              <button
                type="button"
                disabled={plan.name !== "STARTER (PRO)"}
                className={`px-6 py-2.5 text-sm border rounded-xl font-medium duration-200 ${
                  plan.name === "STARTER (PRO)"
                    ? "border-transparent text-white bg-primary hover:bg-primary-hover"
                    : "border-[#EDEDEE] hover:bg-gray-50 disabled:bg-slate-300"
                }`}
                /** 
                onClick={() => {
                  setIsModalVisible(true);
                  setSelectedPlan(plan);
                }}
                  */
              >
                Switch to {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>

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

      {/** 
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
            onClick={()=>handleSubscriptionChange(selectedPlan ? selectedPlan.name : "")}
            >
              Switch Subscription Now
            </Button>
          </div>
        </div>
      </Modal>
      */}

      <Modal
        title="Cancel Subscription"
        open={isCancelVisible}
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
              Please be informed that you are about to cancel your active
              subscription. Your current plan will still be active until its
              expiry date after which there will be no further charge to your
              card.
            </h1>
          </div>
          <div className=" grid grid-cols-2 gap-10">
            <button
              className="px-4 py-2 bg-gray-300 rounded-lg font-bold !h-[40px]"
              onClick={() => setIsCancelVisible(false)}
            >
              Cancel
            </button>

            <Button
              loading={cancelLoading}
              disabled={cancelLoading}
              className="px-4 py-2 !bg-green-500 !text-white !rounded-lg !font-bold !h-[40px] border-none"
              onClick={() => handleCancelSubscription()}
            >
              Cancel Subscription Now
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default Subscriptions;
