"use client";

import { useState, useRef, useEffect } from "react";
import { MdOutlineInsertChartOutlined } from "react-icons/md";
import Header from "./Header";
import ScanResultsTable from "./scan-results-table";
import { HiOutlineCloudArrowUp } from "react-icons/hi2";
import { HiChevronDown } from "react-icons/hi";
import ConfirmScanModal from "./confirm-scan-modal";
import ScanDetailsTable from "./scan-details-table";
import { CgClose } from "react-icons/cg";
import MiniDatePicker from "./date-picker";
import { IoSearchOutline } from "react-icons/io5";

type Tab = "upc" | "new";

// Interface for scan result data
export interface ScanResult {
  id: number;
  product_name: string;
  product_id: string | null;
  items_count: number;
  products_found: number;
  last_seen: string;
  last_uploaded: string;
  status: string;
  marketplace_id: string;
  user_id: number;
}

interface ApiResponse {
  status: number;
  message: string;
  data: ScanResult[];
  meta: any[];
}

const UpcScanner = () => {
  const [activeTab, setActiveTab] = useState<Tab>("upc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  const handleStartNewScan = () => {
    setIsModalOpen(true);
  };

  const handleConfirmScan = () => {
    setIsModalOpen(false);
    setActiveTab("new");
  };

  const handleDetailsClick = (productId: string) => {
    setSelectedProductId((prev) => (prev === productId ? null : productId));
  };

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh] rounded-xl bg-white p-4 lg:p-5">
      <Header />

      <div className="p-3 sm:p-4 rounded-xl border border-border flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap sm:flex-nowrap text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("upc")}
              className={`flex items-center gap-1.5 rounded-full font-semibold py-2 px-4 transition-colors ${
                selectedProductId
                  ? "bg-[#F3F4F6] text-[#858587] hover:bg-[#F3F4F6]/90"
                  : activeTab === "upc"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-[#F3F4F6] text-[#858587] hover:bg-[#F3F4F6]/90"
              }`}
            >
              <MdOutlineInsertChartOutlined className="size-5" />
              UPC Scanner
            </button>

            {/* either "New Scan" or "Product Title"  */}
            {!selectedProductId ? (
              <button
                type="button"
                onClick={handleStartNewScan}
                className={`flex items-center gap-1.5 rounded-full font-semibold py-2 px-4 transition-colors ${
                  activeTab === "new"
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-[#F3F4F6] text-[#858587] hover:bg-[#F3F4F6]/90"
                }`}
              >
                <MdOutlineInsertChartOutlined className="size-5" />
                Start a new scan
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full font-semibold py-2 px-4 bg-primary text-white">
                <MdOutlineInsertChartOutlined className="size-5" />
                Sheper 2
                <button
                  type="button"
                  aria-label="Cancel"
                  onClick={() => setSelectedProductId(null)}
                  className="ml-2 hover:bg-white/20 rounded-full p-1"
                >
                  <CgClose className="size-4" />
                </button>
              </div>
            )}

            <ConfirmScanModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onConfirm={handleConfirmScan}
            />
          </div>

          {activeTab === "upc" && !selectedProductId && (
            <div className="flex gap-4 text-[#8C94A2] items-center flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 md:gap-4 text-sm max-w-md">
                <label htmlFor="product_name">Name Search</label>
                <div className="relative">
                  <IoSearchOutline className="absolute top-0 bottom-0 size-5 my-auto text-gray-400 left-3" />
                  <input
                    type="text"
                    id="product_name"
                    placeholder="Enter Product Name"
                    className="w-full py-3 pl-10 pr-4 text-[#596375] border border-border rounded-lg outline-none focus:border-primary"
                  />
                </div>
              </div>

              <MiniDatePicker />
            </div>
          )}
        </div>

        {/* UPC Scanner Tab */}
        {activeTab === "upc" && (
          <div className="flex flex-col gap-4">
            <p className="text-[#8C94A3] text-sm font-medium">
              1,203 Searches remaining
            </p>
            {selectedProductId ? (
              <div className="">
                <div className="bg-[#F3F4F6] rounded-t-xl grid lg:grid-cols-[639px_1fr] lg:divide-x-2 divide-gray-200 border border-b-0 border-gray-200">
                  <div className="hidden lg:block p-8" />
                  <div className="p-6 lg:p-8 text-[#596375] text-sm font-semibold text-center lg:text-start">
                    Fees and Profit
                  </div>
                </div>
                <ScanDetailsTable />
              </div>
            ) : (
              <ScanResultsTable onDetailsClick={handleDetailsClick} />
            )}
          </div>
        )}

        {/* New Scanner Tab */}
        {activeTab === "new" && (
          <div className="flex flex-col gap-4 text-[#8C94A3] text-sm font-medium">
            <div className="p-4 border border-dashed border-[#8C94A3] rounded-xl h-[598px] flex flex-col justify-center gap-3 text-center">
              <HiOutlineCloudArrowUp className="size-9 mx-auto" />
              <span>
                <p className="text-[#596375] font-medium text-base">
                  Upload Product Barcode
                </p>
                <p className="text-[#A9ACB2] text-xs">
                  Upload an image, PDF, .png, jpeg
                </p>
              </span>

              <UploadDropdown />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcScanner;