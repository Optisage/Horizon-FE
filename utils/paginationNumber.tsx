"use client"

import { useState, useEffect } from "react"
import { LeftOutlined, RightOutlined } from "@ant-design/icons"

interface PaginationComponentProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading: boolean
  itemsPerPage?: number
  totalItems?: number
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
  itemsPerPage = 10,
  totalItems = 0,
}: PaginationComponentProps) {
  const [pageNumbers, setPageNumbers] = useState<(number | string)[]>([])

  useEffect(() => {
    const calculatePageNumbers = () => {
      const maxPagesToShow = 5;
      const pages: (number | string)[] = [];

      if (totalPages <= maxPagesToShow) {
        // Show all pages if total pages is less than or equal to max
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      // Adjust if we're at the beginning
      if (currentPage <= 3) {
        startPage = 1;
        endPage = maxPagesToShow - 1; // Reserve one spot for last page
      } 
      // Adjust if we're near the end
      else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      }

      // Add page numbers in the current range
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Always add the last page if it's not in the current range
      if (endPage < totalPages) {
        // Add ellipsis if there's a gap between current range and last page
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }

      return pages;
    }

    setPageNumbers(calculatePageNumbers())
  }, [currentPage, totalPages])

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <div className="flex items-center justify-between w-full px-4 py-3 bg-white">
      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || isLoading}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <LeftOutlined className="text-xs" />
          <span>Previous</span>
        </button>

        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || isLoading}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-200"
        >
          <LeftOutlined className="text-xs" />
        </button>

        <div className="flex items-center space-x-1">
          {pageNumbers.map((item, index) => {
            if (typeof item === 'string') {
              return (
                <span 
                  key={`ellipsis-${index}`}
                  className="w-8 h-8 flex items-center justify-center text-gray-400"
                >
                  ...
                </span>
              );
            }
            
            return (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                style={{
                  backgroundColor: item === currentPage ? "#18cb96" : "transparent",
                  color: item === currentPage ? "white" : "#6b7280",
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 border-0 ${
                  item === currentPage ? "shadow-sm" : "hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || isLoading}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-200"
        >
          <RightOutlined className="text-xs" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || isLoading}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span>Next</span>
          <RightOutlined className="text-xs" />
        </button>
      </div>

      <div className="text-sm text-gray-600">{itemsPerPage} per page</div>
    </div>
  )
}