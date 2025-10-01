"use client";

import { Tooltip, Dropdown } from "antd";
import { CustomTable as Table } from "@/lib/AntdComponents";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { FC } from "react";
import {
  HiArrowPath,
  HiPrinter,
  HiEllipsisVertical,
  HiTrash,
  HiArrowDownTray,
} from "react-icons/hi2";

interface ScanResultsTableProps {
  onDetailsClick?: (productId: string) => void;
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

const data: ProductData[] = [
  {
    key: "1",
    index: 1,
    name: "TOSSI",
    productId: "6525535",
    items: 50,
    found: 4,
    lastScan: "12/07/25",
    lastUploaded: "12/07/25",
    status: "Pending",
  },
  {
    key: "2",
    index: 2,
    name: "Peak Health",
    productId: "69028082",
    items: 30,
    found: 26,
    lastScan: "12/05/25",
    lastUploaded: "12/05/25",
    status: "Pending",
  },
  ...Array.from({ length: 7 }, (_, i) => ({
    key: `${3 + i}`,
    index: 3,
    name: "CB Int",
    productId: "69028082",
    items: 15,
    found: 33,
    lastScan: "12/05/25",
    lastUploaded: "12/05/25",
    status: (i < 1 ? "Pending" : "Completed") as "Pending" | "Completed",
  })),
];

const ScanResultsTable: FC<ScanResultsTableProps> = ({ onDetailsClick }) => {
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
          },
        ];

        return (
          <div className="flex gap-2">
            <Tooltip title="Refresh">
              <button type="button" aria-label="Refresh">
                <HiArrowPath
                  size={24}
                  className="text-[#8C94A3] hover:text-black"
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
    <div className="w-full overflow-x-scroll">
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default ScanResultsTable;

