"use client";

import { Tooltip } from "antd";
import { CustomTable as Table } from "@/lib/AntdComponents";
import type { ColumnsType } from "antd/es/table";
import { FC } from "react";
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

const data: ProductData[] = [
  {
    key: "1",
    index: 1,
    name: "TOSSI",
    productId: "6525535",
    items: 50,
    found: 4,
    lastSeen: "12/07/25",
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
    lastSeen: "12/05/25",
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
    lastSeen: "12/05/25",
    lastUploaded: "12/05/25",
    status: (i < 1 ? "Pending" : "Completed") as "Pending" | "Completed",
  })),
];

const ScanResultsTable: FC = () => {
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
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default ScanResultsTable;

