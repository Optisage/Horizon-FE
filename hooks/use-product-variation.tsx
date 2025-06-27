"use client"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export const useProductVariation = (currentAsin: string, marketplaceId: number) => {
  const router = useRouter()

  const handleVariationChange = useCallback(
    (newAsin: string) => {
      if (newAsin === currentAsin) return

      // Navigate to the new URL with the selected variation ASIN in the path
      router.push(`/dashboard/product/${newAsin}`)
    },
    [currentAsin, router],
  )

  return { handleVariationChange }
}
