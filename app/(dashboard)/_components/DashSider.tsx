"use client";

import React, { useState, useLayoutEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import Logo from "@/public/assets/svg/Optisage Logo.svg";
import {
  DashboardIcon,
  SettingsIcon,
  KeepaIcon,
  SubscriptionsIcon,
  CreditIcon,
} from "@/public/assets/svg/icons";
import LogoutModal from "./LogoutModal";
import { BiChevronRight } from "react-icons/bi";
import { RiVerifiedBadgeFill } from "react-icons/ri";

// Sidebar data
const menuData = [
  { id: "1", path: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { id: "2", path: "", label: "Keepa", icon: KeepaIcon, comingSoon: true },
];

const secondaryMenu = [
  { id: "3", path: "/settings", label: "Settings", icon: SettingsIcon },
  { id: "4", path: "", label: "Credit", icon: CreditIcon, comingSoon: true },
];

const billingMenu = [
  {
    id: "5",
    path: "/subscriptions",
    label: "Subscriptions",
    icon: SubscriptionsIcon,
  },
];

const DashSider = () => {
  const pathName = usePathname();
  const [activePath, setActivePath] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
    // Clear the token cookie
  Cookies.remove("token");
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
        <item.icon className="size-5 mr-3 text-inherit" />
        <span>{item.label}</span>
        {item.comingSoon && (
          <span className="ml-auto bg-primary text-white text-xs px-1.5 py-0.5 rounded-md">
            Coming Soon
          </span>
        )}
      </Link>
    ));

  return (
    <div className="drawer-side z-50">
      <label htmlFor="my-drawer-2" className="drawer-overlay" />
      <aside className="flex flex-col justify-between w-[270px] h-screen overflow-hidden shadow-xl bg-[#F7F7F7] border-r border-r-neutral-200 overflow-y-scroll">
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
              Invite & Earn: Share Optisage!
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Invite other sellers to Optisage & help them succeed and unlock
              exclusive perks too!
            </p>
            <button className="bg-primary hover:bg-primary-hover duration-200 text-white text-sm font-medium px-4 py-2 rounded-md w-full mt-3 active:scale-95">
              Refer a Seller
            </button>
          </div>

          {/* Profile Section */}
          <div className="flex gap-3 items-center p-4 mt-auto">
            <div className="size-10 overflow-hidden">
              <Image
                src="https://avatar.iran.liara.run/public/38"
                alt="Avatar"
                className="size-10 rounded-full"
                width={40}
                height={40}
                quality={90}
                priority
              />
            </div>

            <div className="text-sm flex-1">
              <p className="font-medium flex items-center gap-1">
                Bawmal <RiVerifiedBadgeFill className="text-primary size-4" />
              </p>
              <p className="text-[#787891] text-xs">b@bawmal.com</p>
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
