"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDraggable } from "@dnd-kit/core"
import { useState } from "react"
import TablePagination from "./TablePagination"
import placeholder from '../../../../public/assets/images/gocompare/placeholder.png'
import { ProductObj, QuickSearchResult } from "@/types/goCompare";

interface ProductTableProps {
  products: ProductObj[] | QuickSearchResult[]
  onRowClick: (product: ProductObj | QuickSearchResult) => void
}

function DraggableRow({
  product,
  onRowClick,
  isQuickSearchResult = false,
  rowIndex,
}: {
  product: ProductObj | QuickSearchResult;
  onRowClick: (product: ProductObj | QuickSearchResult) => void;
  isQuickSearchResult?: boolean;
  rowIndex: number;
}) {
  // Handle QuickSearchResult type
  if (isQuickSearchResult) {
    const quickSearchProduct = product as QuickSearchResult;
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: `${quickSearchProduct.store_name}-${quickSearchProduct.asin}-${rowIndex}`,
      data: { 
        product: quickSearchProduct,
        type: 'quickSearchResult'
      },
    });

    const [mouseDownTime, setMouseDownTime] = useState<number | null>(null);

    const handleMouseDown = () => {
      setMouseDownTime(Date.now());
    };

    const handleMouseUp = () => {
      if (mouseDownTime && Date.now() - mouseDownTime < 200) {
        onRowClick(quickSearchProduct);
      }
      setMouseDownTime(null);
    };

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
            <img 
            src={quickSearchProduct.image_url} 
            alt={quickSearchProduct.store_name} 
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/32?text=No+Image";
            }}
          />
          </div>
          <span className="text-sm line-clamp-1">
            {quickSearchProduct.product_name.length > 25
              ? `${quickSearchProduct.product_name.slice(0, 25)}...`
              : quickSearchProduct.product_name}
          </span>
        </td>
        <td className="px-4 py-1.5">
          <div className="w-auto h-auto px-2 py-1 flex items-center">
            <span className="text-sm font-medium">{quickSearchProduct.store_name || 'Unknown Store'}</span>
          </div>
        </td>
        <td className="px-4 py-1.5 text-sm">{quickSearchProduct.profit_margin ? `${quickSearchProduct.profit_margin}%` : 'N/A'}</td>
        <td className="px-4 py-1.5 text-sm">{quickSearchProduct.gross_roi ? `${quickSearchProduct.gross_roi}%` : 'N/A'}</td>
        <td className="px-4 py-1.5 text-sm">{quickSearchProduct.target_fees || 'N/A'}</td>
        <td className="px-4 py-1.5 text-sm">{quickSearchProduct.sales_rank || 'N/A'}</td>
        <td className="px-4 py-1.5 text-sm">{quickSearchProduct.price || quickSearchProduct.buybox_price || 'N/A'}</td>
        <td className="px-4 py-1.5 text-sm">{quickSearchProduct.number_of_sellers || 'N/A'}</td>
      </tr>
    );
  }

  // Handle ProductObj type (existing logic)
  const productObj = product as ProductObj;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: productObj.scraped_product.id,
    data: { 
      product: productObj,
      type: 'productObj' 
    },
  });

  const [mouseDownTime, setMouseDownTime] = useState<number | null>(null);

  const handleMouseDown = () => {
    setMouseDownTime(Date.now());
  };

  const handleMouseUp = () => {
    if (mouseDownTime && Date.now() - mouseDownTime < 200) {
      onRowClick(productObj);
    }
    setMouseDownTime(null);
  };

  const amazonPrice = (productObj.scraped_product.price.amount + productObj.price_difference).toFixed(2);
  const formattedAmazonPrice = `${productObj.scraped_product.price.currency} ${amazonPrice}`;
  const formattedProfitMargin = `${productObj.profit_margin.toFixed(1)}%`;
  const formattedROI = `${productObj.roi_percentage.toFixed(1)}%`;

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
          <img src={productObj.scraped_product?.image_url} alt={productObj.store.name} className="object-cover" />
        </div>
        <span className="text-sm line-clamp-1">
          {productObj.scraped_product.product_name.length > 25
            ? `${productObj.scraped_product.product_name.slice(0, 25)}...`
            : productObj.scraped_product.product_name}
        </span>
      </td>
      <td className="px-4 py-1.5">
        <div className="w-auto h-auto px-2 py-1 flex items-center">
          <span className="text-sm font-medium">{productObj.store?.name || 'Unknown Store'}</span>
        </div>
      </td>
      <td className="px-4 py-1.5 text-sm">{formattedProfitMargin}</td>
      <td className="px-4 py-1.5 text-sm">{formattedROI}</td>
      <td className="px-4 py-1.5 text-sm">{productObj.target_fees || 'N/A'}</td>
      <td className="px-4 py-1.5 text-sm">{productObj.sales_rank || 'N/A'}</td>
      <td className="px-4 py-1.5 text-sm">{productObj.scraped_product.price?.formatted || productObj.buybox_price || 'N/A'}</td>
      <td className="px-4 py-1.5 text-sm">{productObj.number_of_sellers || 'N/A'}</td>
    </tr>
  )
}

export default function QuickSearchTable({ products, onRowClick }: ProductTableProps) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Check if products are QuickSearchResult type
  const isQuickSearchResult = products.length > 0 && 'store_name' in products[0];

  // Sort products (for ProductObj type only)
  const sortedProducts = isQuickSearchResult
    ? products
    : [...(products as ProductObj[])].sort((a, b) => b.roi_percentage - a.roi_percentage)

  const totalPages = Math.ceil(sortedProducts.length / perPage)
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage
  const currentData = sortedProducts.slice(startIndex, endIndex)


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
                <th className="px-4 py-3 text-left font-medium text-gray-600">Profit Margin</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Gross ROI</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Target Fees</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Sales Rank</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">BuyBox Price</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">No. of Sellers</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((product, index) => (
                <DraggableRow
                  key={`${isQuickSearchResult ? `${(product as any).store_name}-${(product as any).asin}` : (product as any).scraped_product.id}-${index}`}
                  product={product}
                  onRowClick={onRowClick}
                  isQuickSearchResult={isQuickSearchResult}
                  rowIndex={index}
                />
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

