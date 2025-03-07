"use client";

import { CustomPagination } from "../../_components";
import Image from "next/image";
import { useRouter } from "next/navigation";

// import SalesStats from "../../dashboard/_components/SalesStats";
import { RiAttachment2 } from "react-icons/ri";
import {
  useLazyGetSellerDetailsQuery,
  useLazyGetSellerProductsQuery,
} from "@/redux/api/sellerApi";
import { useEffect } from "react";

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

const Seller = () => {
  const router = useRouter();

  const [getSellerDetails, { data, isLoading: detailsLoading }] =
    useLazyGetSellerDetailsQuery();
  const [getSellerProducts, { data: productsData, isLoading: productLoading }] =
    useLazyGetSellerProductsQuery();

  useEffect(() => {
    getSellerDetails({});
    getSellerProducts({});

  }, [getSellerProducts, getSellerDetails]);

  // Extract seller details safely
  const seller = data?.data;
  const products: Product[] = productsData?.data?.items || [];

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
      {detailsLoading && productLoading ? (
        <div className=" mx-auto animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-[3fr_2fr_2fr] gap-6">
            {/* deets */}
            <div className="rounded-lg border border-border p-4 flex flex-col gap-6 lg:h-max">
              {/* max-w-[451px] */}
              <div className="flex items-center gap-4">
                <Image
                  src="https://avatar.iran.liara.run/public/73"
                  alt="Avatar"
                  className="size-[80px] object-cover"
                  width={80}
                  height={80}
                  quality={90}
                  unoptimized
                />

                <div className="flex flex-col gap-4">
                  <span>
                    <h4 className="text-[#020231] text-base font-medium">
                      {seller?.name || "Seller Name"}
                    </h4>
                    <p className="text-[#787891] text-sm">
                      ID: {seller?.id || "N/A"}
                    </p>
                  </span>

                  <span className="flex flex-col lg:flex-row gap-2">
                    <p className="text-black py-1 px-2.5 rounded-full border border-primary text-sm bg-[#0F2E230F]">
                      Rating: {seller?.rating_percentage}% ({seller?.rating})
                    </p>
                    <p className="text-error-500 py-1 px-2.5 rounded-full border border-error-500 text-sm bg-[#FFF5F5]">
                      ASIN Count: {seller?.asin_count || 0}
                    </p>
                  </span>
                </div>
              </div>

              <div className="p-3 border border-border rounded-xl flex gap-3 items-center justify-between">
                <span className="flex items-center gap-3 text-[#787891]">
                  <RiAttachment2 className="size-5" />
                  <p className="text-[#787891] text-sm">
                    {" "}
                    {seller?.amazon_link || "N/A"}
                  </p>
                </span>

                <button type="button" aria-label="Download">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M8.58498 3.40039H7.00063C4.91067 3.40039 3.6001 4.88021 3.6001 6.97444V12.6263C3.6001 14.7206 4.90427 16.2004 7.00063 16.2004H12.9982C15.0952 16.2004 16.4001 14.7206 16.4001 12.6263V11.3883"
                      stroke="#787891"
                      strokeWidth="1.44"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.5957 5.75898V9.20289M10.5957 9.20289H14.0396M10.5957 9.20289L15.9959 3.80273"
                      stroke="#787891"
                      strokeWidth="1.44"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* top brands */}
            <div className="border border-border rounded-xl flex flex-col divide-y divide-[#EDEDED] text-[#252525] text-base">
              <span className="rounded-t-xl py-3 px-5 bg-[#FDFDFD]">
                <h3 className="text-[#252525] font-semibold border-b-2 border-[#252525] w-max">
                  Top Brands
                </h3>
              </span>
              <div className="grid grid-cols-[3fr_2fr] text-center p-3 bg-[#F7F7F7]">
                <span className="">Brand Name</span>
                <span className="">Count</span>
              </div>

              {seller?.top_brands?.map((brand: Brand, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-[3fr_2fr] text-center p-3 hover:bg-gray-50"
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
            <div className="border border-border rounded-xl flex flex-col divide-y divide-[#EDEDED] text-[#252525] text-base">
              <span className="rounded-t-xl py-3 px-5 bg-[#FDFDFD]">
                <h3 className="text-[#252525] font-semibold border-b-2 border-[#252525] w-max">
                  Top Category
                </h3>
              </span>
              <div className="grid grid-cols-[3fr_2fr] text-center p-3 bg-[#F7F7F7]">
                <span className="">Category Name</span>
                <span className="">Count</span>
              </div>
              <div className="">
                {seller?.top_categories?.map((category: Category, index:number) => (
                  <div
                    key={index}
                    className="grid grid-cols-[3fr_2fr] text-center p-3 hover:bg-gray-50"
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
                ))}
              </div>
            </div>
          </div>

          {/* seller's products */}
          <main className="flex flex-col gap-20 justify-between h-full">
            <div className="p-2 rounded-lg border border-border flex flex-col divide-y divide-[#E4E4E7]">
              <span className="bg-[#FAFAFA] px-4 py-3.5">
                <h4 className="text-neutral-900 font-medium text-base md:text-lg">
                  All Kemfit’s Products
                </h4>
              </span>

              {products?.map((product, index) => {
                const { basic_details } = product;
                return (
                  <div
                    key={index}
                    className="hover:bg-gray-50 duration-200 cursor-pointer px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <Image
                      onClick={() =>
                        router.push(`/dashboard/product/${product.id}`)
                      }
                      src={basic_details.product_image}
                      alt={basic_details.product_name}
                      className="size-16 rounded-lg object-cover"
                      width={64}
                      height={64}
                      quality={90}
                      priority
                      unoptimized
                    />
                    <div className="flex flex-col gap-1 text-[#09090B]">
                      <p
                        onClick={() =>
                          router.push(`/dashboard/product/${product.id}`)
                        }
                        className="font-bold hover:underline duration-100"
                      >
                        {basic_details.product_name}
                      </p>
                      <p>
                        {"⭐".repeat(basic_details.rating.stars)}{" "}
                        <span className="font-bold">
                          {basic_details.rating.count} ( reviews)
                        </span>
                      </p>
                      <p className="text-sm">By ASIN: {basic_details.asin}</p>
                      <p className="text-sm">
                        {/* {product.category} | <SalesStats /> */}
                        {basic_details.category} |
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* pagination */}
            <CustomPagination />
          </main>
        </>
      )}
    </section>
  );
};

export default Seller;
