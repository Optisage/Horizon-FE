"use client";

import React, { useState, useRef, useEffect } from "react";
import { MdOutlineInsertChartOutlined } from "react-icons/md";
import Header from "./Header";
import ScanResultsTable from "./scan-results-table";
import { HiOutlineCloudArrowUp } from "react-icons/hi2";
import ConfirmScanModal from "./confirm-scan-modal";
import ScanDetailsTable from "./scan-details-table";
import { CgClose } from "react-icons/cg";
import MiniDatePicker from "./date-picker";
import { IoSearchOutline } from "react-icons/io5";
import { message, Modal } from "antd";

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
  meta: Record<string, unknown>[];
}

interface SingleScanResponse {
  status: number;
  message: string;
  data: ScanResult;
  meta: Record<string, unknown>[];
}

// Interfaces for scan details
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

interface ScanDetailsResponse {
  status: number;
  message: string;
  data: ScanDetailsData;
  meta: Record<string, unknown>[];
}

interface ScanDetailsData extends ScanResult {
  products: ScanProduct[];
}

const UpcScanner = () => {
  const [activeTab, setActiveTab] = useState<Tab>("upc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [scanDetails, setScanDetails] = useState<ScanDetailsData | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [productName, setProductName] = useState<string>("");
  const [marketplaceId, setMarketplaceId] = useState<string>("6");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Fetch scan results from API
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchScanResults = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/upc-scanner');
        
        // Check if response is ok before parsing JSON
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        // Check content type to ensure it's JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON response but got ${contentType}`);
        }
        
        const data: ApiResponse = await response.json();
        
        if (data.status === 200) {
          setScanResults(data.data);
        } else {
          message.error(data.message || 'Failed to fetch scan results');
        }
      } catch (err) {
        if (err instanceof SyntaxError) {
          message.error('Invalid response format from server');
        } else {
          message.error('An error occurred while fetching scan results');
        }
        console.error('Error fetching scan results:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScanResults();
  }, []);
  
  // Handle refreshing a scan
  const handleRefreshScan = async (scanId: number) => {
    try {
      message.loading({ content: 'Refreshing scan...', key: 'refreshScan' });
      
      const response = await fetch(`/api/upc-scanner/${scanId}/restart`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 200) {
        message.success({ content: 'Scan refresh started', key: 'refreshScan' });
        
        // Update the scan in the results list
        setScanResults(prevResults => 
          prevResults.map(scan => 
            scan.id === scanId ? { ...scan, status: 'pending' } : scan
          )
        );
        
        // If this scan is currently selected, update the details too
        if (selectedProductId === scanId.toString()) {
          setScanDetails(prevDetails => 
            prevDetails ? { ...prevDetails, status: 'pending' } : null
          );
        }
      } else {
        message.error({ content: data.message || 'Failed to refresh scan', key: 'refreshScan' });
      }
    } catch (err) {
      console.error('Error refreshing scan:', err);
      message.error({ content: 'Failed to refresh scan', key: 'refreshScan' });
    }
  }
  
  // Handle deleting a scan
  const handleDeleteScan = async (scanId: number) => {
    // Show confirmation dialog
    Modal.confirm({
      title: 'Delete Scan',
      content: 'Are you sure you want to delete this scan? This action cannot be undone.',
      okText: 'Delete',
      okType: 'primary',
      okButtonProps: { 
        style: { 
          backgroundColor: '#18CB96', 
          borderColor: '#18CB96',
          borderRadius: '9999px'
        } 
      },
      cancelButtonProps: {
        style: {
          borderColor: '#18CB96',
          borderRadius: '9999px'
        }
      },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          message.loading({ content: 'Deleting scan...', key: 'deleteScan' });
          
          const response = await fetch(`/api/upc-scanner/${scanId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.status === 200) {
            message.success({ content: 'Scan deleted successfully', key: 'deleteScan' });
            
            // Remove the scan from the results list
            setScanResults(prevResults => 
              prevResults.filter(scan => scan.id !== scanId)
            );
            
            // If this scan is currently selected, clear the details
            if (selectedProductId === scanId.toString()) {
              setSelectedProductId(null);
              setScanDetails(null);
            }
          } else {
            message.error({ content: data.message || 'Failed to delete scan', key: 'deleteScan' });
          }
        } catch (err) {
          console.error('Error deleting scan:', err);
          message.error({ content: 'Failed to delete scan', key: 'deleteScan' });
        }
      },
    });
  };

  // Fetch scan details when a product is selected
  useEffect(() => {
    const fetchScanDetails = async () => {
      if (!selectedProductId) {
        setScanDetails(null);
        return;
      }
      
      setIsLoadingDetails(true);
      try {
        // Use the API endpoint with /api prefix
        const response = await fetch(`/api/upc-scanner/${selectedProductId}`);
        
        // Check if response is OK
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        
        const data: ScanDetailsResponse = await response.json();
        setScanDetails(data.data);
      } catch (err) {
        if (err instanceof SyntaxError) {
          // JSON parsing error
          message.error("Invalid response format from server");
        } else {
          // Other fetch errors
          message.error("Failed to fetch scan details");
        }
        console.error("Error fetching scan details:", err);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchScanDetails();
  }, [selectedProductId]);

  // Marketplace options with icons
  const marketplaceOptions = [
    { id: "1", name: "United States", flag: "🇺🇸" },
    { id: "6", name: "Canada", flag: "🇨🇦" },
    { id: "2", name: "United Kingdom", flag: "🇬🇧" },
    { id: "11", name: "Mexico", flag: "🇲🇽" },
  ];

  const getSelectedMarketplace = () => {
    return marketplaceOptions.find(option => option.id === marketplaceId) || marketplaceOptions[1];
  };

  const handleMarketplaceSelect = (id: string) => {
    setMarketplaceId(id);
    setIsDropdownOpen(false);
  };

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

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is Excel format
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
      ];
      
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        message.success(`File "${file.name}" selected successfully`);
      } else {
        message.error('Please select a valid Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      message.error('Please select a file first');
      return;
    }

    if (!productName.trim()) {
      message.error('Please enter a product name');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('product_name', productName.trim());
      formData.append('product_id_type', 'asin,upc'); // Include both ASIN and UPC
      formData.append('marketplace_id', marketplaceId);

      const response = await fetch('/api/upc-scanner', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result: SingleScanResponse = await response.json();
        message.success('UPC Scan created successfully!');
        
        // Add the new scan result to the existing results
        setScanResults(prevResults => [result.data, ...prevResults]);
        
        // Reset form
        setSelectedFile(null);
        setProductName("");
        setActiveTab('upc'); // Switch back to results tab
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error instanceof Error ? error.message : 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
                {scanDetails?.product_name || "Loading..."}
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
              {scanResults.length > 0 ? `${scanResults.length} Searches found` : "No searches found"}
            </p>
            {selectedProductId ? (
              <div className="">
                <div className="bg-[#F3F4F6] rounded-t-xl grid lg:grid-cols-[639px_1fr] lg:divide-x-2 divide-gray-200 border border-b-0 border-gray-200">
                  <div className="hidden lg:block p-8" />
                  <div className="p-6 lg:p-8 text-[#596375] text-sm font-semibold text-center lg:text-start">
                    Fees and Profit
                  </div>
                </div>
                <ScanDetailsTable 
                  products={scanDetails?.products || []} 
                  isLoading={isLoadingDetails} 
                />
              </div>
            ) : (
              <ScanResultsTable 
                onDetailsClick={handleDetailsClick}
                onRefreshScan={handleRefreshScan}
                onDeleteScan={handleDeleteScan}
                scanResults={scanResults}
                isLoading={isLoading}
              />
            )}
          </div>
        )}

        {/* New Scanner Tab */}
        {activeTab === "new" && (
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 min-h-[598px] flex flex-col justify-center">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineCloudArrowUp className="w-8 h-8 text-[#6B7280]" />
                </div>
                <h3 className="text-[#111827] font-semibold text-xl mb-2">
                  Upload Excel File
                </h3>
                <p className="text-[#6B7280] text-sm">
                  Upload Excel files (.xlsx, .xls) containing UPC codes to start scanning
                </p>
              </div>

              {/* Form Fields */}
              <div className="max-w-md mx-auto w-full space-y-6">
                <div className="space-y-2">
                  <label htmlFor="productName" className="block text-sm font-medium text-[#374151]">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="productName"
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 border border-[#D1D5DB] rounded-lg text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="marketplace" className="block text-sm font-medium text-[#374151]">
                    Marketplace
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      disabled={isUploading}
                      className="w-full px-4 py-3.5 pl-14 pr-12 border border-[#D1D5DB] rounded-lg text-[#111827] bg-white hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-left font-medium"
                      style={{ fontFamily: 'inherit' }}
                    >
                      {getSelectedMarketplace().name}
                    </button>
                    
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <span className="text-xl w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center">
                        {getSelectedMarketplace().flag}
                      </span>
                    </div>
                    
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg 
                        className={`w-4 h-4 text-[#6B7280] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#D1D5DB] rounded-lg shadow-xl z-10 overflow-hidden">
                        {marketplaceOptions.map((option, index) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleMarketplaceSelect(option.id)}
                            className={`w-full px-4 py-4 pl-14 pr-6 text-left hover:bg-[#F3F4F6] focus:outline-none focus:bg-[#F3F4F6] transition-all duration-200 text-[#111827] font-medium relative ${
                              marketplaceId === option.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                            } ${index !== marketplaceOptions.length - 1 ? 'border-b border-[#E5E7EB]' : ''}`}
                            style={{ fontFamily: 'inherit' }}
                          >
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                              <span className="text-xl w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center">
                                {option.flag}
                              </span>
                            </span>
                            <span className="block">{option.name}</span>
                            {marketplaceId === option.id && (
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="mt-8 space-y-6">
                {selectedFile && (
                  <div className="bg-primary/5 border border-primary rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-primary font-medium text-sm">File Selected</p>
                <p className="text-primary/80 text-xs">{selectedFile.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <button
                    type="button"
                    onClick={handleFileSelect}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-[#D1D5DB] rounded-full text-[#374151] bg-white hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  >
                    <HiOutlineCloudArrowUp className="w-5 h-5" />
                    {selectedFile ? 'Change File' : 'Select Excel File'}
                  </button>

                  {selectedFile && productName.trim() && (
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        'Start UPC Scan'
                      )}
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcScanner;