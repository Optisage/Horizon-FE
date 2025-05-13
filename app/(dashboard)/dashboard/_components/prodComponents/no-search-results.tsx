"use client"
import Image from "next/image"
import UFO from "@/public/assets/svg/ufo.svg"

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

export default NoSearchResults
