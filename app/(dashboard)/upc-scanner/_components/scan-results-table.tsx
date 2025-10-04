"use client";

import { Tooltip, Dropdown } from "antd";
import { CustomTable as Table } from "@/lib/AntdComponents";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { FC, useState } from "react";
import {
  HiArrowPath,
  HiPrinter,
  HiEllipsisVertical,
  HiTrash,
  HiArrowDownTray,
} from "react-icons/hi2";

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
  status: "Pending" | "Completed";
}

const ScanResultsTable: FC<ScanResultsTableProps> = ({ onDetailsClick, onRefreshScan, onDeleteScan, scanResults = [], isLoading = false }) => {
  // Track which scan is currently refreshing
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  // Convert API scan results to table format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: '2-digit' 
    });
  };

  // Use real data from API, no fallback to sample data
  const tableData: ProductData[] = scanResults.map((scan, index) => ({
    key: scan.id.toString(),
    index: index + 1,
    name: scan.product_name,
    productId: scan.product_id || scan.id.toString(),
    items: scan.items_count,
    found: scan.products_found,
    lastScan: formatDate(scan.last_seen),
    lastUploaded: formatDate(scan.last_uploaded),
    status: scan.status === 'pending' ? 'Pending' : 'Completed' as "Pending" | "Completed",
  }));
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
      render: (name, _, index) => {
        const dotColor = name === "TOSSI" ? "black" : "#18CB96";
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
      title: "UPC / EAN",
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
      title: "Last Scan",
      dataIndex: "lastScan",
      key: "lastScan",
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
            backgroundColor: status === "Pending" ? "#FDF5E9" : "#18CB9610",
          color: status === "Pending" ? "#FF9B06" : "#18CB96",
          }}
        >
          {status}
        </span>
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