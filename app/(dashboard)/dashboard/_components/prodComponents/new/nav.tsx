"use client";

import Image from "next/image";
import Link from "next/link";
import { FC, ReactNode } from "react";
import { FaGoogle, FaHashtag } from "react-icons/fa6";
import { PiLightningFill } from "react-icons/pi";
import { HiMiniBell, HiMiniEye, HiMiniShoppingCart } from "react-icons/hi2";
import { TbCalculatorFilled } from "react-icons/tb";
import { IoPricetag } from "react-icons/io5";
import { AiOutlinePercentage } from "react-icons/ai";
import AmazonIcon from "@/public/assets/svg/amazon-icon.svg";
import toatanAiIcon from "@/public/assets/svg/ai.svg";
import Tool1 from "@/public/assets/svg/tool-1.svg";
import Tool2 from "@/public/assets/svg/tool-2.svg";
import Tool3 from "@/public/assets/svg/tool-3.svg";
import Tool4 from "@/public/assets/svg/tool-4.svg";

type NavItem = {
  href: string;
  icon: ReactNode;
  external?: boolean;
};

const navItems: NavItem[] = [
   { href: "", icon: <FaGoogle className="size-6 text-[#0F172A]" /> },
    { href: "", icon: <TbCalculatorFilled className="size-6 text-[#0F172A]" /> },
     { href: "", icon: <HiMiniBell className="size-6 text-[#0F172A]" /> },
  //{ href: "", icon: <PiLightningFill className="size-6 text-[#0F172A]" /> },
  //{ href: "", icon: <FaHashtag className="size-6 text-[#0F172A]" /> },
 /** 
  {
    href: "",
    icon: (
      <svg
        width="31"
        height="29"
        viewBox="0 0 31 29"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-6 text-[#0F172A]"
      >
        <path
          d="M7.55078 17.9999L14.3008 11.2499L18.6072 15.5564C19.8109 13.188 21.805 11.2022 24.421 10.0375L27.1617 8.81726M27.1617 8.81726L21.2204 6.53662M27.1617 8.81726L24.881 14.7585"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.00195 2V26C2.00195 26.5523 2.44967 27 3.00195 27H29.002"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
 */
 
  //{ href: "", icon: <IoPricetag className="size-6 text-[#0F172A]" /> },
  //{ href: "", icon: <AiOutlinePercentage className="size-6 text-[#0F172A]" /> },
  //{ href: "", icon: <HiMiniShoppingCart className="size-6 text-[#0F172A]" /> },
  //{ href: "", icon: <HiMiniEye className="size-6 text-[#0F172A]" /> },
  {
    href: "",
    external: true,
    icon: (
      <Image
        src={AmazonIcon}
        alt="Amazon icon"
        width={32}
        height={32}
        className="size-6"
      />
    ),
  },
 
];

const NavIcon: FC<NavItem> = ({ href, icon, external = false }) => (
  <Link
    href={href}
    target={external ? "_blank" : undefined}
    rel={external ? "noopener noreferrer" : undefined}
    className="size-12 flex items-center justify-center rounded-lg bg-[#F3F4F6]"
  >
    {icon}
  </Link>
);

const Nav: FC = () => {
  return (
    <div className="rounded-xl bg-white p-4 lg:p-5 flex flex-col lg:flex-row justify-between gap-4 md:gap-8">
      <div>
        <p className="mb-2 text-[#676A75] text-xs font-medium">Navigation</p>
        <div className="flex items-center gap-2 flex-wrap">
          {navItems.map((item, idx) => (
            <NavIcon key={idx} {...item} />
          ))}
            <Image
        src={toatanAiIcon}
        alt="Totan AI icon"
        width={32}
        height={32}
        className="size-12"
      />
        </div>
      </div>

      <div className="bg-[#FAFBFC] flex flex-col md:flex-row md:items-center justify-between gap-4 w-full max-w-[327px] p-4 pr-9 bg-[url(/assets/svg/worktools-bg.svg)] bg-cover bg-no-repeat bg-center rounded-lg shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-[#676A75] font-semibold text-xs">
            Your WorkTools:
          </p>
          <div className="flex gap-1">
            <Image
              src={Tool1}
              alt="Tool"
              className="size-8"
              width={24}
              height={23}
              quality={90}
              unoptimized
            />
            <Image
              src={Tool2}
              alt="Tool"
              className="size-8"
              width={24}
              height={24}
              quality={90}
              unoptimized
            />
            <Image
              src={Tool3}
              alt="Tool"
              className="size-8"
              width={31}
              height={28}
              quality={90}
              unoptimized
            />
            <Image
              src={Tool4}
              alt="Tool"
              className="size-8"
              width={22}
              height={21}
              quality={90}
              unoptimized
            />
          </div>
        </div>

        <span className="flex gap-3 items-center">
          <Link href="" className="text-[10px] text-[#5B656C] hover:underline">
            How to use <br />
            Watch Tutorial
          </Link>
          <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="8.5" cy="8.5" r="8.5" fill="#F5473F" />
            <path
              d="M11.25 8.06699C11.5833 8.25944 11.5833 8.74056 11.25 8.93301L7.5 11.0981C7.16667 11.2905 6.75 11.05 6.75 10.6651L6.75 6.33494C6.75 5.95004 7.16667 5.70947 7.5 5.90192L11.25 8.06699Z"
              fill="white"
            />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default Nav;

