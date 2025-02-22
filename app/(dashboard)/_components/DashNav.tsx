"use client";

import Image from "next/image";

import Logo from "@/public/assets/svg/Optisage Logo.svg";
import { CgMenuRightAlt } from "react-icons/cg";
import CountrySelect from "./CountrySelect";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DashNav = () => {
  const router = useRouter();

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
        <p className="text-sm font-medium text-[#090F0D]">
          6 days left on your free trial
        </p>
        <button
          onClick={() => router.push("/subscriptions")}
          type="button"
          className="text-sm rounded-xl bg-[#33B28A] hover:bg-[#33B28A]/90 text-white py-2 px-4 active:scale-95 duration-200 font-medium"
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
            For better experience, install OptiSage Chrome Extension.
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
