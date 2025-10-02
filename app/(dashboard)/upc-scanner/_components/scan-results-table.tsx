"use client";

import { Tooltip } from "antd";
import { CustomTable as Table } from "@/lib/AntdComponents";
import type { ColumnsType } from "antd/es/table";
import { FC, useEffect, useState } from "react";
import { HiArrowPath, HiEllipsisVertical, HiPrinter } from "react-icons/hi2";

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

// Interface for API scan result
interface ScanResult {
  id: number;
  product_name: string;
  product_id: string | null;
  items_count: number;
  products_found: number;
  last_seen: string;
  last_uploaded: string;
  status: string;
  marketplace_id: string | number;
  user_id: number;
}

interface ScanResultsTableProps {
  newScan?: ScanResult;
  scanResults?: ScanResult[];
  isLoading?: boolean;
}

const ScanResultsTable: FC<ScanResultsTableProps> = ({ newScan, scanResults = [], isLoading = false }) => {
  const [data, setData] = useState<ProductData[]>([]);

  // Format dates from ISO to MM/DD/YY
  const formatDate = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().substr(-2)}`;
    } catch (e) {
      return isoDate;
    }
  };

  // Map API scan results to table data format
  useEffect(() => {
    if (scanResults && scanResults.length > 0) {
      const formattedData: ProductData[] = scanResults.map((scan, index) => ({
        key: scan.id.toString(),
        index,
        name: scan.product_name,
        productId: scan.product_id || 'N/A',
        items: scan.items_count,
        found: scan.products_found,
        lastSeen: formatDate(scan.last_seen),
        lastUploaded: formatDate(scan.last_uploaded),
        status: scan.status === "pending" ? "Pending" : "Completed",
      }));
      
      setData(formattedData);
    }
  }, [scanResults]);
        // Add new scan to the table when it arrives
  // Add new scan to the table when it arrives
  useEffect(() => {
    if (newScan) {
      const formattedScan: ProductData = {
        key: newScan.id.toString(),
        index: 0,
        name: newScan.product_name,
        productId: newScan.product_id || 'N/A',
        items: newScan.items_count,
        found: newScan.products_found,
        lastSeen: formatDate(newScan.last_seen),
        lastUploaded: formatDate(newScan.last_uploaded),
        status: newScan.status === "pending" ? "Pending" : "Completed",
      };

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
      render: () => (
        <div className="flex gap-2">
          <Tooltip title="Refresh">
            <button type="button" aria-label="Refresh">
              <HiArrowPath
                size={24}
                className="text-[#8C94A3] hover:text-black"
              />
            </button>
          </Tooltip>
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
      ),
    },
  ];

  return (
    <div className="w-full overflow-x-scroll">
      <Table 
        columns={columns} 
        dataSource={data} 
        loading={isLoading}
        locale={{
          emptyText: isLoading ? 'Loading...' : 'No scan results found'
        }}
      />
    </div>
  );
};

export default ScanResultsTable;