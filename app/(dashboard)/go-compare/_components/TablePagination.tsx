import { GoChevronDown, GoChevronLeft, GoChevronRight } from "react-icons/go";

interface PaginationProps {
    page: number
    totalPages: number
    perPage: number
    handlePageChange: (page: number) => void
    handlePerPageChange: (value: number) => void
}

const TablePagination = ({ page, totalPages, perPage, handlePageChange, handlePerPageChange }: PaginationProps) => {
    const pagesToShow = 5;
    const startPage = Math.max(1, page - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);
    const adjustedStartPage = Math.max(1, endPage - pagesToShow + 1);

    return (
        <div className="flex items-center justify-center px-4 py-3 flex-wrap border-t border-gray-200 pb-16">
            <div className="flex items-center space-x-2">
                <button
                    disabled={true}
                    className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-200 shadow-md disabled:text-gray-400"
                >
                    <GoChevronLeft className="h-5 w-5" />
                </button>

                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className={`h-9 w-9 border-gray-200 rounded-full text-sm flex items-center justify-center ${page === 1 ? "bg-green-600 text-white" : "hover:bg-gray-100 border"}`}
                >
                    1
                </button>

                <button
                    disabled={true}
                    className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-200 shadow-md disabled:text-gray-400"
                >
                    <GoChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
}

export default TablePagination