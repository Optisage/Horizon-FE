"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { message } from "antd";
import { RxArrowTopRight } from "react-icons/rx";

interface ExportButtonProps {
  productData: {
    asin?: string;
    title?: string;
    brand?: string;
    category?: string;
    upcEan?: string;
    buyBoxPrice?: number;
    lowestFBAPrice?: number;
    lowestFBMPrice?: number;
    amazonPrice?: number;
    monthlySales?: number;
    roi?: number;
    profitMargin?: number;
    totalProfit?: number;
    sellerCount?: number;
    fbaSellers?: number;
    fbmSellers?: number;
    stockLevels?: number;
    referralFees?: number;
    fbaFees?: number;
    totalCost?: number;
  };
  currencySymbol: string;
}

const ExportToSheetsButton = ({ productData, currencySymbol }: ExportButtonProps) => {
  const prepareExportData = () => {
    return [
      ["ASIN", "Product Title", "Brand", "Category", "UPC/EAN", "Buy Box Price", 
       "Lowest FBA Price", "Lowest FBM Price", "Amazon’s Own Price", "Estimated Monthly Sales",
       "ROI (%)", "Profit Margin (%)", "Total Profit", "Number of Sellers", "FBA Seller Count",
       "FBM Seller Count", "Stock Levels", "Referral Fees", "FBA Fees", "Total Cost"],
     [// Data row
      productData.asin || "N/A",
      productData.title || "N/A",
      productData.brand || "N/A",
      productData.category || "N/A",
      productData.upcEan || "N/A",
      productData.buyBoxPrice ? `${currencySymbol}${productData.buyBoxPrice.toFixed(2)}` : "N/A",
      // Convert all number values safely
      productData.lowestFBAPrice?.toFixed(2) || "N/A",
      productData.lowestFBMPrice?.toFixed(2) || "N/A",
      productData.amazonPrice?.toFixed(2) || "N/A",
      productData.monthlySales?.toString() || "N/A",
      productData.roi?.toFixed(2) || "N/A",
      productData.profitMargin?.toFixed(2) || "N/A",
      productData.totalProfit?.toFixed(2) || "N/A",
      productData.sellerCount?.toString() || "0",
      productData.fbaSellers?.toString() || "0",
      productData.fbmSellers?.toString() || "0",
      productData.stockLevels?.toString() || "N/A",
      productData.referralFees?.toFixed(2) || "0.00",
      productData.fbaFees?.toFixed(2) || "0.00",
      productData.totalCost?.toFixed(2) || "N/A"
    ]
    ];
  };

  const handleExport = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/spreadsheets",
    onSuccess: async (tokenResponse) => {
      const exportData = prepareExportData();
      let newWindow: Window | null = window.open('', '_blank'); // 👈 Open blank tab immediately
  
      try {
        const response = await fetch("/api/create-sheet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: tokenResponse.access_token,
            data: exportData
          }),
        });
  
        const result = await response.json();
        console.log(result);
  
        if (!response.ok) {
          throw new Error(result.error || "Failed to create spreadsheet");
        }
  
        if (result.url && newWindow) {
          newWindow.location.href = result.url; // 👈 Set URL later
        } else if (newWindow) {
          newWindow.close(); // If something failed, close tab
        }
  
      } catch (error: any) {
        console.error("Export failed:", error);
        message.error(`Export failed: ${error.message}`);
        if (newWindow) newWindow.close(); // Close if error
      }
    },
    onError: () => {
      message.error("Google authentication failed");
    }
  });
  
  

  return (
    <button
      type="button"
      className="border border-border text-primary px-3 py-2 rounded-xl flex gap-1 items-center font-semibold hover:bg-gray-50 active:scale-95 duration-200 text-sm md:text-base"
      onClick={() => handleExport()}
    >
      Export to Google Sheets
      <RxArrowTopRight className="size-5" />
    </button>
  );
};

export default ExportToSheetsButton;