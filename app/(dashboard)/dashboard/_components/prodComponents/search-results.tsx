"use client"
import { Skeleton } from "antd"
import React from "react"
import Image from "next/image"
import { useSearchItemsQuery } from "@/redux/api/productsApi"
import { CustomPagination } from "@/app/(dashboard)/_components"
import SalesStats from "../SalesStats"
import UFO from "@/public/assets/svg/ufo.svg"
import type { SearchResultItem } from "./types"
import type { NextRouter } from "next/router"
/* eslint-disable @typescript-eslint/no-explicit-any */
interface SearchResultsProps {
  debouncedSearch: string
  marketplaceId: number
  currentPageToken: string | null
  setNextPageToken: (token: string | null) => void
  setPreviousPageToken: (token: string | null) => void
  router: NextRouter | any
  isLoading?: boolean
  onPagination: {
    onNext: () => void
    onPrevious: () => void
    hasNext: boolean
    hasPrevious: boolean
  }
}

interface SearchProduct {
  asin: string
  image: string
  title: string
  rating: number
  reviews: number
  category: string
  vendor: string
  upc?: string
  sales_statistics: any
  buybox_timeline: any
}

const SearchResults = ({
  debouncedSearch,
  marketplaceId,
  currentPageToken,
  setNextPageToken,
  setPreviousPageToken,
  router,
  isLoading,
  onPagination,
}: SearchResultsProps) => {
  const {
    data: searchData,
    error: searchError,
    isLoading: isLoadingSearch,
  } = useSearchItemsQuery(
    debouncedSearch
      ? {
          q: debouncedSearch,
          marketplaceId: marketplaceId,
          pageToken: currentPageToken,
        }
      : undefined,
    { skip: !debouncedSearch },
  )

  // Update pagination tokens from API response
  React.useEffect(() => {
    if (searchData?.data?.pagination) {
      setNextPageToken(searchData.data.pagination.nextPageToken)
      setPreviousPageToken(searchData.data.pagination.previousPageToken)
    }
  }, [searchData, setNextPageToken, setPreviousPageToken])

  // Function to highlight search terms in text
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text

    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    }

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

  const products: SearchProduct[] =
    debouncedSearch && searchData?.data?.items
      ? searchData.data.items.map((item: SearchResultItem) => ({
          asin: item.basic_details.asin,
          image: item.basic_details.product_image,
          title: item.basic_details.product_name,
          rating: item.basic_details.rating.stars,
          reviews: item.basic_details.rating.count,
          category: item.basic_details.category,
          vendor: item.basic_details.vendor,
          upc: item.basic_details.upc,
          sales_statistics: item.sales_statistics,
          buybox_timeline: item.buybox_timeline,
        }))
      : []

  if (isLoading || isLoadingSearch) {
    return <SearchResultsSkeleton />
  }

  if (searchError) {
    return <div className="text-center text-red-500 mt-4">Failed to load products.</div>
  }

  if (searchData?.data?.items?.length === 0) {
    return <NoSearchResults debouncedSearch={debouncedSearch} />
  }

  return (
    <main className="flex flex-col gap-20 justify-between h-full">
      <div className="p-2 rounded-lg border border-border flex flex-col divide-y divide-[#E4E4E7]">
        <span className="bg-[#FAFAFA] px-4 py-3.5">
          <h4 className="text-neutral-900 font-medium text-base md:text-lg">Product</h4>
        </span>

        {products.map((product) => (
          <div
            key={product.asin}
            className="hover:bg-gray-50 duration-200 cursor-pointer px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <Image
              onClick={() => router.push(`/dashboard/product/${product.asin}`)}
              src={product.image || UFO}
              alt="product"
              className="size-16 rounded-lg object-cover"
              width={64}
              height={64}
              quality={90}
              priority
              unoptimized
            />
            <div className="flex flex-col gap-1 text-[#09090B]">
              <p
                onClick={() => router.push(`/dashboard/product/${product.asin}`)}
                className="font-bold hover:underline duration-100"
              >
                {highlightText(product.title, debouncedSearch)}
              </p>
              <p className="text-sm">
                By ASIN: {highlightText(product.asin, debouncedSearch)}, UPC:{" "}
                {highlightText(product.upc || "N/A", debouncedSearch)}
              </p>
              <p className="text-sm">
                {product.category} | <SalesStats product={product} />
              </p>
            </div>
          </div>
        ))}
      </div>

      <CustomPagination
        onNext={onPagination.onNext}
        onPrevious={onPagination.onPrevious}
        hasNext={onPagination.hasNext}
        hasPrevious={onPagination.hasPrevious}
      />
    </main>
  )
}

const SearchResultsSkeleton = () => {
  return (
    <div className="p-2 rounded-lg border border-border flex flex-col divide-y divide-[#E4E4E7]">
      <span className="bg-[#FAFAFA] px-4 py-3.5">
        <h4 className="text-neutral-900 font-medium text-base md:text-lg">Product</h4>
      </span>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4">
          <Skeleton.Image active style={{ width: 64, height: 64 }} />
          <Skeleton active paragraph={{ rows: 2 }} />
        </div>
      ))}
    </div>
  )
}

interface NoSearchResultsProps {
  debouncedSearch: string
}

const NoSearchResults = ({ debouncedSearch }: NoSearchResultsProps) => {
  return (
    <div className="flex flex-col gap-6 justify-center items-center py-16">
      <Image src={UFO || "/placeholder.svg"} alt="UFO" className="sm:size-[200px]" width={200} height={200} />
      <span className="text-center space-y-1">
        <h4 className="text-neutral-900 font-bold text-xl md:text-2xl">
          No products found for &quot;{debouncedSearch}&quot;
        </h4>
        <p className="text-[#52525B] text-sm">Try a different search term.</p>
      </span>
    </div>
  )
}

export default SearchResults
