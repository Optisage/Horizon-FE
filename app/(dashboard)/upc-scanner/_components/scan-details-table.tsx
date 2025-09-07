"use client";

import { GoSearch } from "react-icons/go";

type ProductData = {
  upc: string;
  productCost: string;
  sellingPrice: string;
  buyBoxPrice: string;
  fbaFee?: string;
  referralFee?: string;
  storageFee?: string;
  netProfit?: string;
  netMargin?: string;
  roi?: string;
  potentialWinner?: string;
  rank?: string;
  amazonInstockRate?: string;
  numberOfFbaSellers?: string;
  estimatedMonthlyUnitsSold?: string;
  buyBoxEquity?: string;
  outOfStock?: string;
  dominantSeller?: string;
  asin?: string;
  title?: string;
};

const sampleData: ProductData[] = [
  {
    upc: "00716622272..",
    productCost: "-",
    sellingPrice: "$2.70",
    buyBoxPrice: "-",
    fbaFee: "-",
    referralFee: "-",
    storageFee: "-",
    netProfit: "-",
    netMargin: "-",
    roi: "-",
    potentialWinner: "-",
    rank: "-",
    amazonInstockRate: "-",
    numberOfFbaSellers: "-",
    estimatedMonthlyUnitsSold: "-",
    buyBoxEquity: "-",
    outOfStock: "-",
    dominantSeller: "-",
    asin: "-",
    title: "-",
  },
];

export const ScanDetailsTable = () => {
  return (
    <div className="w-full overflow-x-auto rounded-b-xl border border-gray-200">
      {/* Mobile View */}
      <div className="sm:hidden">
        <table className="table-fixed w-full min-w-[1600px] text-sm bg-white">
          <thead className="bg-[#F3F4F6] text-[#596375]">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium">
                <GoSearch className="size-4 text-gray-500" />
              </th>
              <th className="px-4 py-3 text-left font-medium">UPC / EAN</th>
              <th className="px-4 py-3 text-left font-medium">Product Cost</th>
              <th className="px-4 py-3 text-left font-medium">Selling Price</th>
              <th className="px-4 py-3 text-left font-medium">Buy Box Price</th>
              <th className="px-4 py-3 text-left font-medium">FBA Fee</th>
              <th className="px-4 py-3 text-left font-medium">Referral Fee</th>
              <th className="px-4 py-3 text-left font-medium">Storage Fee</th>
              <th className="px-4 py-3 text-left font-medium">Net Profit</th>
              <th className="px-4 py-3 text-left font-medium">Net Margin</th>
              <th className="px-4 py-3 text-left font-medium">ROI</th>
              <th className="px-4 py-3 text-left font-medium">
                Potential Winner
              </th>
              <th className="px-4 py-3 text-left font-medium">Rank</th>
              <th className="px-4 py-3 text-left font-medium">
                Amazon Instock Rate
              </th>
              <th className="px-4 py-3 text-left font-medium"># FBA Sellers</th>
              <th className="px-4 py-3 text-left font-medium">
                Est. Monthly Sold
              </th>
              <th className="px-4 py-3 text-left font-medium">
                Buy Box Equity
              </th>
              <th className="px-4 py-3 text-left font-medium">Out of Stock</th>
              <th className="px-4 py-3 text-left font-medium">
                Dominant Seller
              </th>
              <th className="px-4 py-3 text-left font-medium">ASIN</th>
              <th className="px-4 py-3 text-left font-medium">Title</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {sampleData.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="px-4 py-3">
                  <GoSearch className="size-4 text-gray-500" />
                </td>
                <td className="px-4 py-3">{item.upc}</td>
                <td className="px-4 py-3">{item.productCost}</td>
                <td className="px-4 py-3">{item.sellingPrice}</td>
                <td className="px-4 py-3">{item.buyBoxPrice}</td>
                <td className="px-4 py-3">{item.fbaFee}</td>
                <td className="px-4 py-3">{item.referralFee}</td>
                <td className="px-4 py-3">{item.storageFee}</td>
                <td className="px-4 py-3">{item.netProfit}</td>
                <td className="px-4 py-3">{item.netMargin}</td>
                <td className="px-4 py-3">{item.roi}</td>
                <td className="px-4 py-3">{item.potentialWinner}</td>
                <td className="px-4 py-3">{item.rank}</td>
                <td className="px-4 py-3">{item.amazonInstockRate}</td>
                <td className="px-4 py-3">{item.numberOfFbaSellers}</td>
                <td className="px-4 py-3">{item.estimatedMonthlyUnitsSold}</td>
                <td className="px-4 py-3">{item.buyBoxEquity}</td>
                <td className="px-4 py-3">{item.outOfStock}</td>
                <td className="px-4 py-3">{item.dominantSeller}</td>
                <td className="px-4 py-3">{item.asin}</td>
                <td className="px-4 py-3">{item.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Desktop View */}
      <div className="relative hidden sm:block w-full overflow-x-auto">
        <div className="flex w-max">
          {/* Left Table */}
          <div className="sticky left-0 z-10 w-[640px] border-r border-gray-300 bg-white">
            <table className="table-fixed w-full text-sm border-separate border-spacing-0">
              <thead className="bg-[#F3F4F6] text-[#596375]">
                <tr className="border-b border-gray-200 h-12">
                  <th className="w-10 px-4 py-3 text-left font-medium">
                    <GoSearch className="size-4 text-gray-500" />
                  </th>
                  <th className="w-40 px-4 py-3 text-left font-medium border-r-2 whitespace-nowrap">
                    UPC / EAN
                  </th>
                  <th className="w-32 px-4 py-3 text-left font-medium border-r-2 whitespace-nowrap">
                    Product Cost
                  </th>
                  <th className="w-32 px-4 py-3 text-left font-medium border-r-2 whitespace-nowrap">
                    Selling Price
                  </th>
                  <th className="w-32 px-4 py-3 text-left font-medium whitespace-nowrap">
                    Buy Box Price
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {sampleData.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200 h-12">
                    <td className="px-4 py-3">
                      <GoSearch className="size-4 text-gray-500" />
                    </td>
                    <td className="px-4 py-3">{item.upc}</td>
                    <td className="px-4 py-3">{item.productCost}</td>
                    <td className="px-4 py-3">{item.sellingPrice}</td>
                    <td className="px-4 py-3">{item.buyBoxPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Scrollable Right Table */}
          <div className="flex-1">
            <table className="table-fixed w-[2560px] text-sm bg-white border-separate border-spacing-0">
              <thead className="bg-[#F3F4F6] text-[#596375]">
                <tr className="border-b border-gray-200 divide-x-2 h-12">
                  {[
                    "FBA Fee",
                    "Referral Fee",
                    "Storage Fee",
                    "Net Profit",
                    "Net Margin",
                    "ROI",
                    "Potential Winner",
                    "Rank",
                    "Amazon Instock Rate",
                    "# FBA Sellers",
                    "Est. Monthly Sold",
                    "Buy Box Equity",
                    "Out of Stock",
                    "Dominant Seller",
                    "ASIN",
                    "Title",
                  ].map((header) => (
                    <th
                      key={header}
                      className="w-44 px-4 py-3 text-left font-medium whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {sampleData.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200 h-12">
                    <td className="px-4 py-3">{item.fbaFee}</td>
                    <td className="px-4 py-3">{item.referralFee}</td>
                    <td className="px-4 py-3">{item.storageFee}</td>
                    <td className="px-4 py-3">{item.netProfit}</td>
                    <td className="px-4 py-3">{item.netMargin}</td>
                    <td className="px-4 py-3">{item.roi}</td>
                    <td className="px-4 py-3">{item.potentialWinner}</td>
                    <td className="px-4 py-3">{item.rank}</td>
                    <td className="px-4 py-3">{item.amazonInstockRate}</td>
                    <td className="px-4 py-3">{item.numberOfFbaSellers}</td>
                    <td className="px-4 py-3">
                      {item.estimatedMonthlyUnitsSold}
                    </td>
                    <td className="px-4 py-3">{item.buyBoxEquity}</td>
                    <td className="px-4 py-3">{item.outOfStock}</td>
                    <td className="px-4 py-3">{item.dominantSeller}</td>
                    <td className="px-4 py-3">{item.asin}</td>
                    <td className="px-4 py-3">{item.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

