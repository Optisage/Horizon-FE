import { GoChevronLeft, GoChevronRight } from "react-icons/go";

interface PaginationProps {
    page: number
    totalPages: number
    perPage?: number
    handlePageChange: (page: number) => void
    handlePerPageChange?: (value: number) => void
}

const TablePagination = ({ page, totalPages, handlePageChange }: PaginationProps) => {
    const pagesToShow = 5;
    const startPage = Math.max(1, page - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);
    const adjustedStartPage = Math.max(1, endPage - pagesToShow + 1);

    // Generate array of page numbers to display
    const pageNumbers = [];
    for (let i = adjustedStartPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex items-center justify-center px-4 py-3 flex-wrap border-t border-gray-200 pb-16">
            <div className="flex items-center space-x-2">
                <button
                    disabled={page <= 1}
                    onClick={() => page > 1 && handlePageChange(page - 1)}
                    className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-200 shadow-md disabled:text-gray-400 enabled:hover:bg-gray-100 enabled:cursor-pointer"
                >
                    <GoChevronLeft className="h-5 w-5" />
                </button>

                {pageNumbers.map(pageNumber => (
                    <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`h-9 w-9 border-gray-200 rounded-full text-sm flex items-center justify-center ${page === pageNumber ? "bg-green-600 text-white" : "hover:bg-gray-100 border"}`}
                    >
                        {pageNumber}
                    </button>
                ))}

                <button
                    disabled={page >= totalPages}
                    onClick={() => page < totalPages && handlePageChange(page + 1)}
                    className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-200 shadow-md disabled:text-gray-400 enabled:hover:bg-gray-100 enabled:cursor-pointer"
                >
                    <GoChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
}

export default TablePagination