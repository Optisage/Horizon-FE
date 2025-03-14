"use client";

import { useLazyGetPricingQuery } from "@/redux/api/auth";
import {
  useRenewSubscriptionMutation,
} from "@/redux/api/subscriptionApi";
//import { setSubScriptionId } from "@/redux/slice/globalSlice";
import { Button, message } from "antd";
import Link from "next/link";
//import Link from "next/link";

import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
//import { useDispatch } from "react-redux";
import { FaDollarSign } from "react-icons/fa6";
const RenewSubscription = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [getPricing, { data, isLoading }] = useLazyGetPricingQuery();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [renewed, setRenewed] = useState(false);
  const [renew, { isLoading: subscribeLoading }] =
    useRenewSubscriptionMutation();
    const [messageApi, contextHolder] = message.useMessage();

  // Get the ref parameter from URL
  useEffect(() => {
    getPricing({});
  }, [getPricing]); // Only runs once when the component mounts

  interface SubInfoItem {
    key: string;
    title: string;
    price: string;
    subTitle: string;
    subItems: string[];
  }

  const subInfo: SubInfoItem[] = data?.data
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.data.map((item: any) => {
        // Extract features from API response or fallback to empty array
        const features = item.meta_data?.features || [];
        // Use first feature as subtitle, remaining as list items
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
    renew({
      pricing_id: selectedPlan,
    })
      .unwrap()
      .then((res) => {
        setRenewed(true);
        messageApi.success("renewal successful");
        console.log(res);
      })
      .catch((err) => {
        messageApi.error(err?.data?.message || "renewal failed")
        console.log(err);
      });
  };

  return (
    <section className="py-12 px-4 bg-white h-dvh flex flex-col gap-12">
      {contextHolder}
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold">Renew your Subscription</h2>
        <p className="text-gray-600 mt-2">Choose the plan you want to renew.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto font-medium">
        {subInfo.map((item, index) => (
          <div
            className={`${
              item.title === "premium" ? "border-2 border-green-500" : ""
            }  bg-white p-6 rounded-xl shadow-md flex flex-col gap-4 relative morope-font border`}
            key={index}
          >
            {item.title !== "STARTER (PRO)" && (
              <span className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 text-sm rounded-lg">
                Coming Soon
              </span>
            )}
            <h3 className=" text-xl font-semibold capitalize">{item.title}</h3>
            <div className="flex items-baseline">
              <div className="">
                <FaDollarSign size={25} className=" -mb-2" />
              </div>
              <p className="text-4xl font-semibold">{item.price}</p>
              <div className=" -mb-5">
                <span className="text-lg font-semibold">/mo</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{item.subTitle}</p>
            <ul className="mt-4 text-left space-y-2 border-t pt-4">
              {item.subItems.map((subItem, index) => (
                <li className="flex gap-2 items-center " key={index}>
                  <div>
                    <FaCheckCircle className="size-5 text-green-700 !h-[20px] !w-[20px]" />
                  </div>{" "}
                  {subItem}
                </li>
              ))}
            </ul>

            <button
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg w-full disabled:bg-slate-300"
              onClick={() => handleGetStarted(item.key)}
              disabled={item.title !== "STARTER (PRO)"}
            >
              {item.title !== "STARTER (PRO)"
                ? "Unavailable"
                : "Renew  Subscription"}
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-0">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-96 text-center">
            <h3 className="text-xl font-bold">Subscription Renewal</h3>
            {renewed ? (
              <p className="text-green-600 font-semibold mt-2">
                Subscription Renewal Successful
              </p>
            ) : (
              <p className="text-gray-600 mt-2">
                This action will charge your card. Please confirm you want to
                renew your subscription
              </p>
            )}

            <div className="mt-4 flex flex-col-reverse sm:flex-row gap-3 justify-center">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              {renewed ? (
                <Link href={"/"} className="!px-4 !py-2 !bg-green-500 border-none !h-[40px] !text-white !rounded-lg">
                  Go to Login
                </Link>
              ) : (
                <Button
                  className="!px-4 !py-2 !bg-green-500 border-none !h-[40px] !text-white !rounded-lg"
                  onClick={confirmSubscription}
                  loading={subscribeLoading}
                  disabled={subscribeLoading}
                >
                  Confirm
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RenewSubscription;
