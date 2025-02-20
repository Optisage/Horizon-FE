import { Pagination, Select } from "antd";

const CustomPagination = () => {
  return (
    <div className="p-4 border-t flex flex-col md:flex-row items-center gap-6 justify-between">
      <p className="text-[#3F3F46]">Page of 1 of 16</p>

      <Pagination defaultCurrent={1} total={50} />

      <Select
        defaultValue="6"
        style={{ width: 142 }}
        options={[
          { value: "6", label: "6 Data per row" },
          { value: "8", label: "8 Data per row" },
          { value: "10", label: "10 Data per row" },
          { value: "20", label: "20 Data per row" },
        ]}
      />
    </div>
  );
};

export default CustomPagination;
