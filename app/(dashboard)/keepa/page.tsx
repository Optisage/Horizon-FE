"use client"

import { useState, useEffect, useRef } from "react"
import KeepaSearch from "./_components/KeepaSearch"
import KeepaChart from "./_components/KeepaChart"
import ErrorMessage from "./_components/ErrorMessage"
import { useLazyProductSummaryQuery } from "@/redux/api/keepa"
import { useAppSelector } from "@/redux/hooks"

interface ProductData {
  title: string
  asin: string
  category: string
  currentPrice: number
  salesRank: number
}

export default function KeepaPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null)
  const [currentAsin, setCurrentAsin] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const { marketplaceId } = useAppSelector((state) => state?.global)
  const [isLoading, setIsLoading] = useState(false)
  const initialAsinFetched = useRef(false)
  const [initialAsin, setInitialAsin] = useState<string | null>(null)
  const [getProductSummary, { isLoading: summaryLoading }] = useLazyProductSummaryQuery()

  const handleProductSearch = async (asin: string) => {
    setIsLoading(true)
    setError(null)
    setSelectedProduct(null)
    setCurrentAsin(asin)

    try {
      const summaryResult = await getProductSummary({ asin, id: marketplaceId }).unwrap()

      if (summaryResult?.data?.product_info) {
        const productInfo = summaryResult.data.product_info
        const mockProduct: ProductData = {
          title: productInfo.name || "Product Name",
          asin: productInfo.asin || asin,
          category: summaryResult.data.category_sales_ranks?.[0]?.name || "Unknown Category",
          currentPrice: summaryResult.data.price_range?.current || 0,
          salesRank: summaryResult.data.sales_rank?.current || 0,
        }
        setSelectedProduct(mockProduct)
      } else {
        setError("Product not found or no data available for the provided ASIN. Please check the ASIN and try again.")
      }
    } catch (err) {
      console.error("Error fetching product data:", err)
      setError("Failed to fetch product data. The product may not exist in the selected marketplace, or there was a network issue.")
    } finally {
      setIsLoading(false)
    }
  }

  // Check for ASIN in URL on initial load
  useEffect(() => {
    if (initialAsinFetched.current || !marketplaceId) return

    const queryParams = new URLSearchParams(window.location.search)
    const asinParam = queryParams.get('asin')
    
    if (asinParam) {
      initialAsinFetched.current = true
      setInitialAsin(asinParam) // Set the initial ASIN value
      handleProductSearch(asinParam)
    }
  }, [marketplaceId])


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#01011D]">Keepa</h1>
          <p className="text-[#787891]">Track product prices, sales ranks, and market data</p>
        </div>
      </div>

      <div className="grid gap-6">
         <KeepaSearch 
          onSearch={handleProductSearch} 
          isLoading={isLoading || summaryLoading} 
          initialValue={initialAsin} 
        />
        
        {error && <ErrorMessage message={error} />}
        
        {selectedProduct && !isLoading && !error && (
          <KeepaChart product={selectedProduct} isLoading={isLoading || summaryLoading} asin={currentAsin} />
        )}
      </div>
    </div>
  )
}