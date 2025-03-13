"use client";

import { useLazyGetPricingQuery } from "@/redux/api/auth";
import { useCreateStripeSubscriptionMutation } from "@/redux/api/subscriptionApi";
//import { setSubScriptionId } from "@/redux/slice/globalSlice";
import { Button } from "antd";
//import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
//import { useDispatch } from "react-redux";

const Pricing = () => {
  //const dispatch = useDispatch();
  //const router = useRouter();
  const searchParams = useSearchParams(); // Add this hook
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [getPricing, { data, isLoading }] = useLazyGetPricingQuery();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [refCode, setRefCode] = useState<string | null>(null);
  const [subscribe, {isLoading:subscribeLoading}] = useCreateStripeSubscriptionMutation();

  // Get the ref parameter from URL
  useEffect(() => {
    getPricing({});
  }, [getPricing]); // Only runs once when the component mounts

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setRefCode(ref);
    }
  }, [searchParams]);

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


  const subInfo: SubInfoItem[] = data?.data
  ? data.data.map((item: any) => {
      // Extract features from API response or fallback to empty array
      const features = item.meta_data?.features || [];
      // Use first feature as subtitle, remaining as list items
      const subTitle = features[0] || '';
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
    /** 
     * 
    if (selectedPlan) {
      dispatch(setSubScriptionId(parseInt(selectedPlan)));
      //router.push("/checkout");
    }
      */

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
            window.top.location.href = res?.data?.url; // Navigate the parent window
          } else {
            window.open(res?.data?.url, "_blank"); // Fallback to current window
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto font-medium">
        {subInfo.map((item, index) => (
          <div
            className={`${
              item.title === "premium" ? "border-2 border-green-500" : ""
            }  bg-white p-6 rounded-xl shadow-md flex flex-col gap-4 relative`}
            key={index}
          >
            {item.title === "premium" && (
              <span className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 text-sm rounded-lg">
                Most Popular
              </span>
            )}
            <h3 className="text-xl font-semibold capitalize">{item.title}</h3>
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
