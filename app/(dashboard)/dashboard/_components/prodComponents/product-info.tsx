"use client"
import Image from "next/image"
import { Tooltip as AntTooltip } from "antd"
import ProductThumbnail from "@/public/assets/images/women-shoes.png"
import Illustration from "@/public/assets/svg/illustration.svg"
import AlertsDrawer from "../AlertsDrawer"
/* eslint-disable @typescript-eslint/no-explicit-any */
interface ProductInfoProps {
  product: any
  ipData: any
  eligibility: boolean
  setIpIssue: number
  asin: string
  marketplaceId: number
  isLoading?: boolean
}

const ProductInfo = ({ product, ipData, eligibility, setIpIssue, asin, isLoading }: ProductInfoProps) => {
  if (isLoading || !product) {
    return (
      <div className="border border-border px-4 pt-4 rounded-xl flex flex-col gap-4 h-[300px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="border border-border px-4 pt-4 rounded-xl flex flex-col gap-4">
      <div className="grid xl:grid-cols-[2fr_5fr] gap-3">
        <div className="size-[150px] overflow-hidden rounded-lg">
          <Image
            src={product?.product_image || ProductThumbnail}
            alt="thumbnail"
            className="size-[150px] object-cover"
            width={150}
            height={150}
            quality={90}
            priority
            unoptimized
          />
        </div>

        <div className="text-[#595959]">
          <AntTooltip title="Product name as displayed on Amazon marketplace." placement="top">
            <h2 className="text-[#252525] font-semibold text-lg md:text-xl">{product?.product_name}</h2>
          </AntTooltip>
          <p>{product?.category}</p>
          <p>
            <AntTooltip
              title="Amazon Standard Identification Number - A unique product identifier assigned by Amazon."
              placement="top"
            >
              <span>ASIN: {product?.asin}</span>
            </AntTooltip>
            ,
            <AntTooltip
              title="Universal Product Code - A barcode symbology used for tracking trade items in stores."
              placement="top"
            >
              <span> UPC: {product?.upc}</span>
            </AntTooltip>
          </p>
          <AntTooltip
            title="Average customer rating out of 5 stars. Higher ratings typically indicate better customer satisfaction and product quality."
            placement="top"
          >
            <p>⭐⭐⭐⭐⭐ {product?.rating?.stars}/5</p>
          </AntTooltip>
        </div>
      </div>

      <div className="p-6 bg-[#F5F3FF] rounded-t-lg flex items-center gap-4 justify-between">
        <div className="flex flex-col gap-4">
          <span className="flex flex-col gap-2">
            {eligibility ? (
              <AntTooltip
                title="✅ Great news! You have the necessary permissions to sell this product on Amazon. This means you've met all requirements including brand approval, category restrictions, and gating requirements."
                placement="top"
              >
                <p className="text-green-500 font-semibold cursor-help">
                  You are authorised to sell this product
                </p>
              </AntTooltip>
            ) : (
              <AntTooltip
                title="❌ You cannot sell this product due to restrictions. Common reasons include: Brand approval required, Category gating (need approval for restricted categories), Product safety requirements not met, Professional seller account required, or Geographic restrictions. Check the issues below for specific details."
                placement="top"
              >
                <p className="text-red-500 font-semibold cursor-help">
                  You are not authorized to sell this product
                </p>
              </AntTooltip>
            )}
            <AntTooltip
              title={
                setIpIssue > 0 
                  ? "⚠️ Issues detected that prevent you from selling this product. Click 'View Alerts' below to see detailed information about each issue and potential solutions."
                  : "✅ No restrictions found! This product appears to be available for sale without any known barriers or requirements."
              }
              placement="top"
            >
              <p className={`text-sm cursor-help ${setIpIssue ? "text-red-500" : "text-[#09090B]"}`}>
                {setIpIssue === 1
                  ? "There is 1 issue"
                  : setIpIssue > 1
                    ? `There are ${setIpIssue} issues`
                    : "No issues found"}
              </p>
            </AntTooltip>
          </span>

          <div>
            <AlertsDrawer
              itemAsin={asin}
              productName={product?.product_name}
              eligibility={eligibility}
              ipIssuesCount={setIpIssue}
              ipData={ipData}
            />
          </div>
        </div>

        <div>
          <Image
            src={Illustration || "/placeholder.svg"}
            alt="illustration"
            className="w-[144px] object-cover"
            width={144}
            height={138}
          />
        </div>
      </div>
    </div>
  )
}

export default ProductInfo
