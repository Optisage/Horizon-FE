"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  useLazyGetSellerDetailsQuery,
  useLazyGetSellerProductsQuery,
} from "@/redux/api/sellerApi";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { message } from "antd";
import CustomPagination from "../../_components/CustomPagination";
import Link from "next/link";

import { FaGoogle } from "react-icons/fa6";
import AmazonIcon from "@/public/assets/svg/amazon-icon.svg";
import { SearchInput } from "@/app/(dashboard)/_components";
import FilterPopup from "./filter-popup";
import { HiOutlineUsers } from "react-icons/hi2";
import { BiChevronDown } from "react-icons/bi";

// Define the Product interface
interface Product {
  id: string;
  basic_details: {
    product_image: string;
    product_name: string;
    rating: {
      stars: number;
      count: number;
    };
    asin: string;
    vendor: string;
    category: string;
  };
}

// Define the Brand interface
interface Brand {
  amazon_link: string;
  brand_name: string;
  count: number;
}

// Define the Category interface
interface Category {
  amazon_link: string;
  category_name: string;
  count: number;
}

// Define the Offer interface
// interface Offer {
//   seller: string;
//   price: string;
//   stock: string;
// }

const Seller = () => {
  const router = useRouter();
  const params = useParams();
  const sellerId = params?.sellerId;
  const { marketplaceId } = useAppSelector((state) => state?.global);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [previousPageToken, setPreviousPageToken] = useState<string | null>(
    null
  );
  const [currentPageToken, setCurrentPageToken] = useState<string | null>(null);
  const [getSellerDetails, { data, isLoading: detailsLoading }] =
    useLazyGetSellerDetailsQuery();
  const [getSellerProducts, { data: productsData, isLoading: productLoading }] =
    useLazyGetSellerProductsQuery();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [messageApi, contextHolder] = message.useMessage();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (sellerId && marketplaceId) {
      getSellerDetails({ seller_id: sellerId, id: marketplaceId });
    }
  }, [sellerId, marketplaceId, getSellerDetails]);

  // Fetch products with pagination (runs when pagination changes)
  useEffect(() => {
    if (sellerId && marketplaceId) {
      setLoading(true);
      getSellerProducts({
        marketplaceId: marketplaceId,
        sellerId: sellerId,
        pageToken: currentPageToken,
      }).finally(() => setLoading(false));
    }
  }, [currentPageToken, sellerId, marketplaceId, getSellerProducts]);

  useEffect(() => {
    if (productsData?.data?.pagination) {
      setNextPageToken(productsData.data.pagination.nextPageToken);
      setPreviousPageToken(productsData.data.pagination.previousPageToken);
    }
  }, [productsData]);

  // Extract seller details safely
  const seller = data?.data;
  const products: Product[] = productsData?.data?.items || [];

  // Mock data for top 5 offers (would be replaced with actual data)
  const mockOffers = [
    { seller: "FBA", price: "$40.00", stock: "20" },
    { seller: "FBM", price: "$49.40", stock: "12" },
    { seller: "FBM", price: "$32.99", stock: "123" },
    { seller: "FBM", price: "$32.99", stock: "123" },
    { seller: "FBM", price: "$32.99", stock: "123" },
  ];

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      {contextHolder}
      {(detailsLoading && productLoading) || loading ? (
        <div className="mx-auto animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      ) : (
        <>
          {/* nav */}
          <div className="rounded-xl border border-border p-4 flex flex-col gap-2">
            <p className="text-[#676A75] text-xs font-medium">Navigation</p>

            <div className="flex items-center gap-4">
              <Link
                href={seller?.google_link || ""}
                className="size-12 flex items-center justify-center rounded-lg bg-[#F3F4F6]"
              >
                <FaGoogle className="size-6 text-[#0F172A]" />
              </Link>

              <Link
                href={seller?.amazon_link || ""}
                target="_blank"
                className="size-12 flex items-center justify-center rounded-lg bg-[#F3F4F6]"
              >
                <Image
                  src={AmazonIcon}
                  alt="Amazon icon"
                  width={32}
                  height={32}
                />
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 gap-y-6">
            {/* store details */}
            <div className="rounded-lg border border-border flex flex-col divide-y divide-[#EDEDED] text-[#252525] text-sm">
              <span className="p-4 border-b border-border mb-2">
                <p className="bg-primary rounded-2xl py-2 px-4 text-white font-semibold w-max">
                  Store Details
                </p>
              </span>
              <span className="p-4 bg-[#F7F7F7] flex justify-between items-center font-medium">
                <p>Seller Name</p>
                <p>{seller?.name || "N/A"}</p>
              </span>
              <span className="p-4 flex justify-between items-center">
                <p>Seller ID</p>
                <p>{seller?.id || "N/A"}</p>
              </span>
              <span className="p-4 bg-[#F7F7F7] flex justify-between items-center">
                <p>Rating</p>
                <p>
                  {seller?.rating_percentage}% ({seller?.rating})
                </p>
              </span>
              <span className="p-4 flex justify-between items-center">
                <p>ASIN Count</p>
                <p>{seller?.asin_count || 0}</p>
              </span>
              <span className="p-4">
                <p className="bg-[#F3F4F6] rounded-lg py-1 px-2">
                  ASIN, brand and category counts are a guide and not exact
                </p>
              </span>
            </div>

            {/* top brands */}
            <div className="rounded-lg border border-border flex flex-col divide-y divide-[#EDEDED] text-[#252525] text-sm">
              <span className="p-4 border-b border-border mb-2">
                <p className="bg-[#F3F4F6] rounded-2xl py-2 px-4 text-[#676A75] font-semibold w-max">
                  Top Brands
                </p>
              </span>
              <span className="flex items-center justify-between p-4 bg-[#F7F7F7] font-medium">
                <p className="">Brand Name</p>
                <p className="">Product Count</p>
              </span>

              {seller?.top_brands?.map((brand: Brand, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <a
                    href={brand.amazon_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {brand.brand_name}
                  </a>
                  <p>{brand.count}</p>
                </div>
              ))}
            </div>

            {/* top category */}
            <div className="rounded-lg border border-border flex flex-col divide-y divide-[#EDEDED] text-[#252525] text-sm">
              <span className="p-4 border-b border-border mb-2">
                <p className="bg-[#F3F4F6] rounded-2xl py-2 px-4 text-[#676A75] font-semibold w-max">
                  Top Categories
                </p>
              </span>
              <span className="flex items-center justify-between p-4 bg-[#F7F7F7] font-medium">
                <p className="">Category Name</p>
                <p className="">Product Count</p>
              </span>
              <div className="">
                {seller?.top_categories?.map(
                  (category: Category, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 hover:bg-gray-50"
                    >
                      <a
                        href={category.amazon_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {category.category_name}
                      </a>
                      <p>{category.count}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="p-2 rounded-lg border border-border flex items-center gap-6">
            <SearchInput
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search for Products on Amazon (For best results use specific keywords, UPC code, ASIN or ISBN code)"
              className="!max-w-[484px]"
            />

            <FilterPopup />
          </div>

          {/* seller's products */}
          <main className="flex flex-col gap-20 justify-between h-full">
            <div className="flex flex-col gap-6">
              {products?.map((product, index) => {
                const basicDetails = product?.basic_details || {};
                // Placeholder data for demonstration purposes
                const productBSR = "22%";
                const estSales = "5k+/mo";
                const maxCost = "C$6.75";
                const offerCount = "7";
                const buyBox = "C$16.75";
                const storeStock = "3";

                return (
                  <div key={index}>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-[3fr_2fr_2fr] xl:grid-cols-[4fr_2fr_2fr] gap-2 gap-y-4">
                      {/* Product Image and Basic Info */}
                      <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-3">
                          <div
                            className="relative w-full max-w-[166px] h-[197px] bg-[#F3F4F6]"
                            onClick={() =>
                              router.push(
                                `/dashboard/product/${basicDetails?.asin}`
                              )
                            }
                          >
                            <Image
                              src={basicDetails.product_image}
                              alt={basicDetails.product_name}
                              className="size-full object-cover cursor-pointer rounded-lg"
                              fill
                              priority
                              quality={90}
                              unoptimized
                            />
                          </div>

                          <div className="flex flex-col gap-1.5 text-[#5B656C]">
                            <div className="flex items-center gap-4">
                              <Link
                                href={seller?.google_link || ""}
                                target="_blank"
                                className="size-12 flex items-center justify-center rounded-lg bg-[#F3F4F6]"
                              >
                                <FaGoogle className="size-6 text-[#0F172A]" />
                              </Link>

                              <Link
                                href={seller?.amazon_link || ""}
                                target="_blank"
                                className="size-12 flex items-center justify-center rounded-lg bg-[#F3F4F6]"
                              >
                                <Image
                                  src={AmazonIcon}
                                  alt="Amazon icon"
                                  width={32}
                                  height={32}
                                />
                              </Link>
                            </div>

                            <p
                              onClick={() =>
                                router.push(
                                  `/dashboard/product/${basicDetails?.asin}`
                                )
                              }
                              className="font-bold hover:underline duration-100 cursor-pointer"
                            >
                              {basicDetails.product_name}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex">
                                {"⭐".repeat(
                                  Math.floor(basicDetails.rating?.stars || 0)
                                )}
                              </div>
                              <span className="text-sm text-gray-600">
                                {basicDetails.rating?.stars}/5
                                {/* ({basicDetails.rating?.count} reviews) */}
                              </span>
                            </div>

                            <p className="text-sm mt-1">
                              ASIN: {basicDetails.asin}
                            </p>
                            <p className="text-sm">
                              Category: {basicDetails.category}
                            </p>
                            <p className="text-lg font-bold mt-2">
                              $
                              {basicDetails.asin
                                ? (
                                    (basicDetails.asin.charCodeAt(0) % 50) +
                                    10
                                  ).toFixed(2)
                                : "40.00"}
                            </p>
                          </div>
                        </div>

                        {/* Product stats */}
                        <div className="text-sm p-3">
                          <div className="bg-[#F3F4F6E0] text-[#596375] text-xs p-2 px-3 rounded-lg flex items-center gap-4 flex-wrap justify-between">
                            <div className="flex flex-col">
                              <span className="text-gray-500">BSR</span>
                              <span className="font-semibold text-[#8E949F] text-sm">
                                {productBSR}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-500">Est. Sales</span>
                              <span className="font-semibold text-[#8E949F] text-sm">
                                {estSales}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-500">Max Cost</span>
                              <span className="font-semibold text-[#8E949F] text-sm">
                                {maxCost}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-gray-500">
                                Offer: {offerCount}
                              </div>
                              <div className="font-semibold flex gap-2">
                                <span className="text-[#FFC56E] bg-white p-1 rounded-lg">
                                  AMZ
                                </span>
                                <span className="text-[#18CB96] bg-white p-1 rounded-lg">
                                  FBA: 5
                                </span>
                                <span className="text-[#FF8551] bg-white p-1 rounded-lg">
                                  FBM: 2
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-500">Buy Box</span>
                              <span className="font-semibold text-[#8E949F] text-sm">
                                {buyBox}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-500">Store Stock</span>
                              <span className="font-semibold text-[#8E949F] text-sm">
                                {storeStock}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Top 5 Offers */}
                      <div className="rounded-xl border border-border overflow-hidden">
                        <div className="p-4">
                          <p className="bg-primary flex items-center gap-1 rounded-2xl py-2 px-4 text-white font-semibold w-max text-xs">
                            <HiOutlineUsers className="size-4" />
                            Top 5 Offers
                          </p>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-[#F7F7F7] text-[#252525]">
                                <th className="p-4 text-left">S/N</th>
                                <th className="p-4 text-left">Seller</th>
                                <th className="p-4 text-left">Price</th>
                                <th className="p-4 text-left">Stock</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mockOffers.map((offer, idx) => (
                                <tr
                                  key={idx}
                                  className="border-t border-gray-100 hover:bg-gray-50"
                                >
                                  <td className="p-4">{idx + 1}</td>
                                  <td className="p-4">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-semibold ${
                                        offer.seller === "FBA"
                                          ? "text-[#FF9B06] bg-[#FDF5E9]"
                                          : "text-[#009F6D] bg-[#EDF7F5]"
                                      }`}
                                    >
                                      {offer.seller}
                                    </span>
                                  </td>
                                  <td className="p-4">{offer.price}</td>
                                  <td className="p-4">{offer.stock}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Keepa Chart */}
                      <div className="rounded-xl border border-border">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
                          <div className="p-4 flex gap-4 justify-between">
                            <p className="bg-[#F3F4F6] rounded-2xl py-2 px-4 text-[#676A75] font-semibold w-max text-xs">
                              Keepa
                            </p>
                            <button
                              type="button"
                              className="bg-primary flex items-center gap-2.5 rounded-2xl py-2 px-3 text-white font-semibold w-max text-xs"
                            >
                              30 days
                              <BiChevronDown className="size-4" />
                            </button>
                          </div>
                          <div className="p-3 relative h-40">
                            <svg
                              viewBox="0 0 300 150"
                              className="w-full h-full"
                            >
                              {/* Price history chart simulation */}
                              <path
                                d="M0,120 C20,100 40,130 60,110 C80,90 100,130 120,100 C140,70 160,110 180,90 C200,70 220,50 240,80 C260,110 280,70 300,60"
                                fill="none"
                                stroke="#FF6B6B"
                                strokeWidth="2"
                              />
                              <path
                                d="M0,80 C20,110 40,90 60,100 C80,110 100,70 120,90 C140,110 160,80 180,100 C200,120 220,90 240,70 C260,50 280,80 300,90"
                                fill="none"
                                stroke="#4ECDC4"
                                strokeWidth="2"
                              />
                              <path
                                d="M0,90 C20,70 40,100 60,80 C80,60 100,90 120,110 C140,130 160,100 180,80 C200,60 220,90 240,110 C260,130 280,100 300,70"
                                fill="none"
                                stroke="#6A67CE"
                                strokeWidth="2"
                              />

                              {/* X-axis labels */}
                              <text
                                x="10"
                                y="145"
                                fontSize="8"
                                textAnchor="middle"
                              >
                                Jan 1
                              </text>
                              <text
                                x="70"
                                y="145"
                                fontSize="8"
                                textAnchor="middle"
                              >
                                Jan 2
                              </text>
                              <text
                                x="130"
                                y="145"
                                fontSize="8"
                                textAnchor="middle"
                              >
                                Jan 3
                              </text>
                              <text
                                x="190"
                                y="145"
                                fontSize="8"
                                textAnchor="middle"
                              >
                                Jan 4
                              </text>
                              <text
                                x="250"
                                y="145"
                                fontSize="8"
                                textAnchor="middle"
                              >
                                Jan 5
                              </text>

                              {/* Price point */}
                              <text
                                x="20"
                                y="20"
                                fontSize="8"
                                textAnchor="start"
                              >
                                $20.00
                              </text>
                            </svg>

                            {/* Legend */}
                            <div className="flex justify-between items-center text-xs mt-2">
                              <div className="flex items-center gap-1">
                                <span className="block w-3 h-3 bg-red-400 rounded-sm"></span>
                                <span>AMAZON</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="block w-3 h-3 bg-emerald-400 rounded-sm"></span>
                                <span>SALES RANK</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="block w-3 h-3 bg-indigo-400 rounded-sm"></span>
                                <span>NEW FBA</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* pagination */}
            <CustomPagination
              onNext={() => setCurrentPageToken(nextPageToken)}
              onPrevious={() => setCurrentPageToken(previousPageToken)}
              hasNext={!!nextPageToken}
              hasPrevious={!!previousPageToken}
            />
          </main>
        </>
      )}
    </section>
  );
};

export default Seller;

