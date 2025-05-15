"use client";
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { useQuickSearchQuery } from '@/redux/api/quickSearchApi';
import Loader from '@/utils/loader';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { TbListSearch } from "react-icons/tb";
import { Droppable } from "../_components/dnd/Droppable";
import { ProductCard } from "../_components/ProductCard";
import Overlay from "../_components/dnd/Overlay";
import ProductInformation from "../_components/ProductInformation";
import QuickSearchTable from "../_components/QuickSearchTable";
import { ProductObj, QuickSearchData } from "@/types/goCompare";

export default function QuickDatasult() {
    const params = useSearchParams();
    const pathname = usePathname();
    const asin = params.get('asin') ?? '';
    const country_ids = params.get('country') ?? '';
    const store_names = params.get('stores')?.split(',') || [];
    const queueParam = params.get('queue');
    const queue = queueParam === 'true';

    const [lastQueryParams, setLastQueryParams] = useState({
        asin, country_ids, store_names: store_names.join(','), queue
    });

    const [isRouteChanging, setIsRouteChanging] = useState(false);

    const { data, isLoading, isError, isFetching, error } = useQuickSearchQuery({
        asin, store_names, country_ids, queue
    }, { refetchOnMountOrArgChange: true }) as { data: QuickSearchData | undefined, isLoading: boolean, isError: boolean, isFetching: boolean, error?: any }

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
        const draggedProduct = data?.opportunities.find(
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
            const draggedProduct = data?.opportunities.find(
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
        "Avg. Amazon 90 day price": String(data?.amazon_product?.pricing?.avg_amazon_90_day_price ?? '-'),
        "Gross ROI": selectedProducts.length > 0 ? `${selectedProducts[0]?.roi_percentage.toFixed(1)}%` : '0%',
        "Match quality%": selectedProducts.length > 0 ? `${(selectedProducts[0]?.confidence * 100).toFixed(0)}` : '0',
        "Sales rank": String(data?.amazon_product?.metrics?.sales_rank ?? '-'),
        "Avg. 3 month sales rank": String(data?.amazon_product?.metrics?.avg_3_month_sales_rank ?? '-'),
        ASIN: String(asin ?? '-'),
        "Number of sellers": String(data?.amazon_product?.metrics?.number_of_sellers ?? 'Not available'),
        "Amazon on listing": data?.amazon_product?.metrics?.amazon_on_listing ? 'YES' : 'NO',
    }

    useEffect(() => {
        const currentParams = { asin, country_ids, store_names: store_names.join(','), queue };
        const hasParamsChanged =
            lastQueryParams.asin !== currentParams.asin ||
            lastQueryParams.country_ids !== currentParams.country_ids ||
            lastQueryParams.store_names !== currentParams.store_names ||
            lastQueryParams.queue !== currentParams.queue;

        if (hasParamsChanged) {
            setIsRouteChanging(true);
            setLastQueryParams(currentParams);
        }
    }, [asin, country_ids, store_names, queue, pathname]);

    useEffect(() => {
        if (!isFetching) {
            setIsRouteChanging(false);
        }
    }, [isFetching]);

    useEffect(() => {
        setSelectedProducts([]);
    }, [data?.amazon_product]);

    if (isLoading || isRouteChanging) return <Loader />;
    if (isError) {
        let errorMessage = "Unknown error";
        if (typeof error === "object" && error !== null) {
            if ("data" in error && typeof (error as any).data === "object") {
                errorMessage =
                    (error as any).data?.error ||
                    (error as any).error ||
                    errorMessage;
            } else if ("message" in error) {
                errorMessage = String((error as { message?: string }).message);
            }
        }
        console.error("Quick Search failed:", errorMessage);
        return <div style={{ color: 'red' }}>Error: {errorMessage}</div>;
    }

    return (
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
                            {data?.amazon_product && (
                                <ProductCard product={data?.amazon_product} />
                            )}
                            <Droppable
                                id="droppable-area"
                                className={selectedProducts.length > 0 ? `` : 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-2.5 h-[326px]'}
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
                        products={data?.opportunities || []}
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
    )
}
