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
import { Tooltip as AntTooltip } from "antd";
import AmazonIcon from "@/public/assets/svg/amazon-icon.svg";
import toatanAiIcon from "@/public/assets/svg/ai.svg";
import Tool1 from "@/public/assets/svg/tool-1.svg";
import Tool2 from "@/public/assets/svg/tool-2.svg";
import Tool3 from "@/public/assets/svg/tool-3.svg";
import Tool4 from "@/public/assets/svg/tool-4.svg";
import ExportToSheetsButton from "@/utils/exportGoogle";

interface NavProps {
  product?: any;
  buyboxWinnerPrice?: number;
  lowestFBAPrice?: number;
  lowestFBMPrice?: number;
  monthlySales?: number;
  sellerCount?: number;
  fbaSellers?: number;
  fbmSellers?: number;
  stockLevels?: number;
}

type NavItem = {
  href?: string;
  icon: ReactNode;
  external?: boolean;
  onClick?: () => void;
  tooltip?: string;
};

const Nav: FC<NavProps> = ({
  product,
  buyboxWinnerPrice = 0,
  lowestFBAPrice = 0,
  lowestFBMPrice = 0,
  monthlySales = 0,
  sellerCount = 0,
  fbaSellers = 0,
  fbmSellers = 0,
  stockLevels = 0
}) => {
  const handleFindSupplier = () => {
    if (product?.product_name) {
      const query = encodeURIComponent(`${product.product_name} supplier`);
      window.open(`https://www.google.com/search?q=${query}`, "_blank");
    }
  };

  const handleViewOnAmazon = () => {
    if (product?.amazon_link) {
      window.open(product.amazon_link, "_blank");
    }
  };

  const navItems: NavItem[] = [
    { 
      icon: <FaGoogle className="size-6 text-[#0F172A]" />,
      onClick: handleFindSupplier,
      tooltip: "Search Google for suppliers of this product to explore sourcing options"
    },
    { 
      icon: <TbCalculatorFilled className="size-6 text-[#0F172A]" />,
      tooltip: "Export this product's information to a Google Sheet for further analysis or record keeping"
    },
    { 
      icon: <HiMiniBell className="size-6 text-[#0F172A]" />,
      tooltip: "Notifications"
    },
    {
      icon: (
        <Image
          src={AmazonIcon}
          alt="Amazon icon"
          width={32}
          height={32}
          className="size-6"
        />
      ),
      external: true,
      onClick: handleViewOnAmazon,
      tooltip: "Visit the product's Amazon page to see listings, reviews, and more details"
    },
  ];

  const NavIcon: FC<NavItem & { isCalculator?: boolean }> = ({ 
    href, 
    icon, 
    external = false, 
    onClick,
    tooltip,
    isCalculator = false
  }) => {
    const content = (
      <div
        onClick={onClick}
        className="size-12 flex items-center justify-center rounded-lg bg-[#F3F4F6] cursor-pointer hover:bg-gray-200 transition-colors"
      >
        {isCalculator && product ? (
          <ExportToSheetsButton
            productData={{
              asin: product?.asin,
              title: product?.product_name,
              brand: product?.vendor,
              category: product?.category,
              upcEan: product?.upc || product?.ean,
              buyBoxPrice: buyboxWinnerPrice,
              lowestFBAPrice: lowestFBAPrice,
              lowestFBMPrice: lowestFBMPrice,
              monthlySales: monthlySales,
              sellerCount: sellerCount,
              fbaSellers: fbaSellers,
              fbmSellers: fbmSellers,
              stockLevels: stockLevels,
            }}
            currencySymbol="$"
          />
        ) : (
          icon
        )}
      </div>
    );

    if (tooltip) {
      return (
        <AntTooltip title={tooltip} placement="top">
          {content}
        </AntTooltip>
      );
    }

    return content;
  };

  return (
    <div className="rounded-xl bg-white p-4 lg:p-5 flex flex-col lg:flex-row justify-between gap-4 md:gap-8">
      <div>
        <p className="mb-2 text-[#676A75] text-xs font-medium">Navigation</p>
        <div className="flex items-center gap-2 flex-wrap">
          {navItems.map((item, idx) => (
            <NavIcon 
              key={idx} 
              {...item} 
              isCalculator={idx === 1} // TbCalculatorFilled is at index 1
            />
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