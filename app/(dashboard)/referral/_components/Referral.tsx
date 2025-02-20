import Image from "next/image";

import Illustration1 from "@/public/assets/svg/illustration-1.svg";
import Illustration2 from "@/public/assets/svg/illustration-2.svg";
import Illustration3 from "@/public/assets/svg/illustration-3.svg";

import { BsPieChart } from "react-icons/bs";
import { HiOutlineChartBar, HiOutlineUserAdd } from "react-icons/hi";
import { HiOutlinePlayCircle } from "react-icons/hi2";
import ReferralTable from "./ReferralTable";

const Referral = () => {
  return (
    <section className="flex flex-col gap-12 min-h-[50dvh] md:min-h-[80dvh]">
      <div className="flex flex-col gap-8">
        <div className="grid xl:grid-cols-[4fr_2fr] gap-4 items-center">
          <div className="bg-[#F7F7F7] p-6 rounded-2xl grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-5">
            <div className="flex flex-col gap-4 items-center text-center sm:text-start sm:items-start">
              <Image
                src={Illustration1}
                alt="illustration"
                className="w-[212px] h-[106px] object-cover"
                width={212}
                height={106}
              />

              <span className="flex flex-col gap-2">
                <h5 className="text-[#01011D] text-base">
                  Share Your Unique Link
                </h5>
                <p className="text-xs text-[#4B4B62]">
                  Get your personal referral link from your dashboard and share
                  it with friends, family, or fellow merchants.
                </p>
              </span>
            </div>

            <div className="flex flex-col gap-4 items-center text-center sm:text-start sm:items-start">
              <Image
                src={Illustration2}
                alt="illustration"
                className="w-[212px] h-[106px] object-cover"
                width={212}
                height={106}
              />

              <span className="flex flex-col gap-2">
                <h5 className="text-[#01011D] text-base">
                  Your Friend Signs Up
                </h5>
                <p className="text-xs text-[#4B4B62]">
                  Once your referral registers using your link and starts making
                  sales, they automatically qualify.
                </p>
              </span>
            </div>

            <div className="flex flex-col gap-4 items-center text-center sm:text-start sm:items-start">
              <Image
                src={Illustration3}
                alt="illustration"
                className="w-[212px] h-[106px] object-cover"
                width={212}
                height={106}
              />

              <span className="flex flex-col gap-2">
                <h5 className="text-[#01011D] text-base">Earn Rewards</h5>
                <p className="text-xs text-[#4B4B62]">
                  Get rewarded based on their activity! You’ll both receive
                  commissions, discounts, or other perks.
                </p>
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row xl:flex-col gap-4">
            <div className="border border-border rounded-lg p-5 flex gap-4 items-center">
              <span>
                <span className="size-[50px] flex items-center justify-center bg-[#F7F7F7] text-[#4B4B62] rounded-full">
                  <HiOutlineUserAdd className="size-6" />
                </span>
              </span>
              <span className="flex flex-col gap-2">
                <h4 className="text-[#01011D] text-base font-medium">
                  Invite and Earn
                </h4>
                <p className="text-[#4B4B62] text-xs">
                  Invite other sellers to Optisage & help them succeed and
                  unlock exclusive perks too!
                </p>
              </span>
            </div>
            <div className="border border-border rounded-lg p-5 flex gap-4 items-center">
              <span>
                <span className="size-[50px] flex items-center justify-center bg-[#F7F7F7] text-[#4B4B62] rounded-full">
                  <HiOutlinePlayCircle className="size-6" />
                </span>
              </span>
              <span className="flex flex-col gap-2">
                <h4 className="text-[#01011D] text-base font-medium">
                  Watch Optisage Tutorials
                </h4>
                <p className="text-[#4B4B62] text-xs">
                  Learn how Optisage help track sales, optimize profits, and win
                  the Buy Box.
                </p>
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-border p-1 pb-4 rounded-xl flex flex-col gap-4">
            <div className="border border-border p-4 rounded-lg flex gap-2 justify-between">
              <span className="flex flex-col gap-2">
                <h5 className="text-base font-medium text-[#4B4B62]">
                  Points Balance
                </h5>
                <p className="text-[#01011D] font-semibold text-xl md:text-2xl">
                  200pts
                </p>
              </span>

              <span className="rounded-lg border border-border size-10 flex items-center justify-center shadow-md shadow-[#EAEAEA]">
                <HiOutlineChartBar className="size-6 text-[#787891]" />
              </span>
            </div>

            <p className="px-2 pl-4 text-xs text-[#787891]">
              100 points = $5 (Redeemable as a discount on your subscription
              plan or future purchases. Points cannot be withdrawn as cash.)
            </p>
          </div>
          <div className="border border-border p-1 pb-4 rounded-xl flex flex-col gap-4">
            <div className="border border-border p-4 rounded-lg flex gap-2 justify-between">
              <span className="flex flex-col gap-2">
                <h5 className="text-base font-medium text-[#4B4B62]">
                  Earnings this Week
                </h5>
                <p className="text-[#01011D] font-semibold text-xl md:text-2xl">
                  0.00
                </p>
              </span>

              <span className="rounded-lg border border-border size-10 flex items-center justify-center shadow-md shadow-[#EAEAEA]">
                <BsPieChart className="size-6 text-[#787891]" />
              </span>
            </div>

            <p className="px-2 pl-4 text-xs text-[#787891]">
              Earn 100 points for every successful & active referral!
            </p>
          </div>
        </div>
      </div>

      <ReferralTable />
    </section>
  );
};

export default Referral;
