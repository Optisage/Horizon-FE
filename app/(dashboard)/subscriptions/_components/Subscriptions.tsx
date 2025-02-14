"use client";

import { useState } from "react";
import SubscriptionHistoryTable from "./SubscriptionHistoryTable";
import { Heading } from "@/app/(dashboard)/_components";

const Subscriptions = () => {
  const [isMonthly, setIsMonthly] = useState(true);
  const monthlyPrice = 35;
  const annualPrice = monthlyPrice * 12;

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      <Heading
        title="Subscription Plan"
        subtitle="You are currently on the Free Plan."
      />

      {/* plans */}
      <div className="flex flex-col gap-12">
        {/* Toggle Buttons */}
        <div className="rounded-xl p-1 border border-[#EBEBEB] flex gap-1 w-max mx-auto">
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
        </div>

        {/* grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div className="border border-[#EBEBEB] hover:border-primary duration-200 rounded-3xl p-6 flex flex-col gap-6 text-[#787891] hover:bg-primary/5">
            <span className="flex flex-col gap-5">
              <h3>Free</h3>
              <p>
                <span className="text-xl sm:text-2xl font-semibold">$</span>
                <span className="text-[#01011D] text-xl sm:text-2xl font-semibold">
                  0
                </span>{" "}
                &nbsp;
                <span>/</span> for 7 days
              </p>
            </span>
            <p className="">Getting Started</p>
            <button
              type="button"
              className="px-6 py-2.5 text-sm border border-[#EDEDEE] rounded-xl font-medium hover:bg-gray-50 duration-200"
            >
              Switch to Basic
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-[url(/assets/images/pricing-bg.png)] bg-no-repeat bg-cover bg-top border border-[#EBEBEB] hover:border-primary duration-200 rounded-3xl p-6 flex flex-col gap-6 text-[#787891]">
            <span className="flex flex-col gap-5">
              <h3>Premium</h3>
              <p>
                <span className="text-xl sm:text-2xl font-semibold">$</span>
                <span className="text-[#01011D] text-xl sm:text-2xl font-semibold">
                  {isMonthly ? monthlyPrice : annualPrice}
                </span>{" "}
                &nbsp;
                <span>/</span> {isMonthly ? "per month" : "per year"}
              </p>
            </span>
            <p className="">Getting Serious</p>
            <button
              type="button"
              className="px-6 py-2.5 text-sm border border-transparent rounded-xl font-medium text-white bg-primary hover:bg-primary-hover duration-200"
            >
              Switch to Premium
            </button>
          </div>
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

        <SubscriptionHistoryTable />
      </div>
    </section>
  );
};

export default Subscriptions;
