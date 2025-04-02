"use client";
import { useDraggable } from "@dnd-kit/core"
import Image from "next/image"
import { useState } from "react"
import TablePagination from "./TablePagination"

export type Product = {
  id: string
  name: string
  image: any 
  store: string
  storeLogo: any 
  profitMargin: string
  grossROI: string
  storePrice: string
  monthlySales: string
  amazonPrice: string
  numberOfSellers: string
  asin?: string
  avgPrice?: string
  avgSalesRank?: string
}

interface ProductTableProps {
  products: Product[]
  onRowClick: (product: Product) => void
}

function DraggableRow({ product, onRowClick }: { product: Product; onRowClick: (product: Product) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: product.id,
    data: { product },
  })

  const style = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      zIndex: isDragging ? 1000 : 1,
      opacity: isDragging ? 0.5 : 1,
      position: isDragging ? "relative" : ("static" as any),
    }
    : undefined

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onRowClick(product)}
      className={` hover:bg-gray-50 cursor-pointer ${isDragging ? "opacity-50 bg-gray-100" : ""}`}
    >
      <td className="px-4 py-1.5 flex items-center gap-2">
        <div className="w-8 h-8 relative rounded overflow-hidden">
          <Image src={product.storeLogo} alt={product.name} fill className="object-cover" />
        </div>
        <span className="text-sm line-clamp-1">
          {product.name.length > 25 ? `${product.name.slice(0, 25)}...` : product.name}
        </span>
      </td>
      <td className="px-4 py-1.5">
        <div className="w-12 h-12 relative">
          <Image src={product.image} alt={product.store} fill className="object-contain" />
        </div>
      </td>
      <td className="px-4 py-1.5 text-sm">{product.storePrice}</td>
      <td className="px-4 py-1.5 text-sm">{product.amazonPrice}</td>
      <td className="px-4 py-1.5 text-sm">{product.profitMargin}</td>
      <td className="px-4 py-1.5 text-sm">{product.grossROI}</td>
      <td className="px-4 py-1.5 text-sm">{product.monthlySales}</td>
      <td className="px-4 py-1.5 text-sm">{product.numberOfSellers}</td>
    </tr>
  )
}

export default function QuickSearchTable({ products, onRowClick }: ProductTableProps) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const totalPages = Math.ceil(products.length / perPage)
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
      <div className="w-full bg-white rounded-lg ">
        <div className="overflow-x-auto ">
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
                <DraggableRow key={product.id} product={product} onRowClick={onRowClick} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TablePagination page={page} perPage={perPage} totalPages={totalPages} handlePageChange={handlePageChange} handlePerPageChange={handlePerPageChange} />

    </div>
  )
}

