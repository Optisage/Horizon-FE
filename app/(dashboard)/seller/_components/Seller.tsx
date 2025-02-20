"use client";

import { CustomPagination } from "../../_components";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { products } from "../../dashboard/_components/Dashboard";
import SalesStats from "../../dashboard/_components/SalesStats";
import { RiAttachment2 } from "react-icons/ri";

const Seller = () => {
  const router = useRouter();

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
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
            />

            <div className="flex flex-col gap-4">
              <span>
                <h4 className="text-[#020231] text-base font-medium">KEMFIT</h4>
                <p className="text-[#787891] text-sm">ID: A3CPH7ECZ6J7RZ</p>
              </span>

              <span className="flex flex-col lg:flex-row gap-2">
                <p className="text-black py-1 px-2.5 rounded-full border border-primary text-sm bg-[#0F2E230F]">
                  Rating: 91% (1,603)
                </p>
                <p className="text-error-500 py-1 px-2.5 rounded-full border border-error-500 text-sm bg-[#FFF5F5]">
                  ASIN Count: 9
                </p>
              </span>
            </div>
          </div>

          <div className="p-3 border border-border rounded-xl flex gap-3 items-center justify-between">
            <span className="flex items-center gap-3 text-[#787891]">
              <RiAttachment2 className="size-5" />
              <p className="text-[#787891] text-sm">https//amazon.ca/kemfit</p>
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
          <div className="grid grid-cols-[3fr_2fr] text-center p-3 hover:bg-gray-50">
            <p className="underline">Palmer’s</p>
            <p>3</p>
          </div>
          <div className="grid grid-cols-[3fr_2fr] text-center p-3 hover:bg-gray-50">
            <p className="underline">Nivea</p>
            <p>292</p>
          </div>
          <div className="grid grid-cols-[3fr_2fr] text-center p-3 hover:bg-gray-50">
            <p className="underline">Tom Ford</p>
            <p>1000</p>
          </div>
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
          <div className="grid grid-cols-[3fr_2fr] text-center p-3 hover:bg-gray-50">
            <p className="underline">Beauty & Personal Care</p>
            <p>30</p>
          </div>
          <div className="grid grid-cols-[3fr_2fr] text-center p-3 hover:bg-gray-50">
            <p className="underline">Baby</p>
            <p>43</p>
          </div>
          <div className="grid grid-cols-[3fr_2fr] text-center p-3 hover:bg-gray-50">
            <p className="underline">Grocery & Gourmet Food</p>
            <p>2</p>
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

          {products.map((product) => (
            <div
              key={product.id}
              className="hover:bg-gray-50 duration-200 cursor-pointer px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <Image
                onClick={() => router.push(`/dashboard/product/${product.id}`)}
                src={product.image}
                alt="product"
                className="size-16 rounded-lg object-cover"
                width={64}
                height={64}
                quality={90}
                priority
              />
              <div className="flex flex-col gap-1 text-[#09090B]">
                <p
                  onClick={() =>
                    router.push(`/dashboard/product/${product.id}`)
                  }
                  className="font-bold hover:underline duration-100"
                >
                  {product.title}
                </p>
                <p>
                  {"⭐".repeat(product.rating)}{" "}
                  <span className="font-bold">({product.reviews})</span>
                </p>
                <p className="text-sm">By ASIN: {product.asin}</p>
                <p className="text-sm">
                  {product.category} | <SalesStats />
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* pagination */}
        <CustomPagination />
      </main>
    </section>
  );
};

export default Seller;
