"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { Tooltip as Tooltip2 } from "antd"
import { HiOutlineUsers } from "react-icons/hi"
import { MdOutlineInsertChartOutlined } from "react-icons/md"
import { ImSpinner9 } from "react-icons/im"
import { useGetBuyboxDetailsQuery } from "@/redux/api/productsApi"
import type { BuyboxItem } from "./types"
import type { NextRouter } from "next/router"

interface OffersSectionProps {
  asin: string
  marketplaceId: number
  router: NextRouter | any
  isLoading?: boolean
}

const OffersSection = ({ asin, marketplaceId, router, isLoading }: OffersSectionProps) => {
  const [activeTab, setActiveTab] = useState("offers")
  const [itemsToShow, setItemsToShow] = useState(10)
  const [loading, setLoading] = useState(false)

  const { data: buyboxDetailsData } = useGetBuyboxDetailsQuery({
    marketplaceId,
    itemAsin: asin,
  })

  const buyboxDetails = (buyboxDetailsData?.data?.buybox as BuyboxItem[]) ?? []

  // Sort buyboxDetails by price in ascending order
  const sortedBuyboxDetails = [...buyboxDetails].sort((a, b) => a.listing_price - b.listing_price)

  const offersData = {
    offers: sortedBuyboxDetails.map((offer, index) => ({
      id: index + 1,
      seller: offer.seller || "N/A",
      rating: offer.rating || "N/A",
      review_count: offer.review_count || "N/A",
      stock: offer.stock_quantity || "N/A",
      price: offer.listing_price ? `${offer.listing_price.toFixed(2)}` : "N/A",
      buyboxShare: offer.weight_percentage != null ? `${offer.weight_percentage}%` : "N/A",
      leader: offer.is_buybox_winner || false,
      seller_id: offer.seller_id || "N/A",
      seller_type: offer.seller_type || "N/A",
    })),
  }

  const sellerFeedbackData = sortedBuyboxDetails.map((seller, index) => ({
    id: index + 1,
    seller: seller.seller,
    rating: seller.rating,
    review_count: seller.review_count,
    sellerId: seller.seller_id,
    seller_type: seller.seller_type,
    avgPrice: `${seller.seller_feedback?.avg_price?.toFixed(2) ?? "N/A"}`,
    won: `${seller.seller_feedback?.percentage_won ?? 0}%`,
    lastWon: seller.seller_feedback?.last_won ? new Date(seller.seller_feedback.last_won).toLocaleString() : "N/A",
  }))

  const displayedOffers = offersData.offers.slice(0, itemsToShow)
  const displayedFeedback = sellerFeedbackData.slice(0, itemsToShow)
  const fbaCount = offersData.offers.filter((o) => o.seller_type === "FBA").length
  const fbmCount = offersData.offers.filter((o) => o.seller_type === "FBM").length
  const amzCount = offersData.offers.filter((o) => o.seller_type === "AMZ").length

  
  const handleLoadMore = () => {
    setLoading(true)
    setTimeout(() => {
      setItemsToShow(itemsToShow + 10)
      setLoading(false)
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="border border-border flex flex-col rounded-xl max-h-[375px] overflow-x-auto w-full p-6">
        <div className="h-full flex items-center justify-center">
          <ImSpinner9 className="animate-spin size-8 text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border flex flex-col rounded-xl max-h-[375px] overflow-x-auto w-full">
      <div className="flex items-center gap-x-8 gap-y-3 flex-wrap p-3">
        <div className="flex items-center gap-6 font-semibold text-gray-700">
          <button
            type="button"
            className={`text-lg flex gap-1 items-center border-b-2 ${
              activeTab === "offers" ? "border-black" : "border-transparent"
            }`}
            onClick={() => setActiveTab("offers")}
          >
            <HiOutlineUsers className="size-5" /> Offers
          </button>
          <button
            type="button"
            className={`text-lg flex gap-1 items-center border-b-2 ${
              activeTab === "feedback" ? "border-black" : "border-transparent"
            }`}
            onClick={() => setActiveTab("feedback")}
          >
            <MdOutlineInsertChartOutlined className="size-5" /> Seller Feedback
          </button>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="size-2 rounded-sm bg-black" />
            <Tooltip2 title="Fulfillment by Amazon - Products stored, packed and shipped by Amazon" placement="top">
              <span>FBA</span>
            </Tooltip2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="size-2 rounded-sm bg-[#00E4E4]" />
            <Tooltip2 title="Fulfillment by Merchant - Products shipped directly by the seller" placement="top">
              <span>FBM</span>
            </Tooltip2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="size-2 rounded-sm bg-orange-400" />
            <Tooltip2 title="Sold directly by Amazon as the retailer" placement="top">
              <span>AMZ</span>
            </Tooltip2>
          </div>
        </div>
      </div>

      {activeTab === "offers" ? (
        <>
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left bg-[#F7F7F7]">
                  <th className="p-3">S/N</th>
                  <th className="p-3">Seller</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Buybox Share</th>
                </tr>
              </thead>
              <tbody>
                {displayedOffers.length > 0 ? (
                  displayedOffers.map((offer) => (
                    <tr key={offer.id} className="border-b">
                      <td className="p-3">{offer.id}</td>
                      <td className="py-3">
                        <Tooltip2 title={`Rating: ${offer.rating} (${offer.review_count})`} placement="topLeft">
                          <div
                            onClick={() => router.push(`/seller/${offer.seller_id}`)}
                            className="cursor-pointer flex flex-col gap-0.5 flex-grow"
                          >
                            <span className="flex items-center gap-1">
                              <span
                                className={`size-2 rounded-sm ${
                                  offer.seller_type === "FBA"
                                    ? "bg-black"
                                    : offer.seller_type === "FBM"
                                      ? "bg-[#00E4E4]"
                                      : "bg-orange-400"
                                }`}
                              />
                              <p className="truncate">{offer.seller}</p>
                            </span>
                            {offer.leader && <span className="text-xs text-primary block">BuyBox Leader</span>}
                          </div>
                        </Tooltip2>
                      </td>
                      <td className="p-3">
                        <Tooltip2 title={`Current available inventory quantity: ${offer.stock} units`} placement="top">
                          <span>{offer.stock}</span>
                        </Tooltip2>
                      </td>
                      <td className="p-3">
                        <Tooltip2 title={`Current listing price: $${offer.price}`} placement="top">
                          <span>${offer.price}</span>
                        </Tooltip2>
                      </td>
                      <td className="px-3 py-4 flex gap-1 items-center h-full">
                        <Tooltip2
                          title={`This seller wins the Buy Box position ${offer.buyboxShare} of the time`}
                          placement="top"
                        >
                          <span>{offer.buyboxShare}</span>
                        </Tooltip2>
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-green-500 rounded-full"
                            style={{
                              width: offer.buyboxShare && offer.buyboxShare !== "N/A" ? offer.buyboxShare : "0",
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-3 py-8 text-center text-gray-500">
                      No offers available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* offers count */}
          <div className="p-3 flex gap-2 justify-between items-center w-full">
            <Tooltip2
              title={`Total number of sellers offering this product: ${offersData.offers.length || 0}`}
              placement="top"
            >
              <span>Total Offers: {offersData.offers.length || 0}</span>
            </Tooltip2>
            <span>
              <Tooltip2 title="Number of Fulfillment by Amazon offers" placement="top">
                <span>FBA: {fbaCount}</span>
              </Tooltip2>{" "}
              <Tooltip2 title="Number of Fulfillment by Merchant offers" placement="top">
                <span>FBM: {fbmCount}</span>
              </Tooltip2>{" "}
              <Tooltip2 title="Number of direct Amazon offers" placement="top">
                <span>AMZ: {amzCount}</span>
              </Tooltip2>
            </span>
          </div>
          {offersData.offers.length > itemsToShow && (
            <button
              onClick={handleLoadMore}
              className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <ImSpinner9 className="animate-spin size-5" />
                </>
              ) : (
                "Load More"
              )}
            </button>
          )}
        </>
      ) : (
        <>
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left bg-[#F7F7F7]">
                  <th className="p-3">S/N</th>
                  <th className="p-3">Seller</th>
                  <th className="p-3">Avg. Price</th>
                  <th className="p-3">Won</th>
                  <th className="p-3">Last Won</th>
                </tr>
              </thead>
              <tbody>
                {displayedFeedback.length > 0 ? (
                  displayedFeedback.map((seller) => (
                    <tr key={seller.id} className="border-b">
                      <td className="p-3">{seller.id}</td>
                      <td className="p-3">
                        <Tooltip2 title={`Rating: ${seller.rating} (${seller.review_count})`} placement="topLeft">
                          <div
                            onClick={() => router.push(`/seller/${seller.sellerId}`)}
                            className="cursor-pointer flex flex-col"
                          >
                            <span className="flex items-center gap-1">
                              <span
                                className={`size-2 rounded-sm ${
                                  seller.seller_type === "FBA"
                                    ? "bg-black"
                                    : seller.seller_type === "FBM"
                                      ? "bg-[#00E4E4]"
                                      : "bg-orange-400"
                                }`}
                              />
                              <p className="truncate">{seller.seller}</p>
                            </span>
                          </div>
                        </Tooltip2>
                      </td>
                      <td className="p-3">
                        <Tooltip2 title={`Average listing price: $${seller.avgPrice}`} placement="top">
                          <span>${seller.avgPrice}</span>
                        </Tooltip2>
                      </td>
                      <td className="p-3">
                        <Tooltip2 title={`Percentage of time won the Buy Box: ${seller.won}`} placement="top">
                          <span>{seller.won}</span>
                        </Tooltip2>
                      </td>
                      <td className="p-3">
                        <Tooltip2 title={`Last won the Buy Box on: ${seller.lastWon}`} placement="top">
                          <span>{seller.lastWon}</span>
                        </Tooltip2>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-3 py-8 text-center text-gray-500">
                      No seller feedback available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default OffersSection
