"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react"
import { SearchInput } from "@/app/(dashboard)/_components"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { GoArrowUpRight } from "react-icons/go"
import UFO from "@/public/assets/svg/ufo.svg"
import { useGetSearchHistoryQuery, useSearchProductsHistoryQuery } from "@/redux/api/productsApi"
import { useAppSelector } from "@/redux/hooks"
import CircularLoader from "@/utils/circularLoader"
import SalesStats from "../../dashboard/_components/SalesStats"
import PaginationComponent from "@/utils/paginationNumber"


export interface HistoryProduct {
  asin: string
  upc?: string
  image?: string
  title: string
  rating?: number
  reviews?: number
  category?: string
  timestamp?: string
  searchTerm?: string
  vendor?: string
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Group items by date
const groupByDate = (items: HistoryProduct[]) => {
  const grouped: Record<string, HistoryProduct[]> = {}

  items.forEach((item) => {
    const date = item.timestamp ? new Date(item.timestamp) : new Date()
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let dateKey
    if (date.toDateString() === today.toDateString()) {
      dateKey = "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Yesterday"
    } else {
      dateKey = date.toLocaleDateString()
    }

    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(item)
  })

  return grouped
}

const History = () => {
  const [searchValue, setSearchValue] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [previousPageToken, setPreviousPageToken] = useState<string | null>(null)
  const [currentPageToken, setCurrentPageToken] = useState<string | null>(null)
  const [isPaginationLoading, setIsPaginationLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const router = useRouter()
  const { marketplaceId } = useAppSelector((state) => state?.global)

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text

    const regex = new RegExp(`(${escapeRegExp(search)})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <span key={index} className="bg-green-200">
            {part}
          </span>
        )
      } else {
        return part
      }
    })
  }

  // Debounce input to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue.trim() || "")
    }, 500)
    return () => clearTimeout(handler)
  }, [searchValue])

  // Get search history
  const {
    data: historyData,
    error: historyError,
    isLoading: historyLoading,
  } = useGetSearchHistoryQuery(
    {
      marketplaceId: marketplaceId || "1",
      pageToken: currentPageToken,
    },
    { skip: false },
  )

  // Search products in search history
  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
  } = useSearchProductsHistoryQuery(
    {
      q: debouncedSearch || "",
      marketplaceId: marketplaceId || "1",
      pageToken: currentPageToken,
    },
    { skip: !debouncedSearch },
  )

  // Update pagination tokens and metadata from API response
  useEffect(() => {
    const data = debouncedSearch ? productsData : historyData

    if (data) {
      // Update tokens
      setNextPageToken(data.pagination?.nextPageToken || null)
      setPreviousPageToken(data.pagination?.previousPageToken || null)

      // Update page metadata
      if (data.meta) {
        setCurrentPage(data.meta.current_page || 1)
        setTotalPages(data.meta.last_page || 1)
        setTotalItems(data.meta.total || 0)
        setItemsPerPage(data.meta.per_page || 10)
      }

      // If we have pagination info but not meta (different API format)
      if (data.pagination && data.pagination.number_of_results && !data.meta) {
        setTotalItems(data.pagination.number_of_results)
        // Estimate total pages if not provided
        const estimatedTotalPages = Math.ceil(data.pagination.number_of_results / itemsPerPage)
        setTotalPages(estimatedTotalPages)
      }
    }
  }, [historyData, productsData, debouncedSearch, itemsPerPage])

  // Reset loading states
  useEffect(() => {
    if (historyData || productsData || historyError || productsError) {
      setIsPaginationLoading(false)
    }
  }, [historyData, productsData, historyError, productsError])

  const isLoading = historyLoading || productsLoading
  const error = historyError || productsError

  // Handle page change
  const handlePageChange = (pageToken: string | null) => {
    if (!pageToken) return

    setIsPaginationLoading(true)
    setCurrentPageToken(pageToken)

    // Scroll to the history content area
    const historySection = document.querySelector("section")
    if (historySection) {
      historySection.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Process the search history data based on the response
  const historyItems: HistoryProduct[] = historyData?.data
    ? historyData.data.map((item: any) => ({
        asin: item.asin || "N/A",
        upc: item.upc || "N/A",
        image: item.product_image,
        title: item.product_name || item.search_term || "Unknown search",
        rating: item.rating?.stars || 0,
        reviews: item.rating?.count || 0,
        category: item.category || "N/A",
        timestamp: item.timestamp || new Date().toISOString(),
        vendor: item.vendor,
      }))
    : []

  // Process product data if search is performed
  const productItems: HistoryProduct[] = productsData?.data
    ? productsData.data.map((item: any) => ({
        asin: item.asin || "N/A",
        upc: item.upc || "N/A",
        image: item.product_image,
        title: item.product_name || "Unknown product",
        rating: item.rating?.stars || 0,
        reviews: item.rating?.count || 0,
        category: item.category || "N/A",
        timestamp: item.timestamp || new Date().toISOString(),
        vendor: item.vendor,
      }))
    : []

  // Use products if search is performed, otherwise use history
  const displayItems = debouncedSearch ? productItems : historyItems
  const groupedItems = groupByDate(displayItems)

  const marketplaceMap: Record<string, { name: string; flag: string }> = {
    "1": { name: "US", flag: "us" },
    "6": { name: "Canada", flag: "ca" },
    "11": { name: "Mexico", flag: "mx" },
  }

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      <div className="flex flex-col gap-4">
        <h1 className="text-[#171717] font-medium text-xl md:text-2xl">Search History</h1>

        <SearchInput placeholder="Search your history..." value={searchValue} onChange={setSearchValue} />
      </div>

      {isLoading && !isPaginationLoading && (
        <div className="h-[50dvh] flex justify-center items-center">
          <CircularLoader duration={1000} color="#18CB96" size={64} strokeWidth={4} />
        </div>
      )}

      {error && <div className="text-center text-red-500 mt-4">Failed to load search history.</div>}

      {displayItems.length === 0 && !isLoading && !error && (
        <div className="flex flex-col gap-6 justify-center items-center my-auto">
          <Image
            src={UFO || "/placeholder.svg"}
            alt="No history found"
            className="sm:size-[200px]"
            width={200}
            height={200}
          />
          <span className="text-center space-y-1">
            <h4 className="text-neutral-900 font-bold text-xl md:text-2xl">No search history found</h4>
            <p className="text-[#52525B] text-sm">Your search history will appear here.</p>
          </span>
        </div>
      )}

      {displayItems.length > 0 && (
        <main className="flex flex-col gap-10 justify-between h-full">
          {/* Pagination loading indicator at the top */}
          {isPaginationLoading && (
            <div className="flex justify-center items-center py-16 bg-white rounded-lg border border-border">
              <CircularLoader duration={2000} color="#18CB96" size={64} strokeWidth={4} />
            </div>
          )}

          {/* Content area - hide when pagination loading */}
          {!isPaginationLoading && (
            <div className="p-2 rounded-lg border border-border flex flex-col divide-y divide-[#E4E4E7]">
              {Object.entries(groupedItems).map(([date, items]) => (
                <div key={date} className="flex flex-col">
                  <span className="py-2 text-[#95A4B7] border-b border-gray-50 uppercase font-bold text-sm">
                    {date}
                  </span>

                  {items.map((item, index) => (
                    <div
                      key={`${item.asin}-${index}`}
                      className="hover:bg-gray-50 duration-200 cursor-pointer px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      {item.image ? (
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt="product"
                          className="size-16 rounded-lg object-cover"
                          width={64}
                          height={64}
                          quality={90}
                          priority
                          unoptimized
                        />
                      ) : (
                        <div className="rounded-full size-16 bg-[#F7F7F7] flex items-center justify-center">
                          <GoArrowUpRight className="size-8" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1 text-[#09090B]">
                        <p
                          onClick={() => router.push(`/dashboard/product/${item.asin}`)}
                          className="font-bold hover:underline duration-100"
                        >
                          {highlightText(item.title, debouncedSearch)}
                        </p>
                        {item.rating !== undefined && item.rating > 0 && (
                          <p>
                            {"⭐".repeat(Math.min(item.rating, 5))}{" "}
                            <span className="font-bold">({item.reviews || 0})</span>
                          </p>
                        )}
                        <p className="text-sm">
                          By ASIN: {highlightText(item.asin, debouncedSearch)}, UPC:{" "}
                          {highlightText(item.upc || "N/A", debouncedSearch)}
                        </p>
                        {item.category && (
                          <p className="text-sm">
                            {item.category === "NaN" ? "N/A" : item.category} | <SalesStats product={item} />
                          </p>
                        )}
                        {item.vendor && <p className="text-sm">Store: {item.vendor}</p>}

                        <div className="flex gap-2 items-center">
                          {marketplaceId && marketplaceMap[marketplaceId] && (
                            <p className="text-sm flex items-center gap-2">
                              <Image
                                src={`https://flagcdn.com/w40/${marketplaceMap[marketplaceId].flag}.png`}
                                alt={marketplaceMap[marketplaceId].name}
                                className="w-5 h-auto object-cover"
                                width={20}
                                height={24}
                                quality={90}
                                priority
                                unoptimized
                              />
                              {marketplaceMap[marketplaceId].name}
                            </p>
                          )}

                          <span className="size-2 bg-black rounded-full" />

                          {item.timestamp && (
                            <p className="text-sm">
                              {new Intl.DateTimeFormat("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: "UTC",
                              }).format(new Date(item.timestamp))}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col-reverse md:flex-row sm:gap-4 items-center">
           
            <div className="flex-1 flex justify-center">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                nextPageToken={nextPageToken}
                previousPageToken={previousPageToken}
                onPageChange={handlePageChange}
                isLoading={isPaginationLoading}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
              />
            </div>
          </div>
        </main>
      )}
    </section>
  )
}

export default History
