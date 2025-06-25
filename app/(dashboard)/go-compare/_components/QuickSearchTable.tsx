"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDraggable } from "@dnd-kit/core"
import { useState } from "react"
import TablePagination from "./TablePagination"
import placeholder from '../../../../public/assets/images/gocompare/placeholder.png'
import { ProductObj } from "@/types/goCompare";

interface ProductTableProps {
  products: ProductObj[]
  onRowClick: (product: ProductObj) => void
}

function DraggableRow({ product, onRowClick }: { product: ProductObj; onRowClick: (product: ProductObj) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: product.scraped_product.id,
    data: { product },
  });

  const [mouseDownTime, setMouseDownTime] = useState<number | null>(null);

  const handleMouseDown = () => {
    setMouseDownTime(Date.now());
  };

  const handleMouseUp = () => {
    if (mouseDownTime && Date.now() - mouseDownTime < 200) {
      onRowClick(product);
    }
    setMouseDownTime(null);
  };

  const amazonPrice = (product.scraped_product.price.amount + product.price_difference).toFixed(2);
  const formattedAmazonPrice = `${product.scraped_product.price.currency} ${amazonPrice}`;
  const formattedProfitMargin = `${product.profit_margin.toFixed(1)}%`;
  const formattedROI = `${product.roi_percentage.toFixed(1)}%`;

  return (
    <tr
      ref={setNodeRef}
      style={
        transform
          ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            zIndex: isDragging ? 1000 : 1,
            opacity: isDragging ? 0.5 : 1,
            position: isDragging ? "relative" : "static" as "static" | "relative",
          }
          : undefined
      }
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`hover:bg-gray-50 cursor-pointer ${isDragging ? "opacity-50 bg-gray-100" : ""}`}
      {...listeners}
      {...attributes}
    >
      <td className="px-4 py-1.5 flex items-center gap-2">
        <div className="w-8 h-8 relative rounded overflow-hidden">
          {/* <Image src={product.scraped_product?.image_url} alt={product.store.name} width={32} height={32} className="object-cover" /> */}
          <img src={product.scraped_product?.image_url} alt={product.store.name} className="object-cover" />
        </div>
        <span className="text-sm line-clamp-1">
          {product.scraped_product.product_name.length > 25
            ? `${product.scraped_product.product_name.slice(0, 25)}...`
            : product.scraped_product.product_name}
        </span>
      </td>
      <td className="px-4 py-1.5">
        <div className="w-12 h-12 relative">
          {product.scraped_product?.store_logo_url ?
            <img src={product.scraped_product?.store_logo_url} alt={product.store.name} className="object-contain w-10 h-10" /> : (
              <img src={placeholder.src} alt={product.store.name} className="object-contain w-10 h-10" />
            )
          }
        </div>
      </td>
      <td className="px-4 py-1.5 text-sm">{product.scraped_product.price.formatted}</td>
      <td className="px-4 py-1.5 text-sm">{formattedAmazonPrice}</td>
      <td className="px-4 py-1.5 text-sm">{formattedProfitMargin}</td>
      <td className="px-4 py-1.5 text-sm">{formattedROI}</td>
      <td className="px-4 py-1.5 text-sm">{product.potential_monthly_sales}</td>
      <td className="px-4 py-1.5 text-sm">N/A</td>
    </tr>
  )
}

export default function QuickSearchTable({ products, onRowClick }: ProductTableProps) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const sortedProducts = [...products].sort((a, b) => b.roi_percentage - a.roi_percentage)
  const totalPages = Math.ceil(sortedProducts.length / perPage)
  // const totalPages = Math.ceil(products.length / perPage)
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage
  const currentData = products.slice(startIndex, endIndex)


  const handlePageChange = (page: number) => {
    setPage(page)
  }

  const handlePerPageChange = (value: number) => {
    setPerPage(value)
    setPage(1)
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="w-full bg-white rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-medium text-gray-600">Product name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Store</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Store Price</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Amazon Price</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Profit Margin</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Gross ROI</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Estimated Monthly Sales</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">No. of Sellers</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((product) => (
                <DraggableRow key={product.scraped_product.id} product={product} onRowClick={onRowClick} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TablePagination
        page={page}
        perPage={perPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        handlePerPageChange={handlePerPageChange}
      />
    </div>
  )
}

