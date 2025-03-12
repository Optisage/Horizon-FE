import { Table, Checkbox } from "antd";
import { useEffect, useState } from "react";
import { AiOutlineDownload } from "react-icons/ai";
import { FaFilePdf } from "react-icons/fa";


interface SubscriptionHistoryTableProps {
  tableData: {
   data:{
    data: {
      id: number;
      plan: string;
      date: string;
      amount: string;
      status: string;
    }[];
   }
  };
  loading: boolean;
  convertPrice: (price: string) => string; 
}


interface SubscriptionData {
  key: string;
  invoice: string;
  date: string;
  plan: string;
  amount: string;
}

const SubscriptionHistoryTable: React.FC<SubscriptionHistoryTableProps> = ({ tableData, loading,convertPrice }) => {
  const [data, setData] = useState<SubscriptionData[]>([]);
  const stripCurrencySymbols = (amount: string) => {
    return amount.replace(/[^0-9.-]/g, ""); // Remove all non-numeric characters except `.` and `-`
  };

  useEffect(() => {
    if (tableData?.data) {
      const transformedData = tableData?.data?.data?.map((item) => {
        const strippedAmount = stripCurrencySymbols(item.amount); // Strip currency symbols
        const convertedAmount = strippedAmount ? convertPrice(strippedAmount) : "0.00"; // Convert the stripped amount

        return {
          key: item.id?.toString(),
          invoice: `Invoice ${String(item.id).padStart(4, "0")}`,
          date: item.date,
          plan: item.plan,
          amount: convertedAmount, // Use the converted amount
        };
      });
      setData(transformedData);
    }
  }, [tableData, convertPrice]);

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

 

  return (
    <div className="overflow-x-scroll">
      <Table columns={columns} dataSource={data} pagination={false} loading={loading} />
    </div>
  );
};

export default SubscriptionHistoryTable;
