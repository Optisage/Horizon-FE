"use client";

import React, { useState, useLayoutEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

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

// Sidebar data
const menuData = [
  { id: "1", path: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { id: "2", path: "#", label: "Keepa", icon: KeepaIcon },
  { id: "3", path: "#", label: "Credit", icon: CreditIcon },
  { id: "4", path: "", label: "Subscriptions", icon: SubscriptionsIcon },
];

const secondaryMenu = [
  { id: "5", path: "/settings", label: "Settings", icon: SettingsIcon },
];

const DashSider = () => {
  const pathName = usePathname();
  const [activePath, setActivePath] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
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
      </Link>
    ));

  return (
    <div className="drawer-side z-10 ">
      <label htmlFor="my-drawer-2" className="drawer-overlay" />
      <aside className="flex flex-col space-y-4 w-[270px] h-screen overflow-hidden shadow-xl bg-[#F7F7F7] border-r border-r-neutral-200 py-4 overflow-y-scroll">
        {/* Logo */}
        <div className="flex justify-center py-3 border-b">
          <Link href="/dashboard">
            <Image
              src={Logo}
              alt="Logo"
              className="w-2/3 mx-auto xl:w-auto"
              width={187}
              height={49}
              quality={90}
              priority
            />
          </Link>
        </div>

        {/* Primary menu */}
        <ul className="flex-grow space-y-1 px-4">{renderMenu(menuData)}</ul>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Secondary menu */}
        {/* <ul className="space-y-1 px-4">{renderMenu(secondaryMenu)}</ul> */}
        <ul className="space-y-1 px-4">
          {secondaryMenu.map((item) => (
            <Link
              href={item.path}
              key={item.path}
              className={`flex items-center px-4 py-3 rounded-sm text-sm cursor-pointer ${
                activePath === item.path
                  ? "bg-primary-50 text-primary-400 font-semibold"
                  : "text-neutral-700 hover:bg-gray-50"
              }`}
              // onClick={() => item.label === "Log out" && setOpenModal(true)}
            >
              <item.icon className="size-5 mr-3 text-inherit" />
              <span>{item.label}</span>
            </Link>
          ))}
        </ul>

        {/* Profile */}
        <div className="flex gap-3 items-center p-4 mt-auto">
          <div className=" size-10 overflow-hidden">
            <Image
              src="https://avatar.iran.liara.run/public/38"
              alt="Avatar"
              className="size-10"
              width={40}
              height={40}
              quality={90}
              priority
            />
          </div>

          <div className="text-sm">
            <p className="font-medium">Bawmal</p>
            <p className="text-[#787891] text-xs">b@bawmal.com</p>
          </div>

          <div className="flex-1 flex justify-end">
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

      <LogoutModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default DashSider;
