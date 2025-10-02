"use client";

import { Tooltip } from "antd";
import { CustomTable as Table } from "@/lib/AntdComponents";
import type { ColumnsType } from "antd/es/table";
import { FC, useEffect, useState } from "react";
import { HiArrowPath, HiEllipsisVertical, HiPrinter } from "react-icons/hi2";
import { ScanResult } from "./UpcScanner";
import ConfirmScanModal from "./confirm-scan-modal";

interface ProductData {
  key: string;
  index: number;
  name: string;
  productId: string;
  items: number;
  found: number;
  lastSeen: string;
  lastUploaded: string;
  status: "Pending" | "Completed";
}

// Empty initial data
const initialData: ProductData[] = [];

interface ScanResultsTableProps {
  scanResults: ScanResult[];
  newScan?: ScanResult;
  isLoading: boolean;
  onRefreshScan?: (scanId: number, updatedScan: ScanResult | null) => void;
}

const ScanResultsTable: FC<ScanResultsTableProps> = ({ 
  scanResults, 
  newScan, 
  isLoading,
  onRefreshScan 
}) => {
  const [data, setData] = useState<ProductData[]>(initialData);
  const [refreshingIds, setRefreshingIds] = useState<number[]>([]);

  // Format dates from ISO to MM/DD/YY
  const formatDate = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().substr(-2)}`;
    } catch (e) {
      return isoDate;
    }
  };

  // Convert ScanResult to ProductData format
  const formatScanResult = (scan: ScanResult): ProductData => {
    return {
      key: scan.id.toString(),
      index: 0, // Will be set by table rendering
      name: scan.product_name,
      productId: scan.product_id || 'N/A',
      items: scan.items_count,
      found: scan.products_found,
      lastSeen: formatDate(scan.last_seen),
      lastUploaded: formatDate(scan.last_uploaded),
      status: scan.status === "pending" ? "Pending" : "Completed",
    };
  };

  // Handle refreshing a scan
  const handleRefreshScan = async (scanId: number) => {
    try {
      setRefreshingIds(prev => [...prev, scanId]);
      
      const response = await fetch(`/api/upc-scanner/${scanId}/restart`, {
        method: 'POST',
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
        // Handle empty response as success
        if (onRefreshScan) {
          onRefreshScan(scanId, null);
        }
        return;
      }
      
      // Parse the JSON text
      const result = JSON.parse(text);
      
      if (result.status === 200) {
        // Call the parent component's handler with the updated scan
        if (onRefreshScan) {
          onRefreshScan(scanId, result.data);
        }
      } else {
        console.error('Error refreshing scan:', result);
      }
    } catch (error) {
      console.error('Error refreshing scan:', error);
    } finally {
      setRefreshingIds(prev => prev.filter(id => id !== scanId));
    }
  };

  // Update table data when scanResults change
  useEffect(() => {
    // Always set data based on scanResults, even if empty
    const formattedData = scanResults.map(formatScanResult);
    setData(formattedData);
  }, [scanResults]);

  // Add new scan to the table when it arrives
  useEffect(() => {
    if (newScan) {
      const formattedScan = formatScanResult(newScan);
      // Add new scan to the top of the list
      setData(prevData => [formattedScan, ...prevData]);
    }
  }, [newScan]);

  const columns: ColumnsType<ProductData> = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (_, record, index) => <span>{index + 1}</span>,
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (name, _, index) => {
        const dotColor = name === "TOSSI" ? "black" : "#009F6D";
        return (
          <div className="flex items-center gap-2">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
            <span className={index === 0 ? "font-bold" : ""}>{name}</span>
          </div>
        );
      },
    },
    {
      title: "Product ID",
      dataIndex: "productId",
      key: "productId",
      render: (text, _, index) => (
        <span className={index === 0 ? "font-bold" : ""}>{text}</span>
      ),
    },
    {
      title: "No. of items",
      dataIndex: "items",
      key: "items",
      render: (text, _, index) => (
        <span className={index === 0 ? "font-bold" : ""}>{text}</span>
      ),
    },
    {
      title: "Product Found",
      dataIndex: "found",
      key: "found",
    },
    {
      title: "Last Seen",
      dataIndex: "lastSeen",
      key: "lastSeen",
      render: (text, _, index) => (
        <span className={index === 0 ? "font-bold" : ""}>{text}</span>
      ),
    },
    {
      title: "Last uploaded",
      dataIndex: "lastUploaded",
      key: "lastUploaded",
      render: (text, _, index) => (
        <span className={index === 0 ? "font-bold" : ""}>{text}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={`px-1.5 py-1 rounded-full text-xs font-semibold`}
          style={{
            backgroundColor: status === "Pending" ? "#FDF5E9" : "#EDF7F5",
            color: status === "Pending" ? "#FF9B06" : "#009F6D",
          }}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const scanId = parseInt(record.key);
        const isRefreshing = refreshingIds.includes(scanId);
        
        return (
          <div className="flex gap-2">
            <ConfirmScanModal
              scanId={scanId}
              productName={record.name}
              onConfirm={handleRefreshScan}
              trigger={
                <Tooltip title="Refresh">
                  <button 
                    type="button" 
                    aria-label="Refresh" 
                    disabled={isRefreshing}
                  >
                    <HiArrowPath
                      size={24}
                      className={`${isRefreshing ? 'animate-spin text-primary' : 'text-[#8C94A3] hover:text-black'}`}
                    />
                  </button>
                </Tooltip>
              }
            />
            <Tooltip title="Print">
              <button type="button" aria-label="Print">
                <HiPrinter
                  size={24}
                  className="text-[#8C94A3] hover:text-black"
                />
              </button>
            </Tooltip>
            <Tooltip title="More">
              <button type="button" aria-label="More">
                <HiEllipsisVertical
                  size={24}
                  className="text-[#8C94A3] hover:text-black"
                />
              </button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full overflow-x-scroll">
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default ScanResultsTable;