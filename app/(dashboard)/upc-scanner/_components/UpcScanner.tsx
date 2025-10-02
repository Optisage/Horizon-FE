"use client";

import { useState, useRef, useEffect } from "react";
import { MdOutlineInsertChartOutlined } from "react-icons/md";
import Header from "./Header";
import ScanResultsTable from "./scan-results-table";
import { HiOutlineCloudArrowUp } from "react-icons/hi2";
import { HiChevronDown } from "react-icons/hi";
import ExcelUploadForm from "./ExcelUploadForm";
import { message } from "antd";

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
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState<number>(0);

  // Fetch scan results when component mounts
  useEffect(() => {
    fetchScanResults();
  }, []);

  // Function to fetch scan results
  const fetchScanResults = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/upc-scanner', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      // Check if response has content before parsing
      const text = await response.text();
      if (!text || text.trim() === '') {
        throw new Error('Empty response from server');
      }
      
      // Parse the JSON text
      const result: ApiResponse = JSON.parse(text);
      
      if (result.status === 200) {
        setScanResults(result.data);
        setTotalProducts(result.data.length);
      } else {
        setError(result.message || 'Failed to fetch scan results');
        console.error('Error fetching scan results:', result);
      }
    } catch (error) {
      setError(`An error occurred while fetching scan results: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Error fetching scan results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful upload
  const handleUploadSuccess = (newScanResult: ScanResult) => {
    // Add the new scan result to the list and switch to UPC scanner tab
    setScanResults(prev => [newScanResult, ...prev]);
    setActiveTab("upc");
    // In a real implementation, you'd refetch the scan history
    // fetchScanResults();
  };
  
  // Handle refreshing a specific scan
  const handleRefreshScan = (scanId: number, updatedScan: ScanResult | null) => {
    // If updatedScan is null (empty response), just mark the scan as refreshing
    if (updatedScan === null) {
      // We don't update the scan data since the backend is processing it
      // The user will need to refresh the page to see updated data
      message.info("Scan refresh initiated. The scan is being refreshed. Please check back in a moment.");
      return;
    }
    
    // Update the specific scan in the results list
    setScanResults(prev => 
      prev.map(scan => scan.id === scanId ? updatedScan : scan)
    );
  };

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
            {error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-md">
                {error}
              </div>
            ) : (
              <>
                <p className="text-[#8C94A3] text-sm font-medium">
                  {isLoading ? "" : `${totalProducts} Products found`}
                </p>
                <ScanResultsTable 
                  scanResults={scanResults} 
                  newScan={scanResults[0]} 
                  isLoading={isLoading} 
                  onRefreshScan={handleRefreshScan} 
                />
              </>
            )}
          </div>
        )}

        {/* New Scanner Tab */}
        {activeTab === "new" && (
          <div className="flex flex-col gap-4 text-[#8C94A3] text-sm font-medium">
            <div className="p-6 border border-dashed border-[#8C94A3] rounded-xl">
              <div className="mb-4 flex flex-col items-center sm:items-start">
                <h2 className="text-[#596375] font-medium text-xl mb-2">
                  Upload Excel File for Scanning
                </h2>
                <p className="text-[#A9ACB2]">
                  Upload your Excel file with UPC/ASIN codes to scan products
                </p>
              </div>
              
              <ExcelUploadForm onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UpcScanner;