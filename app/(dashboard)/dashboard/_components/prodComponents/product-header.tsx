"use client"
import { RxArrowTopRight } from "react-icons/rx"
import { FaGoogle } from "react-icons/fa6"
import Image from "next/image"
import Link from "next/link"
import AmazonIcon from "@/public/assets/svg/amazon-icon.svg"
import ExportToSheetsButton from "@/utils/exportGoogle"
import { Tooltip as AntTooltip } from "antd"
/* eslint-disable @typescript-eslint/no-explicit-any */
interface ProductHeaderProps {
  product: any
  buyboxWinnerPrice: number;
  lowestFBAPrice: number;
  lowestFBMPrice: number;
  monthlySales: number;
  sellerCount: number;
  fbaSellers: number;
  fbmSellers: number;
  stockLevels: number;
}

const ProductHeader = ({ 
  product,
  buyboxWinnerPrice,
  lowestFBAPrice,
  lowestFBMPrice,
  monthlySales,
  sellerCount,
  fbaSellers,
  fbmSellers,
  stockLevels

 }: ProductHeaderProps) => {
  if (!product) return null

  const productLink = product?.amazon_link

  return (
    <div className="flex flex-wrap gap-2 md:gap-4 items-center">
      <AntTooltip title="Tools to help you with product research and analysis" placement="top">
        <p className="font-semibold">Your WorkTools</p>
      </AntTooltip>

      <AntTooltip title="Export this product's information to a Google Sheet for further analysis or record keeping" placement="top">
        <span>
          <ExportToSheetsButton
            productData={{
              asin: product?.asin,
              title: product?.product_name,
              brand: product?.vendor,
              category: product?.category,
              upcEan: product?.upc || product?.ean,
              buyBoxPrice: buyboxWinnerPrice,
          lowestFBAPrice: lowestFBAPrice,
          lowestFBMPrice: lowestFBMPrice,
          monthlySales: monthlySales,
          sellerCount: sellerCount,
          fbaSellers: fbaSellers,
          fbmSellers: fbmSellers,
          stockLevels: stockLevels,
          // Add other fields as needed
            }}
            currencySymbol="$"
          />
        </span>
      </AntTooltip>

      <AntTooltip title="Search Google for suppliers of this product to explore sourcing options" placement="top">
        <button
          type="button"
          onClick={() => {
            const query = encodeURIComponent(`${product?.product_name} supplier`)
            window.open(`https://www.google.com/search?q=${query}`, "_blank")
          }}
          className="border border-border text-primary px-3 py-2 rounded-xl hidden md:flex gap-1 items-center font-semibold hover:bg-gray-50 active:scale-95 duration-200 text-sm md:text-base"
        >
          Find Supplier
          <RxArrowTopRight className="size-5" />
        </button>
      </AntTooltip>

      <AntTooltip title="Search Google for suppliers of this product" placement="top">
        <button
          type="button"
          aria-label="Find Supplier"
          onClick={() => {
            const query = encodeURIComponent(`${product?.product_name} supplier`)
            window.open(`https://www.google.com/search?q=${query}`, "_blank")
          }}
          className="size-12 flex md:hidden items-center justify-center rounded-lg bg-[#F3F4F6]"
        >
          <FaGoogle className="size-6 text-[#0F172A]" />
        </button>
      </AntTooltip>

      <AntTooltip title="View this product on Amazon's website" placement="top">
        <Link
          href={productLink}
          target="_blank"
          className="size-12 flex md:hidden items-center justify-center rounded-lg bg-[#F3F4F6]"
        >
          <Image src={AmazonIcon || "/placeholder.svg"} alt="Amazon icon" width={32} height={32} />
        </Link>
      </AntTooltip>

      <AntTooltip title="Visit the product's Amazon page to see listings, reviews, and more details" placement="top">
        <Link
          href={productLink}
          target="_blank"
          className="border border-border text-primary px-3 py-2 rounded-xl hidden md:flex gap-1 items-center font-semibold hover:bg-gray-50 active:scale-95 duration-200 text-sm md:text-base"
        >
          See this Product on Amazon
          <RxArrowTopRight className="size-5" />
        </Link>
      </AntTooltip>
    </div>
  )
}

export default ProductHeader
