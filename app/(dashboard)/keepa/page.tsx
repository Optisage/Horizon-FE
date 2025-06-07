"use client"

import React from "react"
import { useState } from "react"

import KeepaSearch from "./_components/KeepaSearch"
import KeepaChart from "./_components/KeepaChart"
import KeepaLegend from "./_components/KeepaLegend"

interface ProductData {
  title: string
  asin: string
  category: string
  currentPrice: number
  salesRank: number
}

const mockProduct: ProductData = {
  title: "Women's Fashion Winter Boots - Waterproof & Insulated",
  asin: "B08XYZ123",
  category: "Shoes & Handbags > Women > Shoes > Boots",
  currentPrice: 85.99,
  salesRank: 1234
}

export default function KeepaPage() {
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleProductSearch = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setSelectedProduct(mockProduct)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#01011D]">Keepa Integration</h1>
          <p className="text-[#787891]">Track product prices, sales ranks, and market data</p>
        </div>
      </div>

      <div className="grid gap-6">
        <KeepaSearch 
          onSearch={handleProductSearch}
          isLoading={isLoading}
        />
        {selectedProduct && (
          <KeepaChart 
            product={selectedProduct}
            isLoading={isLoading}
          />
        )}
        <KeepaLegend />
      </div>
    </div>
  )
} 