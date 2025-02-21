"use client";

import { useState } from "react";
import { Table } from "antd";

interface Referral {
  key: string;
  name: string;
  storeName: string;
  email: string;
  joinedDate: string;
  status: "Pending" | "Active";
}

const data: Referral[] = [
  {
    key: "1",
    name: "James Brown",
    storeName: "Shophia Williams",
    email: "davido@yahoo.com",
    joinedDate: "23 June 2024",
    status: "Pending",
  },
  {
    key: "2",
    name: "Nahid Ahmed",
    storeName: "Towsif Ahmed",
    email: "davido@yahoo.com",
    joinedDate: "23 June 2024",
    status: "Active",
  },
  {
    key: "3",
    name: "Ahmed Kawser",
    storeName: "Anuwar Hussain",
    email: "davido@yahoo.com",
    joinedDate: "23 June 2024",
    status: "Pending",
  },
  {
    key: "4",
    name: "Tahsan Khan",
    storeName: "Siyam Ahmed",
    email: "davido@yahoo.com",
    joinedDate: "23 June 2024",
    status: "Active",
  },
  {
    key: "5",
    name: "Yahya Ahmed",
    storeName: "Nasum Ahmed",
    email: "davido@yahoo.com",
    joinedDate: "23 June 2024",
    status: "Pending",
  },
  {
    key: "6",
    name: "Rafsan Ahmed",
    storeName: "Muhaymin Ahmed",
    email: "davido@yahoo.com",
    joinedDate: "23 June 2024",
    status: "Pending",
  },
];

// Function to extract initials from Store Name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

// Custom Status Tag Component
const StatusTag = ({ status }: { status: "Pending" | "Active" }) => (
  <span
    className={`px-2.5 py-1 text-xs rounded-full ${
      status === "Active"
        ? "bg-green-50 text-green-500"
        : "bg-red-50 text-red-500"
    }`}
  >
    {status}
  </span>
);

const columns = [
  {
    title: "Referrals Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Store Name",
    dataIndex: "storeName",
    key: "storeName",
    render: (storeName: string) => (
      <div className="flex items-center gap-2">
        <span className="size-8 flex items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">
          {getInitials(storeName)}
        </span>
        <span>{storeName}</span>
      </div>
    ),
  },
  {
    title: "Email Address",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Joined Date",
    dataIndex: "joinedDate",
    key: "joinedDate",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: "Pending" | "Active") => <StatusTag status={status} />,
  },
];

const ReferralTable = () => {
  const [activeTab, setActiveTab] = useState<"all" | "active">("all");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        {/* Tabs */}
        <div className="bg-[#F7F7F7] rounded-[10px] p-1 flex items-center gap-2 w-max">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`text-sm font-medium py-1.5 px-8 lg:px-12 rounded-md border ${
              activeTab === "all"
                ? "border-border bg-white"
                : "border-transparent text-[#787891]"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`text-sm font-medium py-1.5 px-8 lg:px-12 rounded-md border ${
              activeTab === "active"
                ? "border-border bg-white"
                : "border-transparent text-[#787891]"
            }`}
          >
            Active
          </button>
        </div>

        <div className="rounded-xl px-4 py-2 border border-border">
          <p className="text-[#4B4B62] text-sm font-bold">
            Your referral link:{" "}
            <span className="font-normal">https://optisage.ai/?ref=David</span>
          </p>
        </div>
      </div>

      {/* Tab Content */}
      <Table
        columns={columns}
        dataSource={
          activeTab === "all"
            ? data
            : data.filter((item) => item.status === "Active")
        }
        rowSelection={{ type: "checkbox" }}
        pagination={false}
      />
    </div>
  );
};

export default ReferralTable;
