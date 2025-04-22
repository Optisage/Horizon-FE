// "use client";
// import Image from "next/image"
// import walmart from "@/public/assets/svg/gocompare/walmart.svg"
// import butter from "@/public/assets/images/gocompare/butter.png"
// import amazon from "@/public/assets/svg/gocompare/amazon.svg"


// import deckIco from "@/public/assets/svg/gocompare/deck.svg"
// import { useState } from "react"
// import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
// import QuickSearchTable from "./QuickSearchTable"
// import { restrictToWindowEdges } from "@dnd-kit/modifiers"
// import { ProductCard } from "./ProductCard"
// import { Droppable } from "./dnd/Droppable"
// import type { Product } from "./QuickSearchTable"
// import Overlay from "./dnd/Overlay";
// import { TbListSearch } from "react-icons/tb";
// import ProductInformation from "./ProductInformation";

// interface CreateProps {
//   deck: string
// }

// const products = [
//   {
//     id: "1",
//     name: "Peanut Butter Bliss Balls - Healthy Snack Packs, Vegan, 240g, 6 Pouches",
//     image: walmart,
//     store: "walmart",
//     storeLogo: butter,
//     profitMargin: "18%",
//     grossROI: "45%",
//     storePrice: "$12,000",
//     monthlySales: "40",
//     amazonPrice: "$280.00",
//     numberOfSellers: "44",
//     asin: "B09CKUG2J1",
//     avgPrice: "$12.44",
//     avgSalesRank: "107",
//   },
// ]
// const fixedProduct = {
//   id: "1",
//   name: "Peanut Butter Bliss Balls - Healthy Snack Packs, Vegan, 240g, 6 Pouches",
//   storeLogo: butter,
//   storePrice: "$15,000",
//   store: "Walmart",
//   image: amazon,
// }

// const Create = ({ deck }: CreateProps) => {
//   const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
//   const [activeProduct, setActiveProduct] = useState<Product | null>(null)

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 1,
//         tolerance: 5,
//         delay: 0,
//       },
//     }),
//   )

//   const handleDragStart = (event: DragStartEvent) => {
//     console.log("Drag started:", event)
//     const { active } = event
//     const draggedProduct = products.find((product) => product.id === active.id)
//     if (draggedProduct) {
//       setActiveProduct(draggedProduct)
//     }
//   }

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event
//     console.log("Drag ended:", { active, over })
//     setActiveProduct(null)
//     if (over && over.id === "droppable-area") {
//       const draggedProduct = products.find((product) => product.id === active.id)
//       if (draggedProduct && !selectedProducts.some((p) => p.id === draggedProduct.id)) {
//         setSelectedProducts([...selectedProducts, draggedProduct])
//       }
//     }
//   }

//   const handleRowClick = (product: any) => {
//     if (!selectedProducts.some((p) => p.id === product.id)) {
//       setSelectedProducts([...selectedProducts, product])
//     }
//   }

//   const handleRemoveProduct = (productId: string) => {
//     setSelectedProducts(selectedProducts.filter((product) => product.id !== productId))
//   }

//   const productData = {
//     "Avg. Amazon 90 day price": "$12.44",
//     "Gross ROI": "50%",
//     "Match quality%": "35",
//     "Sales rank": "30",
//     "Avg. 3 month sales rank": "107",
//     ASIN: "B08CKLGLZJ",
//     "Number of sellers": "1",
//     "Amazon on listing": "NO",
//   }



//   return (
//     <>
//       {deck === "empty" && (
//         <div className="flex flex-col gap-3 justify-center items-center my-auto">
//           <Image src={deckIco || "/placeholder.svg"} alt="deck icon" />
//           <h1 className="font-medium">Your deck is empty</h1>
//           <p className="text-sm text-[#737379]">Add products to compare deals and find the best opportunities.</p>
//         </div>
//       )}

//       {deck === "quickSearch" && (
//         <DndContext
//           sensors={sensors}
//           onDragEnd={handleDragEnd}
//           onDragStart={handleDragStart}
//           modifiers={[restrictToWindowEdges]}
//         >
//           <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
//             <div className="flex flex-col lg:flex-row gap-6">
//               <div className="flex-1">
//                 <p className="font-semibold">Comparison Workspace</p>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2.5">
//                   <ProductCard product={fixedProduct} />
//                   {selectedProducts.length > 0 ? (
//                     <div className="relative">
//                       <ProductCard product={selectedProducts[0]} />
//                       <button
//                         onClick={() => handleRemoveProduct(selectedProducts[0].id)}
//                         className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 z-10"
//                       >
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="16"
//                           height="16"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         >
//                           <line x1="18" y1="6" x2="6" y2="18"></line>
//                           <line x1="6" y1="6" x2="18" y2="18"></line>
//                         </svg>
//                       </button>
//                     </div>
//                   ) : (
//                     <Droppable
//                       id="droppable-area"
//                       className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-2.5 h-[326px]"
//                     >
//                       <div className="relative h-full bg-gray-100 rounded-lg flex flex-col text-center gap-2 items-center justify-center">
//                         <TbListSearch size={30} className="text-gray-500" />
//                         <p>Drag and drop results here to compare</p>
//                       </div>
//                     </Droppable>
//                   )}
//                 </div>
//               </div>

//               <ProductInformation productData={productData} isSelected={selectedProducts.length > 0 ? true : false} />
//             </div>

//             <div>
//               <h2 className="font-semibold mb-4">Quick Search Results</h2>
//               <QuickSearchTable products={products} onRowClick={handleRowClick} />
//             </div>
//           </section>

//           <DragOverlay>
//             {activeProduct ? (
//               <Overlay activeProduct={activeProduct} />
//             ) : null}
//           </DragOverlay>
//         </DndContext>
//       )}
//     </>
//   )
// }

// export default Create



"use client";
import Image from "next/image"
import deckIco from "@/public/assets/svg/gocompare/deck.svg"
import walmart from "@/public/assets/svg/gocompare/walmart.svg"
import { useState } from "react"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import QuickSearchTable from "./QuickSearchTable"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { ProductCard } from "./ProductCard"
import { Droppable } from "./dnd/Droppable"
import type { Product } from "./QuickSearchTable"
import Overlay from "./dnd/Overlay";
import { TbListSearch } from "react-icons/tb";
import ProductInformation from "./ProductInformation";

interface CreateProps {
  deck: string
  searchRe: {
    amazon_product: any;
    opportunities: Product[];
  },
  asin: string
}

const Create = ({ deck, searchRe, asin }: CreateProps) => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)

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
      if (draggedProduct && !selectedProducts.some((p) => p.scraped_product.id === draggedProduct.scraped_product.id)) {
        setSelectedProducts([...selectedProducts, draggedProduct])
      }
    }
  }

  const handleRowClick = (product: Product) => {
    if (!selectedProducts.some((p) => p.scraped_product.id === product.scraped_product.id)) {
      setSelectedProducts([...selectedProducts, product])
    }
  }

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((product) => product.scraped_product.id !== productId))
    // console.log(selectedProducts, 'll')
  }

  const productData = {
    "Avg. Amazon 90 day price": "$12.44",
    "Gross ROI": selectedProducts ? `${selectedProducts[0]?.roi_percentage.toFixed(1)}%` : 0,
    "Match quality%": selectedProducts ? `${(selectedProducts[0]?.confidence * 100).toFixed(0)}` : 0,
    "Sales rank": "30",
    "Avg. 3 month sales rank": "107",
    ASIN: asin,
    "Number of sellers": "1",
    "Amazon on listing": searchRe?.amazon_product?.seller === 'Amazon Seller' ? 'YES' : 'NO',
  }

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
                  {selectedProducts.length > 0 ? (
                    <div className="relative">
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
                    <Droppable
                      id="droppable-area"
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-2.5 h-[326px]"
                    >
                      <div className="relative h-full bg-gray-100 rounded-lg flex flex-col text-center gap-2 items-center justify-center">
                        <TbListSearch size={30} className="text-gray-500" />
                        <p>Drag and drop results here to compare</p>
                      </div>
                    </Droppable>
                  )}
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