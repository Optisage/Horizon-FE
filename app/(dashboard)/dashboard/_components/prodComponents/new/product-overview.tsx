// "use client";

import Image from "next/image";
import {
  CopyIcon,
  DesktopIcon,
  GoogleIcon,
  JustifyIcon,
  RobotIcon,
  SubtitleIcon,
} from "./icons";
import AmazonIcon from "@/public/assets/svg/amazon.svg";
import Sneakers from "@/public/assets/svg/sneakers.svg";
import { CustomSelect as Select } from "@/lib/AntdComponents";

const ProductOverview = () => {
  return (
    <div className="rounded-xl bg-white">
      <div className="p-4 lg:p-5">
        <span className="bg-[#F3F4F6] px-3 py-1.5 rounded-3xl text-[#676A75] font-semibold text-sm flex items-center gap-2 w-max">
          Product Overview
          <span className="bg-[#FE4848] rounded-full size-[18px] flex items-center justify-center text-white text-xs font-semibold">
            1
          </span>
        </span>

        <div className="mt-4 grid grid-cols-2 xl:grid-cols-[2fr_3fr] gap-4">
          <div className="bg-[#F3F4F6] w-[143px] h-[136px] flex items-center justify-center rounded-xl">
            <Image
              src={Sneakers}
              alt="Sneakers"
              className="size-[105px]"
              width={105}
              height={105}
              quality={90}
              unoptimized
            />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-[#5B656C] font-semibold text-sm">
              Rosemary Mint Scalp & Hair Strengthening Oil Model(399-9243)
            </h3>
            <div className="flex items-center gap-1 text-[#858F96] text-xs font-medium">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="size-4 fill-[#FFB951]"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <polygon points="10,1.5 12.59,7.36 18.9,7.97 14,12.14 15.45,18.36 10,15.1 4.55,18.36 6,12.14 1.1,7.97 7.41,7.36" />
                </svg>
              ))}
              <span>5/5</span>
            </div>
            <Select
              options={[
                {
                  value: "variation_1",
                  label: "Color: blue",
                },
              ]}
              style={{ width: "100%", maxWidth: 300, borderRadius: 13 }}
              placeholder="Product variations"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-5 bg-[#F3F4F6E0] p-4 rounded-xl relative">
          <span className="bg-[#DDE0E5] h-[45px] w-[6.8px] rounded-3xl" />
          <span className="flex-1">
            <h5 className="text-[#595959] font-medium text-sm">
              Beauty & Personal Care
            </h5>
            <p className="text-xs text-[#9E9D9D]">ASIN: B09TQLC5TK</p>
          </span>

          <span className="absolute bottom-3 right-3">
            <button
              type="button"
              className="bg-white text-primary text-xs flex items-center gap-1 px-2 py-1 rounded-full"
            >
              <CopyIcon />
              copy
            </button>
          </span>
        </div>
      </div>

      <div className="border-t border-[#E7EBEE] p-4 lg:px-5 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          className="bg-[#18CB96] rounded-lg p-2"
          aria-label="Details"
        >
          <SubtitleIcon />
        </button>
        <button
          type="button"
          className="bg-[#F4F5F7] rounded-lg p-2"
          aria-label="Details"
        >
          <JustifyIcon />
        </button>

        <button
          type="button"
          className="bg-[#F4F5F7] rounded-lg p-2"
          aria-label="Details"
        >
          <Image
            src={AmazonIcon}
            alt="Amazon icon"
            className="size-5"
            unoptimized
          />
        </button>

        <button
          type="button"
          className="bg-[#F4F5F7] rounded-lg p-2"
          aria-label="Details"
        >
          <GoogleIcon />
        </button>

        <button
          type="button"
          className="bg-[#F4F5F7] rounded-lg p-2"
          aria-label="Details"
        >
          <DesktopIcon />
        </button>

        <button
          type="button"
          className="bg-[#F4F5F7] rounded-lg p-2"
          aria-label="Details"
        >
          <RobotIcon />
        </button>
      </div>
    </div>
  );
};

export default ProductOverview;

