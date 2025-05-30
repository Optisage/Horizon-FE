"use client"

import { useState, useEffect } from "react"
import { LeftOutlined, RightOutlined } from "@ant-design/icons"

interface PaginationComponentProps {
  currentPage: number
  totalPages: number
  nextPageToken: string | null
  previousPageToken: string | null
  onPageChange: (pageToken: string | null) => void
  isLoading: boolean
  itemsPerPage?: number
  totalItems?: number
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  nextPageToken,
  previousPageToken,
  onPageChange,
  isLoading,
  itemsPerPage = 10,
  totalItems = 0,
}: PaginationComponentProps) {
  const [pageNumbers, setPageNumbers] = useState<number[]>([])

  useEffect(() => {
    // Calculate which page numbers to show
    const calculatePageNumbers = () => {
      const pages = []
      const maxPagesToShow = 5

      let startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

      // Adjust start page if end page is maxed out
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1)
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      return pages
    }

    setPageNumbers(calculatePageNumbers())
  }, [currentPage, totalPages])

  // This is a placeholder since we don't have direct page number navigation
  // with token-based pagination
  const handlePageNumberClick = (pageNumber: number) => {
    if (pageNumber === currentPage) return

    // If going forward
    if (pageNumber > currentPage) {
      onPageChange(nextPageToken)
    }
    // If going backward
    else if (pageNumber < currentPage) {
      onPageChange(previousPageToken)
    }
  }

  return (
    <div className="flex items-center justify-between w-full px-4 py-3 bg-white">
      {/* Left side - Page info */}
      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>

      {/* Center - Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(previousPageToken)}
          disabled={!previousPageToken || isLoading}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <LeftOutlined className="text-xs" />
          <span>Previous</span>
        </button>

        {/* Left arrow */}
        <button
          onClick={() => onPageChange(previousPageToken)}
          disabled={!previousPageToken || isLoading}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-200"
        >
          <LeftOutlined className="text-xs" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handlePageNumberClick(pageNumber)}
              style={{
                backgroundColor: pageNumber === currentPage ? " #18cb96" : "transparent",
                color: pageNumber === currentPage ? "white" : "#6b7280",
              }}
              className={` w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 border-0 ${
                pageNumber === currentPage ? "shadow-sm" : "hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => onPageChange(nextPageToken)}
          disabled={!nextPageToken || isLoading}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors duration-200"
        >
          <RightOutlined className="text-xs" />
        </button>

        {/* Next button */}
        <button
          onClick={() => onPageChange(nextPageToken)}
          disabled={!nextPageToken || isLoading}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span>Next</span>
          <RightOutlined className="text-xs" />
        </button>
      </div>

      {/* Right side - Items per page info */}
      <div className="text-sm text-gray-600">{itemsPerPage} per page</div>
    </div>
  )
}
