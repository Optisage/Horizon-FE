"use client";

import { useEffect, useState } from "react";

import { Heading } from "@/app/(dashboard)/_components";
import UserDetails from "./UserDetails";
import BuyingCriteria from "./BuyingCriteria";
import { useLazyGetSettingsQuery } from "@/redux/api/user";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<"userDetails" | "buyingCriteria">(
    "userDetails"
  );

  const [getSettings, { isLoading, data: settingsData }] =
    useLazyGetSettingsQuery();

  useEffect(() => {
    getSettings({});
  }, [getSettings]);
  console.log(settingsData);



  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
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
          <UserDetails userData={settingsData?.data} />
        ) : (
          <BuyingCriteria buyingCriteria={settingsData?.data} />
        )}
      </div>
    </section>
  );
};

export default Settings;
