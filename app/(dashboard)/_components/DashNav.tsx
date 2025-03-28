"use client";

import Image from "next/image";

import Logo from "@/public/assets/svg/Optisage Logo.svg";
import { CgMenuRightAlt } from "react-icons/cg";
import CountrySelect from "./CountrySelect";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";

const DashNav = () => {
  const router = useRouter();
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const { subscription_type, created_at, billing_status } =
    useAppSelector((state) => state.api?.user) || {};

  useEffect(() => {
    if (created_at) {
      const verifiedDate = new Date(created_at);
      const trialEndDate = new Date(verifiedDate);
      trialEndDate.setDate(trialEndDate.getDate() + 7); // Add 7 days

      const today = new Date();
      const timeDiff = trialEndDate.getTime() - today.getTime();
      const daysLeft = Math.max(Math.ceil(timeDiff / (1000 * 60 * 60 * 24)), 0);

      setRemainingDays(daysLeft);
    }
  }, [created_at]);

  return (
    <nav className="flex items-center justify-between px-5 py-3 md:py-4 lg:px-6 sticky top-0 bg-white lg:shadow-sm lg:border-transparent border-b border-gray-200 z-40">
      <Image
        src={Logo}
        alt="Logo"
        className="lg:hidden w-1/3 sm:w-[187px] sm:h-[49px]"
        width={187}
        height={49}
        quality={90}
        priority
      />

      <div className="hidden lg:flex items-center gap-3">
        {billing_status !== "active" && (
          <p className="text-sm font-medium text-[#090F0D]">
            {remainingDays !== null && remainingDays > 0
              ? `${remainingDays} days left on your free trial`
              : "Your free trial has expired."}
          </p>
        )}

        <button
          onClick={() => router.push("/subscriptions")}
          type="button"
          className={`text-sm rounded-xl bg-[#33B28A] hover:bg-[#33B28A]/90 text-white py-2 px-4 active:scale-95 duration-200 font-medium ${
            subscription_type === "free" ? "block" : "hidden"
          }`}
        >
          Subscribe Now
        </button>
      </div>

      <div className="flex gap-3 md:gap-6 items-center">
        <div className="hidden lg:flex gap-6 items-center">
          <Link
            href=""
            className="hidden xl:block text-sm font-medium text-[#090F0D]"
          >
            For better experience, please install optisage Chrome Extension.
          </Link>
          <CountrySelect />
        </div>

        <label
          htmlFor="my-drawer-2"
          className="block lg:hidden text-primary-400 ml-4"
        >
          <CgMenuRightAlt size="25" />
        </label>
      </div>
    </nav>
  );
};

export default DashNav;
