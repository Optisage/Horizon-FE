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
        <div className="flex items-center justify-between px-4 py-3 flex-wrap border-t border-gray-200 pb-16">
            <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
            </div>

            <div className="flex items-center space-x-2">
                <button
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-200 shadow-md hover:bg-gray-100 disabled:text-gray-400 cursor-pointer"
                >
                    <GoChevronLeft className="h-5 w-5" />
                </button>

                {Array.from({ length: endPage - adjustedStartPage + 1 }, (_, i) => {
                    const pageNumber = adjustedStartPage + i;
                    return (
                        <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`h-9 w-9 border-gray-200 rounded-full text-sm flex items-center justify-center ${page === pageNumber ? "bg-green-600 text-white" : "hover:bg-gray-100 border"
                                }`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}

                <button
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-200 shadow-md hover:bg-gray-100 disabled:text-gray-400 cursor-pointer"
                >
                    <GoChevronRight className="h-5 w-5" />
                </button>


            </div>
            <div className="md:flex hidden items-center ml-4 border rounded-md border-gray-300 justify-center px-3 py-1.5 gap-2 shadow-md">
                <GoChevronDown className="pointer-events-none" />
                <select
                    value={perPage}
                    onChange={(e) => handlePerPageChange(Number(e.target.value))}
                    className="focus:outline-none appearance-none text-sm font-medium"
                >
                    <option value={5}>5 Data per row</option>
                    <option value={10}>10 Data per row</option>
                    <option value={20}>20 Data per row</option>
                </select>
            </div>
        </div>
    )
}

export default TablePagination