"use client";

import React, { useState, useLayoutEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Logo from "@/public/assets/svg/Optisage Logo.svg";
import {
  DashboardIcon,
  SettingsIcon,
  KeepaIcon,
  SubscriptionsIcon,
  CreditIcon,
  HistoryIcon,
  GoCompareIcon,
  UPCScannerIcon,
} from "@/public/assets/svg/icons";
import LogoutModal from "./LogoutModal";
import { BiChevronRight } from "react-icons/bi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { useAppSelector } from "@/redux/hooks";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slice/authSlice";
import { BsStars } from "react-icons/bs";

// Sidebar data
interface MenuItem {
  id: string;
  path: string;
  label: string;
  icon: React.ComponentType<{className?: string}>;
  comingSoon?: boolean;
}

const menuData: MenuItem[] = [
  { id: "1", path: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { id: "2", path: "/history", label: "History", icon: HistoryIcon },
  { id: "3", path: "/go-compare", label: "Go Compare", icon: GoCompareIcon },
  { id: "5", path: "", label: "Keepa", icon: KeepaIcon, comingSoon: true },
  {
    id: "6",
    path: "/totan",
    label: "Totan (AI)",
    icon: BsStars,
    comingSoon: false,
    beta: true,
  },
  { id: "7", path: "/upc-scanner", label: "UPC Scanner", icon: UPCScannerIcon },
];

const secondaryMenu = [
  { id: "8", path: "/settings", label: "Settings", icon: SettingsIcon },
  { id: "9", path: "", label: "Credit", icon: CreditIcon, comingSoon: true },
];

const billingMenu = [
  {
    id: "10",
    path: "/subscriptions",
    label: "Subscriptions",
    icon: SubscriptionsIcon,
  },
];

const DashSider = () => {
  const pathName = usePathname();
  const dispatch = useDispatch();
  const [activePath, setActivePath] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();
  const { first_name, email } =
    useAppSelector((state) => state.api?.user) || {};
  const handleLogout = () => {
    // Clear the token cookie
    Cookies.remove("optisage-token");
    router.push("/");
    dispatch(logout());
  };

  useLayoutEffect(() => {
    setActivePath(pathName);
  }, [pathName]);

  const renderMenu = (menu: typeof menuData) =>
    menu.map((item) => (
      <Link
        href={item.path}
        key={item.id}
        className={`flex items-center px-4 py-3 rounded-md text-sm cursor-pointer ${
          activePath === item.path
            ? "bg-[#EDEDEE] text-[#01011D] font-semibold"
            : "text-[#787891] hover:bg-white"
        }`}
      >
        <item.icon
          className={`size-5 mr-3 text-inherit ${
            item.id === "4" ? "rotate-90" : ""
          }`}
        />

        <span>{item.label}</span>
        {item.comingSoon && (
          <span className="ml-auto bg-primary text-white text-xs px-1.5 py-0.5 rounded-md">
            Coming Soon
          </span>
        )}
        {item.beta && (
          <span className="ml-5 bg-primary text-white text-xs px-1.5 py-0.5 rounded-md">
            Beta
          </span>
        )}
      </Link>
    ));

  return (
    <div className="drawer-side z-50">
      <label htmlFor="my-drawer-2" className="drawer-overlay" />
      <aside className="flex flex-col justify-between w-[270px] h-dvh overflow-hidden shadow-xl bg-[#F7F7F7] border-r border-r-neutral-200 overflow-y-scroll">
        <div className="">
          {/* Logo */}
          <div className="flex justify-center p-6 border-b">
            <Link href="/dashboard">
              <Image
                src={Logo}
                alt="Logo"
                className="w-2/3 sm:w-[187px] sm:h-[49px] mx-auto"
                width={187}
                height={49}
                quality={90}
                priority
              />
            </Link>
          </div>

          {/* Dashboard Section */}
          <div className="px-4 pb-3 pt-5 text-xs text-[#4B4B62] uppercase">
            Dashboard
          </div>
          <ul className="space-y-1 px-4">{renderMenu(menuData)}</ul>

          <div className="border-t border-[#EBEBEB] my-3" />

          {/* Preferences Section */}
          <div className="px-4 pb-3 text-xs text-[#4B4B62] uppercase">
            Preferences
          </div>
          <ul className="space-y-1 px-4">{renderMenu(secondaryMenu)}</ul>

          <div className="border-t border-[#EBEBEB] my-3" />

          {/* Billing Section */}
          <div className="px-4 pb-3 text-xs text-[#4B4B62] uppercase">
            Billing
          </div>
          <ul className="space-y-1 px-4">{renderMenu(billingMenu)}</ul>
        </div>

        <div>
          {/* Invite & Earn */}
          <div className="p-4 border-t border-gray-200 mt-6">
            <p className="text-sm font-medium">
              Invite & Earn: Share optisage!
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Invite other sellers to optisage & help them succeed and unlock
              exclusive perks too!
            </p>
            <button
              onClick={() => router.push("/referral")}
              className="bg-primary hover:bg-primary-hover duration-200 text-white text-sm font-medium px-4 py-2 rounded-md w-full mt-3 active:scale-95"
            >
              Refer and Earn
            </button>
          </div>

          {/* Profile Section */}
          <div className="flex gap-3 items-center p-4 mt-auto">
            <div className="flex gap-3 items-center flex-1">
              <div className="size-10 rounded-full overflow-hidden">
                <Image
                  src="https://avatar.iran.liara.run/public/38"
                  alt="Avatar"
                  className="size-10 object-cover rounded-full"
                  width={40}
                  height={40}
                  quality={90}
                  priority
                  unoptimized
                />
              </div>

              <div className="text-sm">
                <p className="font-medium flex items-center gap-1">
                  {first_name}{" "}
                  <RiVerifiedBadgeFill className="text-primary size-4" />
                </p>
                <p className="text-[#787891] text-xs">{email}</p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Logout"
              onClick={() => setOpenModal(true)}
              className="p-2 rounded-full hover:bg-white text-[#787891]"
            >
              <BiChevronRight className="size-6" />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Modal */}
      <LogoutModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default DashSider;

