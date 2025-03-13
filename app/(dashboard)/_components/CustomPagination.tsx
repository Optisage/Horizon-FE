import { Pagination, Select } from "antd";

interface CustomPaginationProps {
  currentPage: number;
  totalResults: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalResults,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  return (
    <div className="p-4 border-t flex flex-col md:flex-row items-center gap-6 justify-between">
      <p className="text-[#3F3F46]">
        Page {currentPage} of {Math.ceil(totalResults / itemsPerPage) || 1}
      </p>

      <Pagination
        current={currentPage}
        total={totalResults}
        pageSize={itemsPerPage}
        onChange={onPageChange}
      />

      <Select
        value={itemsPerPage.toString()}
        style={{ width: 142 }}
        onChange={(value) => onItemsPerPageChange(Number(value))}
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
