"use client";

import { useState, useRef, useEffect } from "react";
import { MdOutlineInsertChartOutlined } from "react-icons/md";
import Header from "./Header";
import ScanResultsTable from "./scan-results-table";
import {
  HiOutlineCamera,
  HiOutlineCloudArrowUp,
  HiOutlineComputerDesktop,
  HiOutlinePhoto,
} from "react-icons/hi2";
import { HiChevronDown } from "react-icons/hi";
// import ConfirmScanModal from "./confirm-scan-modal";
// import { ScanDetailsTable } from "./scan-details-table";

type Tab = "upc" | "new";

const UpcScanner = () => {
  const [activeTab, setActiveTab] = useState<Tab>("upc");

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      <Header />

      <div className="p-3 sm:p-4 rounded-xl border border-border flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => setActiveTab("upc")}
              className={`flex items-center gap-1.5 rounded-full font-semibold py-2 px-4 transition-colors ${
                activeTab === "upc"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-[#F3F4F6] text-[#858587] hover:bg-[#F3F4F6]/90"
              }`}
            >
              <MdOutlineInsertChartOutlined className="size-5" />
              UPC Scanner
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`flex items-center gap-1.5 rounded-full font-semibold py-2 px-4 transition-colors ${
                activeTab === "new"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-[#F3F4F6] text-[#858587] hover:bg-[#F3F4F6]/90"
              }`}
            >
              <MdOutlineInsertChartOutlined className="size-5" />
              Start a new scan
            </button>

            {/* <ConfirmScanModal /> */}
          </div>

          {activeTab === "upc" && (
            <div className="flex gap-4 text-[#8C94A2]">
              <span className="flex items-center gap-2">
                Filter by{" "}
                <button
                  type="button"
                  className="px-4 py-2 rounded-full border border-[#D5D5D5] hover:bg-gray-50 transition-colors"
                >
                  Current
                </button>
              </span>
            </div>
          )}
        </div>

        {/* UPC Scanner Tab */}
        {activeTab === "upc" && (
          <div className="flex flex-col gap-4">
            <p className="text-[#8C94A3] text-sm font-medium">
              1,203 Products found
            </p>
            <ScanResultsTable />
          </div>
        )}

        {/* New Scanner Tab */}
        {activeTab === "new" && (
          <>
            {/* <div className="">
              <div className="bg-[#F3F4F6] rounded-t-xl grid lg:grid-cols-[639px_1fr] lg:divide-x-2 divide-gray-200 border border-b-0 border-gray-200">
                <div className="hidden lg:block p-8" />
                <div className="p-6 lg:p-8 text-[#596375] text-sm font-semibold text-center lg:text-start">
                  Fees and Profit
                </div>
              </div>
              <ScanDetailsTable />
            </div> */}

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
          </>
        )}
      </div>
    </section>
  );
};

export default UpcScanner;

// UploadDropdown
const UploadDropdown = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block mx-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 transition-colors rounded-full text-white font-semibold py-2 px-4"
      >
        <HiOutlinePhoto className="size-5" />
        Upload Option
        <HiChevronDown
          className={`size-5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 z-10 rounded-lg border border-[#E5E5E5] p-2 min-w-[174px] bg-white shadow-md">
          <button
            type="button"
            className="rounded-md bg-[#F3F4F6] hover:bg-[#e2e4e7] flex items-center justify-between py-1 px-2.5 w-full"
          >
            From Device
            <HiOutlineComputerDesktop className="size-5 text-[#A9ACB2]" />
          </button>

          <hr className="border-t border-[#E5E5E580] my-3" />

          <button
            type="button"
            className="rounded-md hover:bg-gray-100 flex items-center justify-between py-1 px-2.5 w-full"
          >
            Take Photo
            <HiOutlineCamera className="size-5 text-[#A9ACB2]" />
          </button>
        </div>
      )}
    </div>
  );
};

