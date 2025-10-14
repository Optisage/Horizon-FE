"use client";

import { GoSearch } from "react-icons/go";
import { Spin } from "antd";

interface ProductCost {
  amount: string | null;
  currency: string;
}

interface ProductDetails {
  asin: string | null;
  title: string | null;
  fba_fee: string | null;
  referral_fee: string | null;
  storage_fee: string | null;
  net_profit: string | null;
  net_margin: string | null;
  roi: string | null;
  potential_winner: string | null;
  rank: string | null;
  amazon_instock_rate: string | null;
  number_of_fba: string | null;
  estimated_monthly_sales: string | null;
  buy_box_equity: string | null;
  out_of_stock: number | null;
  dominant_seller: string | null;
}

interface ScanProduct {
  asin_upc: string;
  product_cost: ProductCost;
  selling_price: ProductCost;
  buy_box_price: ProductCost;
  product_details: ProductDetails;
}

interface ScanDetailsProps {
  products?: ScanProduct[];
  isLoading?: boolean;
}

const formatCurrency = (cost: ProductCost | undefined) => {
  if (!cost || cost.amount === null) return "-";
  return `${cost.currency}${cost.amount}`;
};

const formatValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return value.toString();
};

import { useEffect, useRef } from "react";

const ScanDetailsTable = ({ products = [], isLoading = false }: ScanDetailsProps) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const scrollbarThumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    const scrollbar = scrollbarRef.current;
    const scrollbarThumb = scrollbarThumbRef.current;

    if (!tableContainer || !scrollbar || !scrollbarThumb) return;

    const handleScroll = () => {
      if (!scrollbarThumb) return; // Add guard clause
      const scrollPercentage = tableContainer.scrollLeft / (tableContainer.scrollWidth - tableContainer.clientWidth);
      const thumbX = scrollPercentage * (scrollbar.clientWidth - scrollbarThumb.clientWidth);
      scrollbarThumb.style.transform = `translateX(${thumbX}px)`;
    };

    tableContainer.addEventListener('scroll', handleScroll);

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.pageX;
      scrollLeft = tableContainer.scrollLeft;
      scrollbar.classList.add('cursor-grabbing');
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX;
      const walk = (x - startX) * 3; //scroll-fast
      tableContainer.scrollLeft = scrollLeft + walk;
    };

    const handleMouseUp = () => {
      isDragging = false;
      scrollbar.classList.remove('cursor-grabbing');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    scrollbar.addEventListener('mousedown', handleMouseDown);

    return () => {
      tableContainer.removeEventListener('scroll', handleScroll);
      scrollbar.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
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
            {isLoading ? (
              <tr>
                <td colSpan={21} className="px-4 py-8 text-center">
                  <div className="flex justify-center">
                    <Spin size="large" style={{ color: "#18CB96" }} />
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={21} className="px-4 py-8 text-center">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="px-4 py-3">
                    <GoSearch className="size-4 text-gray-500" />
                  </td>
                  <td className="px-4 py-3">{product.asin_upc}</td>
                  <td className="px-4 py-3">{formatCurrency(product.product_cost)}</td>
                  <td className="px-4 py-3">{formatCurrency(product.selling_price)}</td>
                  <td className="px-4 py-3">{formatCurrency(product.buy_box_price)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.fba_fee)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.referral_fee)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.storage_fee)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.net_profit)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.net_margin)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.roi)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.potential_winner)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.rank)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.amazon_instock_rate)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.number_of_fba)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.estimated_monthly_sales)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.buy_box_equity)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.out_of_stock)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.dominant_seller)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.asin)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.title)}</td>
                </tr>
              ))
            )}
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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="flex justify-center">
                        <Spin size="large" />
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product, idx) => (
                    <tr key={idx} className="border-b border-gray-200 h-12">
                      <td className="px-4 py-2">
                        <GoSearch className="size-4 text-gray-500" />
                      </td>
                      <td className="px-4 py-2">{product.asin_upc}</td>
                      <td className="px-4 py-2">{formatCurrency(product.product_cost)}</td>
                      <td className="px-4 py-2">{formatCurrency(product.selling_price)}</td>
                      <td className="px-4 py-2">{formatCurrency(product.buy_box_price)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Scrollable Right Table - Fees and Profit Section */}
          <div className="flex-1 overflow-hidden">
            <div ref={tableContainerRef} className="overflow-x-auto">
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
                        className={`px-4 py-3 text-left font-medium whitespace-nowrap ${
                          header === "Title" ? "w-[75rem]" : 
                          header === "Dominant Seller" ? "w-[13.2rem]" : 
                          header === "Potential Winner" ? "w-[13.2rem]" : "w-44"
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={16} className="px-4 py-8 text-center">
                        <div className="flex justify-center">
                          <Spin size="large" style={{ color: "#18CB96" }} />
                        </div>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={16} className="px-4 py-8 text-center">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    products.map((product, idx) => (
                      <tr key={idx} className="border-b border-gray-200 h-12">
                        <td className="px-4 py-2">{formatValue(product.product_details.fba_fee)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.referral_fee)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.storage_fee)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.net_profit)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.net_margin)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.roi)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.potential_winner)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.rank)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.amazon_instock_rate)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.number_of_fba)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.estimated_monthly_sales)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.buy_box_equity)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.out_of_stock)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.dominant_seller)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.asin)}</td>
                        <td className="px-4 py-2">{formatValue(product.product_details.title)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div ref={scrollbarRef} className="custom-scrollbar">
              <div ref={scrollbarThumbRef} className="custom-scrollbar-thumb"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanDetailsTable;
