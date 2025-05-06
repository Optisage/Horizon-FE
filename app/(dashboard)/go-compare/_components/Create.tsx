"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image"
import deckIco from "@/public/assets/svg/gocompare/deck.svg"
import { useEffect, useState } from "react"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import QuickSearchTable, { ProductObj } from "./QuickSearchTable"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { ProductCard } from "./ProductCard"
import { Droppable } from "./dnd/Droppable"
import Overlay from "./dnd/Overlay";
import { TbListSearch } from "react-icons/tb";
import ProductInformation from "./ProductInformation";

interface CreateProps {
  deck: string
  searchRe: {
    amazon_product: any;
    opportunities: ProductObj[];
  },
  asin: string
}

const Create = ({ deck, searchRe, asin }: CreateProps) => {
  const [selectedProducts, setSelectedProducts] = useState<ProductObj[]>([])
  const [activeProduct, setActiveProduct] = useState<ProductObj | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
        tolerance: 5,
        delay: 0,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    console.log("Drag started:", event)
    const { active } = event
    const draggedProduct = searchRe?.opportunities.find(
      (product) => product.scraped_product.id === active.id
    )
    if (draggedProduct) {
      setActiveProduct(draggedProduct)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    console.log("Drag ended:", { active, over })
    setActiveProduct(null)
    if (over && over.id === "droppable-area") {
      const draggedProduct = searchRe?.opportunities.find(
        (product) => product.scraped_product.id === active.id
      )
      if (draggedProduct) {
        setSelectedProducts([draggedProduct])
      }
    }
  }

  const handleRowClick = (product: ProductObj) => {
    setSelectedProducts([product])
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((product) => product.scraped_product.id !== productId))
  }

  const productData = {
    "Avg. Amazon 90 day price": String(searchRe?.amazon_product?.pricing?.avg_amazon_90_day_price ?? '-'),
    "Gross ROI": selectedProducts.length > 0 ? `${selectedProducts[0]?.roi_percentage.toFixed(1)}%` : '0%',
    "Match quality%": selectedProducts.length > 0 ? `${(selectedProducts[0]?.confidence * 100).toFixed(0)}` : '0',
    "Sales rank": String(searchRe?.amazon_product?.metrics?.sales_rank ?? '-'),
    "Avg. 3 month sales rank": String(searchRe?.amazon_product?.metrics?.avg_3_month_sales_rank ?? '-'),
    ASIN: asin,
    "Number of sellers": String(searchRe?.amazon_product?.metrics?.number_of_sellers ?? '-'),
    "Amazon on listing": searchRe?.amazon_product?.metrics?.amazon_on_listing ? 'YES' : 'NO',
  }

  useEffect(() => {
    setSelectedProducts([]);
  }, [searchRe?.amazon_product]);

  return (
    <>
      {deck === "empty" && (
        <div className="flex flex-col gap-3 justify-center items-center my-auto">
          <Image src={deckIco || "/placeholder.svg"} alt="deck icon" />
          <h1 className="font-medium">Your deck is empty</h1>
          <p className="text-sm text-[#737379]">Add products to compare deals and find the best opportunities.</p>
        </div>
      )}

      {deck === "quickSearch" && (
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          modifiers={[restrictToWindowEdges]}
        >
          <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <p className="font-semibold">Comparison Workspace</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2.5">
                  <ProductCard product={searchRe?.amazon_product} />
                  <Droppable
                    id="droppable-area"
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-2.5 h-[326px]"
                  >
                    {selectedProducts.length > 0 ? (
                      <div className="relative h-full">
                        <ProductCard product={selectedProducts[0]} />
                        <button
                          onClick={() => handleRemoveProduct(selectedProducts[0].scraped_product.id)}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 z-10"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="relative h-full bg-gray-100 rounded-lg flex flex-col text-center gap-2 items-center justify-center">
                        <TbListSearch size={30} className="text-gray-500" />
                        <p>Drag and drop results here to compare</p>
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>

              <ProductInformation
                productData={productData}
                isSelected={selectedProducts.length > 0}
              />
            </div>

            <div>
              <h2 className="font-semibold mb-4">Quick Search Results</h2>
              <QuickSearchTable
                products={searchRe?.opportunities || []}
                onRowClick={handleRowClick}
              />
            </div>
          </section>

          <DragOverlay>
            {activeProduct ? (
              <Overlay activeProduct={activeProduct} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </>
  )
}

export default Create