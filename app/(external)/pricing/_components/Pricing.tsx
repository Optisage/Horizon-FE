/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useLazyGetPricingQuery } from "@/redux/api/auth";
import { useCreateStripeSubscriptionMutation } from "@/redux/api/subscriptionApi";
import { Button } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { FaDollarSign } from "react-icons/fa6";

// Component to handle the dropdown-like list of features with smooth transition
const FeatureList = ({
  items,
  initialCount = 3,
}: {
  items: string[];
  initialCount?: number;
}) => {
  const [expanded, setExpanded] = useState(false);

  // Always visible items
  const initialItems = items.slice(0, initialCount);
  // Extra items to show/hide with animation
  const extraItems = items.slice(initialCount);

  return (
    <>
      <ul className="mt-1 text-left space-y-2 border-t pt-4">
        {initialItems.map((subItem, index) => (
          <li className="flex gap-2 items-center" key={index}>
            <FaCheckCircle className="text-green-700 !h-[20px] !w-[20px]" />
            {subItem}
          </li>
        ))}
        {/* Extra items container with smooth height & opacity transition */}
        {extraItems.length > 0 && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out space-y-2 ${
              expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {extraItems.map((subItem, index) => (
              <li className="flex gap-2 items-center" key={index}>
                <div>
                <FaCheckCircle className="text-green-700 !h-[20px] !w-[20px]" />
                </div>
                {subItem}
              </li>
            ))}
          </div>
        )}
      </ul>
      {extraItems.length > 0 && (
        <button
          className="text-primary text-sm mt-1 w-fit"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "See less" : "See details"}
        </button>
      )}
    </>
  );
};

const Pricing = () => {
  const searchParams = useSearchParams();
  const [getPricing, { data }] = useLazyGetPricingQuery();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [subscribe, { isLoading: subscribeLoading }] =
    useCreateStripeSubscriptionMutation();

  useEffect(() => {
    getPricing({});
  }, [getPricing]);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setRefCode(ref);
    }
  }, [searchParams]);

  interface SubInfoItem {
    key: string;
    title: string;
    price: string;
    subTitle: string;
    subItems: string[];
  }

  const subInfo: SubInfoItem[] = data?.data
    ? data.data.map((item: any) => {
        const features = item.meta_data?.features || [];
        const subTitle = features[0] || "";
        const subItems = features.slice(1);
        return {
          key: item.id.toString(),
          title: item.name,
          price: item.price,
          subTitle: subTitle,
          subItems: subItems,
        };
      })
    : [];

  const handleGetStarted = (planId: string) => {
    setSelectedPlan(planId);
    setShowModal(true);
  };

  const confirmSubscription = () => {
    if (!selectedPlan) {
      console.error("No plan selected");
      return;
    }
    subscribe({
      pricing_id: selectedPlan,
      referral_code: refCode || "",
    })
      .unwrap()
      .then((res) => {
        if (res?.data?.url) {
          if (window.top) {
            window.top.location.href = res?.data?.url;
          } else {
            window.open(res?.data?.url, "_blank");
          }
        } else {
          console.error("No checkout URL returned");
        }
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <section className="py-12 px-4 bg-white h-dvh flex flex-col gap-12">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold">Our Pricing</h2>
        <p className="text-gray-600 mt-2">
          Choose the plan that fits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-6 max-w-6xl mx-auto font-medium">
        {subInfo.map((item, index) => (
          <div
            key={index}
            className={`
              ${item.title === "premium" ? "border-2 border-green-500" : ""}
              bg-white p-6 rounded-xl shadow-md flex flex-col gap-4 relative morope-font border
              transition-transform duration-300 ease-in-out h-fit
            `}
          >
            {item.title !== "STARTER (PRO)" && (
              <span className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 text-sm rounded-lg">
                Coming Soon
              </span>
            )}
            <h3 className="text-xl font-semibold capitalize">{item.title}</h3>
            <div className="flex items-baseline relative">
              <div className=" -mb-5">
              <FaDollarSign size={25}  />
              </div>
              <p className="text-4xl font-semibold">{item.price}</p>
              <div className="-mb-5">
                <span className="text-lg font-semibold">/mo</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{item.subTitle}</p>
            {/* Use the dropdown feature list with smooth animation */}
            <FeatureList items={item.subItems} initialCount={0} />

            <button
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg w-full transition duration-300 hover:bg-green-600 disabled:bg-slate-300"
              onClick={() => handleGetStarted(item.key)}
              disabled={item.title !== "STARTER (PRO)"}
            >
              {item.title !== "STARTER (PRO)"
                ? "Unavailable"
                : "Start Free Trial"}
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-0">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-96 text-center">
            <h3 className="text-xl font-bold">7-Day Free Trial</h3>
            <p className="text-gray-600 mt-2">
              You won&apos;t be charged today. Your 7-day free trial begins after you
              enter your card details, and you can cancel anytime before the trial
              ends.
            </p>
            <div className="mt-4 flex flex-col-reverse sm:flex-row gap-3 justify-center">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <Button
                className="!px-4 !py-2 !bg-green-500 border-none !h-[40px] !text-white !rounded-lg"
                onClick={confirmSubscription}
                loading={subscribeLoading}
                disabled={subscribeLoading}
              >
                Continue to Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Pricing;
