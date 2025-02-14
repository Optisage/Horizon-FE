import { Table, Checkbox } from "antd";
import { AiOutlineDownload } from "react-icons/ai";
import { FaFilePdf } from "react-icons/fa";

const SubscriptionHistoryTable = () => {
  const columns = [
    {
      title: <Checkbox />,
      dataIndex: "checkbox",
      key: "checkbox",
      render: () => <Checkbox />,
    },
    {
      title: "Invoice History",
      dataIndex: "invoice",
      key: "invoice",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <FaFilePdf className="text-lg text-gray-500" />
          <span className="text-gray-600">{text}</span>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "",
      dataIndex: "download",
      key: "download",
      render: () => (
        <AiOutlineDownload className="text-gray-500 text-lg cursor-pointer" />
      ),
    },
  ];

  const data = [
    {
      key: "1",
      invoice: "Invoice 0012",
      date: "28/12/2023",
      plan: "Free",
      amount: "$0",
    },
  ];

  return (
    <div className="overflow-x-scroll">
      <Table columns={columns} dataSource={data} pagination={false} />
    </div>
  );
};

export default SubscriptionHistoryTable;
