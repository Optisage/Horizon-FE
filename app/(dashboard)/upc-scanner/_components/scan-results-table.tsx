"use client";

import { Tooltip, Dropdown } from "antd";
import { CustomTable as Table } from "@/lib/AntdComponents";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { FC, useState, useEffect, useRef } from "react";
import {
  HiArrowPath,
  HiPrinter,
  HiEllipsisVertical,
  HiTrash,
  HiArrowDownTray,
} from "react-icons/hi2";
import * as XLSX from 'xlsx';

interface ScanResultsTableProps {
  onDetailsClick?: (productId: string) => void;
  onRefreshScan?: (scanId: number) => void;
  onDeleteScan?: (scanId: number) => void;
  scanResults?: Array<{
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
    failed_reason?: string;
  }>;
  isLoading?: boolean;
}

export interface ProductData {
  key: string;
  index: number;
  name: string;
  productId: string;
  items: number;
  found: number;
  lastScan: string;
  lastUploaded: string;
  status: "Pending" | "In Progress" | "Completed";
  last_seen_date: Date; // Added for sorting
  failedReason?: string; // Reason for failure if scan failed
}

const ScanResultsTable: FC<ScanResultsTableProps> = ({ onDetailsClick, onRefreshScan, onDeleteScan, scanResults = [], isLoading = false }) => {
  // Track which scan is currently refreshing
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  // Store interval IDs for cleanup
  const intervalRef = useRef<{[key: number]: NodeJS.Timeout}>({});
  
  // Auto-refresh pending and in-progress scans every minute
  useEffect(() => {
    // Clear previous intervals
    Object.values(intervalRef.current).forEach(interval => clearInterval(interval));
    intervalRef.current = {};
    
    // Set up new intervals for pending and in-progress scans
    scanResults.forEach(scan => {
      if (scan.status === 'pending' || scan.status === 'in-progress') {
        const scanId = scan.id;
        // Set up interval to refresh every 30 seconds (30000ms)
        const intervalId = setInterval(() => {
          onRefreshScan?.(scanId);
        }, 30000);
        
        // Store interval ID for cleanup
        intervalRef.current[scanId] = intervalId;
      }
    });
    
    // Cleanup function
    return () => {
      Object.values(intervalRef.current).forEach(interval => clearInterval(interval));
    };
  }, [scanResults, onRefreshScan]);
  
  // Function to download scan results as Excel file
  const handleDownloadExcel = (record: ProductData) => {
    // Find the original scan result data
    const scanData = scanResults.find(scan => scan.id.toString() === record.key);
    
    if (!scanData) return;
    
    // Create worksheet data
    const wsData = [
      // Headers
      ['UPC Scanner Results'],
      [''],
      ['Scan Details'],
      ['Search Name', scanData.product_name],
      ['UPC / EAN', scanData.product_id || ''],
      ['Items Count', scanData.items_count.toString()],
      ['Products Found', scanData.products_found.toString()],
      ['Last Scan', new Date(scanData.last_seen).toLocaleDateString()],
      ['Last Uploaded', new Date(scanData.last_uploaded).toLocaleDateString()],
      ['Status', scanData.status],
      ['Marketplace ID', scanData.marketplace_id]
    ];
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Scan Results');
    
    // Generate filename
    const fileName = `UPC_Scan_${scanData.product_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Write and download
    XLSX.writeFile(wb, fileName);
  };
  
  // Convert API scan results to table format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: '2-digit' 
    });
  };

 
  const tableData: ProductData[] = scanResults
    .map((scan, index) => ({
      key: scan.id.toString(),
      index: index + 1,
      name: scan.product_name,
      productId: scan.product_id || scan.id.toString(),
      items: scan.items_count,
      found: scan.products_found,
      lastScan: formatDate(scan.last_seen),
      lastUploaded: formatDate(scan.last_uploaded),
      status: scan.status === 'completed' 
        ? "Completed" 
        : scan.status === 'in-progress' 
          ? "In Progress" 
          : "Pending" as "Pending" | "In Progress" | "Completed",
      failedReason: scan.failed_reason,
      last_seen_date: new Date(scan.last_seen) // Add original date for sorting
    }))
    // Sort by last_seen_date in descending order (most recent first)
    .sort((a, b) => b.last_seen_date.getTime() - a.last_seen_date.getTime());
  const columns: ColumnsType<ProductData> = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (_, record, index) => <span>{index + 1}</span>,
    },
    {
      title: "Search Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => {
        const dotColor = name === "TOSSI" ? "black" : "#18CB96";
        // Since we've sorted the table data, the first item (index 0) is the most recent
        const isMostRecent = record.key === tableData[0]?.key;
        return (
          <div className="flex items-center gap-2">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
            <span className={isMostRecent ? "font-bold" : ""}>{name}</span>
          </div>
        );
      },
    },

    {
      title: "No. of items",
      dataIndex: "items",
      key: "items",
      render: (text, record) => {
        // Since we've sorted the table data, the first item (index 0) is the most recent
        const isMostRecent = record.key === tableData[0]?.key;
        return (
          <span className={isMostRecent ? "font-bold" : ""}>{text}</span>
        );
      },
    },
    {
      title: "Product Found",
      dataIndex: "found",
      key: "found",
    },
    {
      title: "Last Scan",
      dataIndex: "lastScan",
      key: "lastScan",
      render: (text, record) => {
        // Since we've sorted the table data, the first item (index 0) is the most recent
        const isMostRecent = record.key === tableData[0]?.key;
        return (
          <span className={isMostRecent ? "font-bold" : ""}>{text}</span>
        );
      },
    },
    {
      title: "Last uploaded",
      dataIndex: "lastUploaded",
      key: "lastUploaded",
      render: (text, record) => {
        // Since we've sorted the table data, the first item (index 0) is the most recent
        const isMostRecent = record.key === tableData[0]?.key;
        return (
          <span className={isMostRecent ? "font-bold" : ""}>{text}</span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        record.failedReason ? (
          <Tooltip title={record.failedReason}>
            <span
              className={`px-1.5 py-1 rounded-full text-xs font-semibold`}
              style={{
                backgroundColor: status === "Pending" ? "#FDF5E9" : "#18CB9610",
                color: status === "Pending" ? "#FF9B06" : "#18CB96",
              }}
            >
              {status}
            </span>
          </Tooltip>
        ) : (
          <span
            className={`px-1.5 py-1 rounded-full text-xs font-semibold`}
            style={{
              backgroundColor: status === "Pending" ? "#FDF5E9" : "#18CB9610",
              color: status === "Pending" ? "#FF9B06" : "#18CB96",
            }}
          >
            {status}
          </span>
        )
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record: ProductData) => {
        const items: MenuProps["items"] = [
          {
            key: "download",
            label: (
              <div className="flex items-center gap-2">
                <HiArrowDownTray size={16} />
                <span>Download</span>
              </div>
            ),
            onClick: () => {
              handleDownloadExcel(record);
            },
          },
          {
            key: "delete",
            label: (
              <div className="flex items-center gap-2 text-red-500">
                <HiTrash size={16} />
                <span>Delete</span>
              </div>
            ),
            onClick: () => {
              const scanId = parseInt(record.key);
              onDeleteScan?.(scanId);
            },
          },
        ];

        return (
          <div className="flex gap-2">
            <Tooltip title="Refresh">
              <button 
                type="button" 
                aria-label="Refresh" 
                onClick={() => {
                  const scanId = parseInt(record.key);
                  setRefreshingId(scanId);
                  onRefreshScan?.(scanId);
                  // Reset the refreshing state after 2 seconds
                  setTimeout(() => setRefreshingId(null), 2000);
                }}
              >
                <HiArrowPath
                  size={24}
                  className={`${refreshingId === parseInt(record.key) ? 'text-primary animate-spin' : 'text-[#8C94A3] hover:text-black'}`}
                />
              </button>
            </Tooltip>
            <Tooltip title="View Details">
              <button
                type="button"
                aria-label="View Details"
                onClick={() => onDetailsClick?.(record.productId)}
              >
                <HiPrinter
                  size={24}
                  className="text-[#8C94A3] hover:text-black"
                />
              </button>
            </Tooltip>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Tooltip title="More">
                <button type="button" aria-label="More">
                  <HiEllipsisVertical
                    size={24}
                    className="text-[#8C94A3] hover:text-black"
                  />
                </button>
              </Tooltip>
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      pagination={false}
      scroll={{ x: 800 }}
      className="custom-table"
      loading={isLoading}
    />
  );
};

export default ScanResultsTable;