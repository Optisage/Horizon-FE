import { MdOutlineInsertChartOutlined } from "react-icons/md";
import { FaStar } from "react-icons/fa";
import { useState } from "react";
import OffersAndSellerFeedback from "./offers-and-seller-feedback";
import { CustomSelect as Select } from "@/lib/AntdComponents";
import MiniDatePicker from "@/app/(dashboard)/upc-scanner/_components/date-picker";
import ProductDatePicker from "./datePicker";
import { GoDotFill } from "react-icons/go";

type Seller = {
  name: string;
  reviews: number;
  price: number;
  won: string;
  lastWon: string;
};

const sellers: Seller[] = [
  {
    name: "T0SSI",
    reviews: 763,
    price: 30.08,
    won: "21%",
    lastWon: "3 weeks ago",
  },
  {
    name: "Peak Health",
    reviews: 347,
    price: 29.65,
    won: "18%",
    lastWon: "2 weeks ago",
  },
  {
    name: "CB Int",
    reviews: 213,
    price: 31.58,
    won: "23%",
    lastWon: "3 weeks ago",
  },
];

const TopSellers = () => {
  const [active, setActive] = useState("sellers");
  return (
    <div className="rounded-xl bg-white p-4 lg:p-5">
      <div className=" flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActive("sellers")}
          className={` ${
            active === "sellers"
              ? "bg-primary text-white"
              : "bg-[#F3F4F6] text-[#676A75]"
          }  px-3 py-1.5 rounded-3xl  font-semibold text-sm w-max flex items-center gap-1.5`}
        >
          <MdOutlineInsertChartOutlined className="size-5" />
          Top Sellers
        </button>

        <button
          type="button"
          className={` ${
            active === "feedback"
              ? "bg-primary text-white"
              : "bg-[#F3F4F6] text-[#676A75]"
          }  px-3 py-1.5 rounded-3xl  font-semibold text-sm w-max flex items-center gap-1.5`}
          onClick={() => setActive("feedback")}
        >
          <MdOutlineInsertChartOutlined className="size-5" />
          Seller Feedback
        </button>
      </div>

      <div className=" ">
        <div className=" flex items-center gap-3">
          <span className=" text-xs text-[#8C94A2] text-nowrap">Filter by</span>
            <Select
                        options={[
                          {
                            value: "variation_1",
                            label: "Current",
                          },
                        ]}
                        style={{ width: "100%", maxWidth: 300, borderRadius: 100, height: '35 !important' }}
                        
                        placeholder="Curernt"
                      />

                        <ProductDatePicker />
        </div>
         
      </div>
      </div>

      {active === "sellers" ? (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-700">
            <thead>
              <tr className="border-b bg-[#F7F7F7] font-medium">
                <th className="p-4  w-[70px]">#</th>
                <th className="p-4">Seller</th>
                <th className="p-4">Price</th>
                <th className="p-4">Won</th>
                <th className="p-4">Last Won</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller, index) => (
                <tr
                  key={seller.name}
                  className="border-b last:border-none text-[#252525] text-sm"
                >
                   <td className="p-4 flex gap-3 ">
                    {index + 1}
                    <GoDotFill color=" #0F172A"/>
                    </td>
                   
                  <td className="p-4 min-w-[160px] ">
                    <div>
                      {seller.name} ({seller.reviews})
                    </div>
                    <div className="flex text-yellow-400 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar key={i} className="size-3" />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">${seller.price.toFixed(2)}</td>
                  <td className="p-4">{seller.won}</td>
                  <td className="p-4 whitespace-nowrap">{seller.lastWon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <OffersAndSellerFeedback />
      )}

      <div className=" mt-5 px-5">
        <div className=" flex items-start gap-5">
        <button className=" h-[28px] w-[61px] bg-[#4D4D4D] text-white text-xs font-medium rounded-xl">FBA : 3</button>
        <button className=" h-[28px] w-[61px] bg-[#18CB96] text-white text-xs font-medium rounded-xl">FBM : 1</button>
      </div>
      </div>
    </div>
  );
};

export default TopSellers;
