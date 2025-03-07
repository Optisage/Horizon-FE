/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import SubscriptionHistoryTable from "./SubscriptionHistoryTable";
import { Heading } from "@/app/(dashboard)/_components";
import { useLazyGetSubscriptionsQuery } from "@/redux/api/user";
import { useAppSelector } from "@/redux/hooks";
import { useLazyGetPricingQuery } from "@/redux/api/auth";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
}

const Subscriptions = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const [pricingData, setPricingData] = useState<PricingPlan[]>([]);

  const monthlyPrice = 35;
  const annualPrice = monthlyPrice * 12;

  const [getSubscription, { data: subData, isLoading }] =
    useLazyGetSubscriptionsQuery();
  const { subscription_type } =
    useAppSelector((state) => state.api?.user) || {};

  const [getPricing, { data, isLoading: isLoadingPricing }] =
    useLazyGetPricingQuery();

  useEffect(() => {
    getSubscription({});
    getPricing({}).then((response) => {
      if (response.data) {
        setPricingData(response.data.data);
      }
    });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      <Heading
        title="Subscription Plan"
        subtitle={`You are currently on the ${subscription_type} Plan.`}
      />

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
                plan.name.toLowerCase() === "premium"
                  ? "bg-[url(/assets/images/pricing-bg.png)] bg-no-repeat bg-cover bg-top"
                  : "hover:bg-primary/5"
              }`}
            >
              <span className="flex flex-col gap-5">
                <h3 className="capitalize">{plan.name}</h3>
                <p>
                  <span className="text-xl sm:text-2xl font-semibold">$</span>
                  <span className="text-[#01011D] text-xl sm:text-2xl font-semibold">
                    {isMonthly ? plan.price : parseFloat(plan.price) * 12}
                  </span>{" "}
                  &nbsp;
                  <span>/</span> {isMonthly ? "per month" : "per year"}
                </p>
              </span>
              <p className="">
                {plan.name.toLowerCase() === "pro"
                  ? "Getting Started"
                  : "Getting Serious"}
              </p>
              <button
                type="button"
                className={`px-6 py-2.5 text-sm border rounded-xl font-medium duration-200 ${
                  plan.name.toLowerCase() === "premium"
                    ? "border-transparent text-white bg-primary hover:bg-primary-hover"
                    : "border-[#EDEDEE] hover:bg-gray-50"
                }`}
              >
                {plan.name.toLowerCase() === "pro"
                  ? "Switch to Premium"
                  : "Switch to Pro"}
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

        <SubscriptionHistoryTable tableData={subData} loading={isLoading} />
      </div>
    </section>
  );
};

export default Subscriptions;
