"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image"
import { Tooltip as AntTooltip, message } from "antd"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import ProductThumbnail from "@/public/assets/images/women-shoes.png"
import Illustration from "@/public/assets/svg/illustration.svg"
import AlertsDrawer from "../AlertsDrawer"
import { CustomSelect } from "@/lib/AntdComponents"
import { useProductVariation } from "@/hooks/use-product-variation"

interface ProductInfoProps {
  product: any
  ipData: any
  eligibility: boolean
  setIpIssue: number
  asin: string
  marketplaceId: number
  isLoading?: boolean
  isLoadingIpData?: boolean
}

const ProductInfo = ({
  product,
  ipData,
  eligibility,
  setIpIssue,
  asin,
  marketplaceId,
  isLoading,
  isLoadingIpData,
}: ProductInfoProps) => {
  const { handleVariationChange } = useProductVariation(asin, marketplaceId)
  const [copiedAsin, setCopiedAsin] = useState(false)
  const [copiedUpc, setCopiedUpc] = useState(false)

  const copyAsinToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(asin)
      setCopiedAsin(true)
      message.success("ASIN copied to clipboard!")
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedAsin(false)
      }, 2000)
    } catch (err) {
      console.error("Failed to copy ASIN: ", err)
      message.error("Failed to copy ASIN")
    }
  }

  const copyUpcToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(product?.upc)
      setCopiedUpc(true)
      message.success("UPC copied to clipboard!")
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedUpc(false)
      }, 2000)
    } catch (err) {
      console.error("Failed to copy UPC: ", err)
      message.error("Failed to copy UPC")
    }
  }

  if (isLoading || !product) {
    return (
      <div className="border border-border px-4 pt-4 rounded-xl flex flex-col gap-4 h-[300px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Generate options for the select dropdown
  const variationOptions =
    product?.variations?.map((variation: any) => {
      const attributeLabels = variation.attributes.map((attr: any) => `${attr.dimension}: ${attr.value}`).join(", ")

      return {
        value: variation.asin,
        label: attributeLabels || variation.asin,
      }
    }) || []

  // Find current variation to show its attributes
  //const currentVariation = product?.variations?.find((v: any) => v.asin === asin)
  //const currentAttributes = currentVariation?.attributes || []

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

          {/* Enhanced variation dropdown */}
          {product?.variations?.length > 0 && (
            <div className="my-3">
             
              <CustomSelect
                value={asin}
                onChange={handleVariationChange}
                options={variationOptions}
                style={{ width: "100%", maxWidth: 300, borderRadius: 8 }}
                placeholder="Select a variation"
                loading={isLoading}
                
              />
            </div>
          )}

          <p className=" text-base text-gray-600  mb-2">{product?.category}</p>
          <p className="text-base flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <AntTooltip
                title="Amazon Standard Identification Number - A unique product identifier assigned by Amazon."
                placement="top"
              >
                <span className="cursor-help border-b border-dotted border-gray-400">ASIN: {product?.asin}</span>
              </AntTooltip>
              
              <AntTooltip title="Copy ASIN to clipboard" placement="top">
                <button
                  onClick={copyAsinToClipboard}
                  className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 transition-colors duration-200 group"
                  aria-label="Copy ASIN"
                >
                  {copiedAsin ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                  )}
                </button>
              </AntTooltip>
            </div>
            
            {product?.upc && (
              <>
                <span>,</span>
                <div className="flex items-center gap-2">
                  <AntTooltip
                    title="Universal Product Code - A barcode symbology used for tracking trade items in stores."
                    placement="top"
                  >
                    <span className="cursor-help border-b border-dotted border-gray-400">UPC: {product?.upc}</span>
                  </AntTooltip>
                  
                  <AntTooltip title="Copy UPC to clipboard" placement="top">
                    <button
                      onClick={copyUpcToClipboard}
                      className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 transition-colors duration-200 group"
                      aria-label="Copy UPC"
                    >
                      {copiedUpc ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                      )}
                    </button>
                  </AntTooltip>
                </div>
              </>
            )}
          </p>

          {product?.rating && (
            <AntTooltip
              title="Average customer rating out of 5 stars. Higher ratings typically indicate better customer satisfaction and product quality."
              placement="top"
            >
              <p className="flex items-center gap-1">
                <span className="text-yellow-400">⭐</span>
                <span>{product.rating.stars}/5</span>
                <span className="text-sm text-gray-500">({product.rating.count?.toLocaleString()} reviews)</span>
              </p>
            </AntTooltip>
          )}
        </div>
      </div>

      <div className="p-6 bg-[#F5F3FF] rounded-t-lg flex items-center gap-4 justify-between">
        {isLoadingIpData ? (
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
              <span className="text-gray-600 font-medium">Analyzing IP Alert data...</span>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-md animate-pulse w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded-md animate-pulse w-1/2"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-32"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <span className="flex flex-col gap-2">
              {eligibility ? (
                <AntTooltip
                  title="✅ You can list and sell this product! You have the necessary approvals and this product is not restricted (GATED) for your seller account."
                  placement="top"
                >
                  <p className="text-green-500 font-semibold cursor-help">You are authorised to sell this product</p>
                </AntTooltip>
              ) : (
                <AntTooltip
                  title="❌ You can't list or sell this product yet because it's restricted (GATED) by the brand or category. You'll need approval first."
                  placement="top"
                >
                  <p className="text-red-500 font-semibold cursor-help">You are not authorized to sell this product</p>
                </AntTooltip>
              )}
              <AntTooltip
                title={
                  setIpIssue > 0
                    ? "⚠️ Issues detected that prevent you from selling this product. Click 'View Alerts' below to see detailed information about each issue and potential solutions."
                    : "✅ No restrictions found!"
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
        )}

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