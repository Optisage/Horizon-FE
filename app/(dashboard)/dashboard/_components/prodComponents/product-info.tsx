"use client"
import Image from "next/image"
import { Skeleton, Tooltip as AntTooltip } from "antd"
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

const ProductInfo = ({
  product,
  ipData,
  eligibility,
  setIpIssue,
  asin,
  
  isLoading,
}: ProductInfoProps) => {
  if (isLoading || !product) {
    return <ProductInfoSkeleton />
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
            <AntTooltip title="Amazon Standard Identification Number - A unique product identifier assigned by Amazon." placement="top">
              <span>ASIN: {product?.asin}</span>
            </AntTooltip>
            , 
            <AntTooltip title="Universal Product Code - A barcode symbology used for tracking trade items in stores." placement="top">
              <span> UPC: {product?.upc}</span>
            </AntTooltip>
          </p>
          <AntTooltip title="Average customer rating out of 5 stars. Higher ratings typically indicate better customer satisfaction and product quality." placement="top">
          <p>⭐⭐⭐⭐⭐ {product?.rating?.stars}/5</p>
          </AntTooltip>
        </div>
      </div>

      <div className="p-6 bg-[#F5F3FF] rounded-t-lg flex items-center gap-4 justify-between">
        <div className="flex flex-col gap-4">
          <span className="flex flex-col gap-2">
            {eligibility ? (
              <p className="text-green-500 font-semibold">You are authorised to sell this product</p>
            ) : (
              <p className="text-red-500 font-semibold">You are not authorized to sell this product</p>
            )}
            <p className={`text-sm ${setIpIssue ? "text-red-500" : "text-[#09090B]"}`}>
              {setIpIssue === 1
                ? "There is 1 issue"
                : setIpIssue > 1
                  ? `There are ${setIpIssue} issues`
                  : "No issues found"}
            </p>
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

const ProductInfoSkeleton = () => {
  return (
    <div className="border border-border px-4 pt-4 rounded-xl flex flex-col gap-4">
      <div className="grid xl:grid-cols-[2fr_5fr] gap-3">
        <Skeleton.Image active style={{ width: 150, height: 150 }} />
        <div>
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
      </div>
      <Skeleton.Button active size="large" block style={{ height: 120 }} />
    </div>
  )
}

export default ProductInfo
