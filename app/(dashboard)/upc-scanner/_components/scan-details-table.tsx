"use client";

import { GoSearch } from "react-icons/go";
import { Spin } from "antd";
import { HiChevronUpDown, HiChevronUp, HiChevronDown } from "react-icons/hi2";

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
  number_of_fbm: string | null;
  number_of_amz: string | null;
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

type SortOrder = 'asc' | 'desc' | null;

type SortableColumn = 
  | 'buy_box_price'
  | 'fba_fee'
  | 'storage_fee'
  | 'net_profit'
  | 'net_margin'
  | 'roi'
  | 'rank'
  | 'amazon_instock_rate'
  | 'number_of_fba'
  | 'number_of_fbm'
  | 'estimated_monthly_sales'
  | 'buy_box_equity'
  | 'dominant_seller';

interface SortState {
  column: SortableColumn | null;
  order: SortOrder;
}

const formatCurrency = (cost: ProductCost | undefined) => {
  if (!cost || cost.amount === null) return "-";
  return `${cost.currency}${cost.amount}`;
};

const formatValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return value.toString();
};

const parsePrice = (cost: ProductCost | undefined): number => {
  if (!cost || cost.amount === null) return 0;
  return parseFloat(cost.amount) || 0;
};

const parseNumericValue = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  // Remove any non-numeric characters except decimal point and minus sign
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};

const parseStringValue = (value: string | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return value.toLowerCase();
};

import { useEffect, useRef, useState, useMemo } from "react";

const ScanDetailsTable = ({ products = [], isLoading = false }: ScanDetailsProps) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const scrollbarThumbRef = useRef<HTMLDivElement>(null);
  const [sortState, setSortState] = useState<SortState>({ column: null, order: null });

  // Sort products based on selected column
  const sortedProducts = useMemo(() => {
    if (!sortState.column || !sortState.order) return products;
    
    return [...products].sort((a, b) => {
      let valueA: number | string = 0;
      let valueB: number | string = 0;

      switch (sortState.column) {
        case 'buy_box_price':
          valueA = parsePrice(a.buy_box_price);
          valueB = parsePrice(b.buy_box_price);
          break;
        case 'fba_fee':
          valueA = parseNumericValue(a.product_details.fba_fee);
          valueB = parseNumericValue(b.product_details.fba_fee);
          break;
        case 'storage_fee':
          valueA = parseNumericValue(a.product_details.storage_fee);
          valueB = parseNumericValue(b.product_details.storage_fee);
          break;
        case 'net_profit':
          valueA = parseNumericValue(a.product_details.net_profit);
          valueB = parseNumericValue(b.product_details.net_profit);
          break;
        case 'net_margin':
          valueA = parseNumericValue(a.product_details.net_margin);
          valueB = parseNumericValue(b.product_details.net_margin);
          break;
        case 'roi':
          valueA = parseNumericValue(a.product_details.roi);
          valueB = parseNumericValue(b.product_details.roi);
          break;
        case 'rank':
          valueA = parseNumericValue(a.product_details.rank);
          valueB = parseNumericValue(b.product_details.rank);
          break;
        case 'amazon_instock_rate':
          valueA = parseNumericValue(a.product_details.amazon_instock_rate);
          valueB = parseNumericValue(b.product_details.amazon_instock_rate);
          break;
        case 'number_of_fba':
          valueA = parseNumericValue(a.product_details.number_of_fba);
          valueB = parseNumericValue(b.product_details.number_of_fba);
          break;
        case 'number_of_fbm':
          valueA = parseNumericValue(a.product_details.number_of_fbm);
          valueB = parseNumericValue(b.product_details.number_of_fbm);
          break;
        case 'estimated_monthly_sales':
          valueA = parseNumericValue(a.product_details.estimated_monthly_sales);
          valueB = parseNumericValue(b.product_details.estimated_monthly_sales);
          break;
        case 'buy_box_equity':
          valueA = parseNumericValue(a.product_details.buy_box_equity);
          valueB = parseNumericValue(b.product_details.buy_box_equity);
          break;
        case 'dominant_seller':
          valueA = parseStringValue(a.product_details.dominant_seller);
          valueB = parseStringValue(b.product_details.dominant_seller);
          break;
      }

      // Handle string comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        if (sortState.order === 'asc') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      }

      // Handle numeric comparison
      if (sortState.order === 'asc') {
        return (valueA as number) - (valueB as number);
      } else {
        return (valueB as number) - (valueA as number);
      }
    });
  }, [products, sortState]);

  const handleSort = (column: SortableColumn) => {
    setSortState(prev => {
      // If clicking the same column
      if (prev.column === column) {
        if (prev.order === null) {
          return { column, order: 'asc' };
        } else if (prev.order === 'asc') {
          return { column, order: 'desc' };
        } else {
          return { column: null, order: null };
        }
      }
      // If clicking a different column
      return { column, order: 'asc' };
    });
  };

  const getSortIcon = (column: SortableColumn) => {
    if (sortState.column !== column) {
      return <HiChevronUpDown className="size-4 text-gray-400 group-hover:text-gray-600" />;
    }
    
    if (sortState.order === 'asc') {
      return <HiChevronUp className="size-4 text-primary" />;
    } else if (sortState.order === 'desc') {
      return <HiChevronDown className="size-4 text-primary" />;
    } else {
      return <HiChevronUpDown className="size-4 text-gray-400 group-hover:text-gray-600" />;
    }
  };

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
    <div className="w-full overflow-x-auto scrollbar-hide rounded-b-xl border border-gray-200 max-h-[600px] overflow-y-auto">
      {/* Mobile View */}
      <div className="sm:hidden">
        <table className="table-fixed w-full min-w-[1600px] text-sm bg-white">
          <thead className="bg-[#F3F4F6] text-[#596375] sticky top-0 z-20">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium">
                <GoSearch className="size-4 text-gray-500" />
              </th>
              <th className="px-4 py-3 text-left font-medium">UPC / EAN</th>
              <th className="px-4 py-3 text-left font-medium">Product Cost</th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  type="button"
                  onClick={() => handleSort('buy_box_price')}
                  className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                >
                  Buy Box Price
                  {getSortIcon('buy_box_price')}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  type="button"
                  onClick={() => handleSort('fba_fee')}
                  className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                >
                  FBA Fee
                  {getSortIcon('fba_fee')}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium">Referral Fee</th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  type="button"
                  onClick={() => handleSort('storage_fee')}
                  className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                >
                  Storage Fee
                  {getSortIcon('storage_fee')}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  type="button"
                  onClick={() => handleSort('net_profit')}
                  className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                >
                  Net Profit
                  {getSortIcon('net_profit')}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  type="button"
                  onClick={() => handleSort('net_margin')}
                  className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                >
                  Net Margin
                  {getSortIcon('net_margin')}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  type="button"
                  onClick={() => handleSort('roi')}
                  className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                >
                  ROI
                  {getSortIcon('roi')}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium">
                Potential Winner
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  type="button"
                  onClick={() => handleSort('rank')}
                  className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                >
                  Rank
                  {getSortIcon('rank')}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  type="button"
                  onClick={() => handleSort('amazon_instock_rate')}
                  className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                >
                  Amazon Instock Rate
                  {getSortIcon('amazon_instock_rate')}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  type="button"
                  onClick={() => handleSort('number_of_fba')}
                  className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                >
                  # FBA Sellers
                  {getSortIcon('number_of_fba')}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  type="button"
                  onClick={() => handleSort('number_of_fbm')}
                  className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                >
                  # FBM Sellers
                  {getSortIcon('number_of_fbm')}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium"># AMZ Sellers</th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  type="button"
                  onClick={() => handleSort('estimated_monthly_sales')}
                  className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                >
                  Est. Monthly Sold
                  {getSortIcon('estimated_monthly_sales')}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  type="button"
                  onClick={() => handleSort('buy_box_equity')}
                  className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                >
                  Buy Box Equity
                  {getSortIcon('buy_box_equity')}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium">Out of Stock</th>
              <th className="px-4 py-3 text-left font-medium">
                <button
                  type="button"
                  onClick={() => handleSort('dominant_seller')}
                  className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                >
                  Dominant Seller
                  {getSortIcon('dominant_seller')}
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium">ASIN</th>
              <th className="px-4 py-3 text-left font-medium">Title</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={20} className="px-4 py-8 text-center">
                  <div className="flex justify-center">
                    <Spin size="large" style={{ color: "#18CB96" }} />
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={20} className="px-4 py-8 text-center">
                  No products found
                </td>
              </tr>
            ) : (
              sortedProducts.map((product, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="px-4 py-3">
                    <GoSearch className="size-4 text-gray-500" />
                  </td>
                  <td className="px-4 py-3">{product.asin_upc}</td>
                  <td className="px-4 py-3">{formatCurrency(product.product_cost)}</td>
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
                  <td className="px-4 py-3">{formatValue(product.product_details.number_of_fbm)}</td>
                  <td className="px-4 py-3">{formatValue(product.product_details.number_of_amz)}</td>
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
      <div className="relative hidden sm:block w-full">
        <div className="flex">
          {/* Left Table */}
          <div className="sticky left-0 z-20 w-[512px] border-r border-gray-300 bg-white">
            <table className="table-fixed w-full text-sm border-separate border-spacing-0">
              <thead className="bg-[#F3F4F6] text-[#596375] sticky top-0 z-30">
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
                  <th className="w-32 px-4 py-3 text-left font-medium whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSort('buy_box_price')}
                      className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                    >
                      Buy Box Price
                      {getSortIcon('buy_box_price')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center">
                      <div className="flex justify-center">
                        <Spin size="large" />
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center">
                      No products found
                    </td>
                  </tr>
                ) : (
                  sortedProducts.map((product, idx) => (
                    <tr key={idx} className="border-b border-gray-200 h-12">
                      <td className="px-4 py-2">
                        <GoSearch className="size-4 text-gray-500" />
                      </td>
                      <td className="px-4 py-2">{product.asin_upc}</td>
                      <td className="px-4 py-2">{formatCurrency(product.product_cost)}</td>
                      <td className="px-4 py-2">{formatCurrency(product.buy_box_price)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Scrollable Right Table - Fees and Profit Section */}
          <div ref={tableContainerRef} className="flex-1 overflow-x-auto relative show-scrollbar">
            <table className="table-fixed w-[2560px] text-sm bg-white border-separate border-spacing-0">
              <thead className="bg-[#F3F4F6] text-[#596375] sticky top-0 z-10">
                <tr className="border-b border-gray-200 divide-x-2 h-12">
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    <button
                      type="button"
                      onClick={() => handleSort('fba_fee')}
                      className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                    >
                      FBA Fee
                      {getSortIcon('fba_fee')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    Referral Fee
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    <button
                      type="button"
                      onClick={() => handleSort('storage_fee')}
                      className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                    >
                      Storage Fee
                      {getSortIcon('storage_fee')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    <button
                      type="button"
                      onClick={() => handleSort('net_profit')}
                      className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                    >
                      Net Profit
                      {getSortIcon('net_profit')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    <button
                      type="button"
                      onClick={() => handleSort('net_margin')}
                      className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                    >
                      Net Margin
                      {getSortIcon('net_margin')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    <button
                      type="button"
                      onClick={() => handleSort('roi')}
                      className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                    >
                      ROI
                      {getSortIcon('roi')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-[13.2rem]">
                    Potential Winner
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    <button
                      type="button"
                      onClick={() => handleSort('rank')}
                      className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                    >
                      Rank
                      {getSortIcon('rank')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    <button
                      type="button"
                      onClick={() => handleSort('amazon_instock_rate')}
                      className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                    >
                      Amazon Instock Rate
                      {getSortIcon('amazon_instock_rate')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    <button
                      type="button"
                      onClick={() => handleSort('number_of_fba')}
                      className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                    >
                      # FBA Sellers
                      {getSortIcon('number_of_fba')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    <button
                      type="button"
                      onClick={() => handleSort('number_of_fbm')}
                      className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                    >
                      # FBM Sellers
                      {getSortIcon('number_of_fbm')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    # AMZ Sellers
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    <button
                      type="button"
                      onClick={() => handleSort('estimated_monthly_sales')}
                      className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                    >
                      Est. Monthly Sold
                      {getSortIcon('estimated_monthly_sales')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    <button
                      type="button"
                      onClick={() => handleSort('buy_box_equity')}
                      className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                    >
                      Buy Box Equity
                      {getSortIcon('buy_box_equity')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    Out of Stock
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-[13.2rem]">
                    <button
                      type="button"
                      onClick={() => handleSort('dominant_seller')}
                      className="group flex items-center gap-1 hover:text-gray-800 transition-colors"
                    >
                      Dominant Seller
                      {getSortIcon('dominant_seller')}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-44">
                    ASIN
                  </th>
                  <th className="px-4 py-3 text-left font-medium whitespace-nowrap w-[75rem]">
                    Title
                  </th>
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
                  sortedProducts.map((product, idx) => (
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
                      <td className="px-4 py-2">{formatValue(product.product_details.number_of_fbm)}</td>
                      <td className="px-4 py-2">{formatValue(product.product_details.number_of_amz)}</td>
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
        </div>
      </div>
    </div>
  );
};

export default ScanDetailsTable;
