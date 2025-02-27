"use client";

import { useLazyGetPricingQuery } from "@/redux/api/auth";
import { setSubScriptionId } from "@/redux/slice/globalSlice";
import { useRouter,useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";

const Pricing = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams(); // Add this hook
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [getPricing, { data, isLoading }] = useLazyGetPricingQuery();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getPricing({});

    // Get the ref parameter from URL
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Store the referral code in sessionStorage
      sessionStorage.setItem('referralCode', refCode);
      console.log('Referral code stored:', refCode);
    }
  }, [getPricing, searchParams]);

  interface PricingData {
    id: string;
    name: string;
    price: string;
  }

  interface SubInfoItem {
    key: string;
    title: string;
    price: string;
    subTitle: string;
    subItems: string[];
  }

  const sharedFeatures = [
    "Real time Alerts (Buy Box, Price Drops, Stock)",
    "Profitability Calculator",
    "Competitor Analysis (Storefront Stalking)",
    "Insights Dashboard (Sales Estimator)",
    "Individual Scanner",
    "Basic Reporting",
    "IP alert",
    "Reward Dashboard",
  ];

  const subInfo: SubInfoItem[] = data?.data
    ? (data.data as PricingData[])
        .map((item) => {
          return {
            key: item.id,
            title: item.name,
            price: item.name === "Pro" ? "35" : item.price,
            subTitle: "Retail Arbitrage + Mobile + Web + Chrome Ext.",
            subItems: sharedFeatures,
          };
        })
        .filter((item): item is SubInfoItem => item !== null)
    : [];

  const handleGetStarted = (planId: string) => {
    setSelectedPlan(planId);
    setShowModal(true);
  };

  const confirmSubscription = () => {
    if (selectedPlan) {
      dispatch(setSubScriptionId(parseInt(selectedPlan)));
      router.push("/checkout");
    }
  };

  return (
    <section className="py-12 px-4 bg-gray-100 h-dvh flex flex-col gap-12">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold">Our Pricing</h2>
        <p className="text-gray-600 mt-2">
          Choose the plan that fits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto font-medium">
        {subInfo.map((item, index) => (
          <div
            className={`${
              item.title === "Premium" ? "border-2 border-green-500" : ""
            } h-fit bg-white p-6 rounded-xl shadow-md flex flex-col gap-4 relative`}
            key={index}
          >
            {item.title === "Premium" && (
              <span className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 text-sm rounded-lg">
                Most Popular
              </span>
            )}
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-3xl font-bold">
              ${item.price}
              <span className="text-lg">/mo</span>
            </p>
            <p className="text-gray-600">{item.subTitle}</p>
            <ul className="mt-4 text-left space-y-2">
              {item.subItems.map((subItem, index) => (
                <li className="flex gap-2 items-center" key={index}>
                  <FaCheckCircle className="size-5 text-green-700" /> {subItem}
                </li>
              ))}
            </ul>
            <button
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg w-full"
              onClick={() => handleGetStarted(item.key)}
            >
              Start Free Trial
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-0">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-96 text-center">
            <h3 className="text-xl font-bold">7-Day Free Trial</h3>
            <p className="text-gray-600 mt-2">
              You won&apos;t be charged today. Your 7-day free trial begins
              after you enter your card details, and you can cancel anytime
              before the trial ends.
            </p>
            <div className="mt-4 flex flex-col-reverse sm:flex-row gap-3 justify-center">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
                onClick={confirmSubscription}
              >
                Continue to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Pricing;
