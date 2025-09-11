"use client";
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { useGetSearchByIdQuery, useQuickSearchQuery, useGetProductDetailsQuery } from '@/redux/api/quickSearchApi';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { TbListSearch } from "react-icons/tb";
import { Droppable } from "../_components/dnd/Droppable";
import { ProductCard } from "../_components/ProductCard";
import Overlay from "../_components/dnd/Overlay";
import ProductInformation from "../_components/ProductInformation";
import QuickSearchTable from "../_components/QuickSearchTable";
import { ProductObj, QuickSearchData, QuickSearchResult } from "@/types/goCompare";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import GoCompareLoader from "../_components/Loader";
import Loader from "@/utils/loader";

export default function QuickSearch() {
    const params = useSearchParams();
    const pathname = usePathname();
    const asin = params.get('asin') ?? '';
    const marketplace_id = params.get('marketplace_id') ? parseInt(params.get('marketplace_id')!) : undefined;
    const queueParam = params.get('queue');
    const queue = queueParam === 'true';
    const searchId = params.get('searchId');

    const [lastQueryParams, setLastQueryParams] = useState({
        asin, marketplace_id, queue
    });

    const [isRouteChanging, setIsRouteChanging] = useState(false);

    const searchByIdResult = useGetSearchByIdQuery(
        { id: searchId ?? '' },
        { skip: !searchId, refetchOnMountOrArgChange: true }
    );

    const quickSearchResult = useQuickSearchQuery(
        { asin, marketplace_id: marketplace_id!, queue },
        { skip: !!searchId || !marketplace_id, refetchOnMountOrArgChange: true }
    );

    type QueryResult = {
        data: QuickSearchResult[] | QuickSearchData | undefined;
        isLoading: boolean;
        isError: boolean;
        isFetching: boolean;
        error?: FetchBaseQueryError | SerializedError;
    };

    const result: QueryResult = searchId ? {
        data: searchByIdResult.data?.data,
        isLoading: searchByIdResult.isLoading,
        isError: searchByIdResult.isError,
        isFetching: searchByIdResult.isFetching,
        error: searchByIdResult.error,
    } : {
        data: quickSearchResult.data?.data,
        isLoading: quickSearchResult.isLoading,
        isError: quickSearchResult.isError,
        isFetching: quickSearchResult.isFetching,
        error: quickSearchResult.error,
    };

    const { data, isLoading, isError, isFetching, error } = result;

    const [selectedProducts, setSelectedProducts] = useState<ProductObj[]>([])
    const [activeProduct, setActiveProduct] = useState<ProductObj | null>(null)
    const [selectedProductDetails, setSelectedProductDetails] = useState<any>(null)

    // Get ASIN for product details API call
    const getSelectedProductAsin = () => {
        if (selectedProducts.length > 0) {
            const product = selectedProducts[0];
            if ('scraped_product' in product) {
                return product.scraped_product.id || product.scraped_product.product_name;
            } else if ('asin' in product) {
                return (product as QuickSearchResult).asin;
            }
        }
        return null;
    };

    const selectedAsin = getSelectedProductAsin();
    const productDetailsResult = useGetProductDetailsQuery(
        { asin: selectedAsin || '', marketplace_id: marketplace_id || 1 },
        { skip: !selectedAsin || !marketplace_id }
    );

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

        // Handle QuickSearchResult[] data structure
        if (Array.isArray(data) && data.length > 0 && 'store_name' in data[0]) {
            const draggedProduct = (data as QuickSearchResult[]).find(
                (product) => `${product.store_name}-${product.asin}` === active.id
            )
            if (draggedProduct) {
                setActiveProduct(draggedProduct as any)
            }
        }
        // Handle old QuickSearchData structure
        else if (data && 'opportunities' in data) {
            const draggedProduct = data.opportunities.find(
                (product) => product.scraped_product.id === active.id
            )
            if (draggedProduct) {
                setActiveProduct(draggedProduct)
            }
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        console.log("Drag ended:", { active, over })
        setActiveProduct(null)
        if (over && over.id === "droppable-area") {
            // Handle QuickSearchResult[] data structure
            if (Array.isArray(data) && data.length > 0 && 'store_name' in data[0]) {
                const draggedProduct = (data as QuickSearchResult[]).find(
                    (product) => `${product.store_name}-${product.asin}` === active.id
                )
                if (draggedProduct) {
                    setSelectedProducts([draggedProduct as any])
                }
            }
            // Handle old QuickSearchData structure
            else if (data && 'opportunities' in data) {
                const draggedProduct = data.opportunities.find(
                    (product) => product.scraped_product.id === active.id
                )
                if (draggedProduct) {
                    setSelectedProducts([draggedProduct])
                }
            }
        }
    }

    const handleRowClick = (product: ProductObj | QuickSearchResult) => {
        setSelectedProducts([product as any])
    }

    const handleRemoveProduct = (productId: string) => {
        setSelectedProducts(selectedProducts.filter((product) => {
            if ('scraped_product' in product) {
                return product.scraped_product.id !== productId;
            } else if ('store_name' in product) {
                return `${(product as QuickSearchResult).store_name}-${(product as QuickSearchResult).asin}` !== productId;
            }
            return true;
        }))
    }

    const productData = {
        "Avg. Amazon 90 day price": selectedProductDetails?.avg_amazon_90_day_price ? `$${selectedProductDetails.avg_amazon_90_day_price.toFixed(2)}` : 'N/A',
        "Gross ROI": selectedProductDetails?.gross_roi ? `${selectedProductDetails.gross_roi.toFixed(1)}%` : '0%',
        "Match quality%": 'N/A',
        "Sales rank": selectedProductDetails?.sales_rank ? String(selectedProductDetails.sales_rank) : 'N/A',
        "Avg. 3 month sales rank": selectedProductDetails?.avg_3_month_sales_rank ? String(selectedProductDetails.avg_3_month_sales_rank) : 'N/A',
        ASIN: selectedProductDetails?.asin || String(asin ?? '-'),
        "Number of sellers": selectedProductDetails?.number_of_sellers ? String(selectedProductDetails.number_of_sellers) : 'N/A',
        "Amazon on listing": selectedProductDetails?.amazon_on_listing !== undefined ? (selectedProductDetails.amazon_on_listing ? 'YES' : 'NO') : 'N/A',
        "Est. Monthly Sales": selectedProductDetails?.estMonthlySales ? String(selectedProductDetails.estMonthlySales) : 'N/A',
        "Amazon Fees": selectedProductDetails?.amazon_fees ? `$${selectedProductDetails.amazon_fees.toFixed(2)}` : 'N/A',
        "Current Price": selectedProductDetails?.current_price ? `$${selectedProductDetails.current_price.toFixed(2)}` : 'N/A'
    }

    useEffect(() => {
        const currentParams = { asin, marketplace_id, queue };
        const hasParamsChanged =
            lastQueryParams.asin !== currentParams.asin ||
            lastQueryParams.marketplace_id !== currentParams.marketplace_id ||
            lastQueryParams.queue !== currentParams.queue;

        if (hasParamsChanged) {
            setIsRouteChanging(true);
            setLastQueryParams(currentParams);
        }
    }, [asin, marketplace_id, queue, pathname]);

    useEffect(() => {
        if (!isFetching) {
            setIsRouteChanging(false);
        }
    }, [isFetching]);

    useEffect(() => {
        setSelectedProducts([]);
        setSelectedProductDetails(null);
    }, [data]);

    // Update product details when API call completes
    useEffect(() => {
        if (productDetailsResult.data && productDetailsResult.data.data) {
            setSelectedProductDetails(productDetailsResult.data.data);
        }
    }, [productDetailsResult.data]);

    if ((isLoading || isRouteChanging) && searchId) return <Loader />;
    if (isLoading || isRouteChanging) {
        return (
            <GoCompareLoader
                asin={asin}
                storeNames={Array.isArray(data) && data.length > 0 && 'store_name' in data[0] ? data.map(item => item.store_name) : []}
                isLoading={isLoading || isRouteChanging}
            />
        );
    }
    if (isError) {
        let errorMessage = "Unknown error";
        if (error && typeof error === 'object') {
            if ('status' in error) {
                if (typeof error.data === 'string') {
                    errorMessage = error.data;
                } else if (typeof error.data === 'object' && error.data !== null) {
                    errorMessage = (error.data as { error?: string })?.error ?? errorMessage;
                }
            } else if ('message' in error) {
                errorMessage = error.message ?? errorMessage;
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
                            {Array.isArray(data) && data.length > 0 && 'store_name' in data[0] ? (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <h3 className="font-medium text-gray-900 mb-2">Search Results for {asin}</h3>
                                    <p className="text-sm text-gray-600">Found {data.length} product(s) across {new Set(data.map(item => item.store_name)).size} store(s)</p>
                                </div>
                            ) : data && 'amazon_product' in data && data.amazon_product ? (
                                <ProductCard product={data.amazon_product} />
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <p className="text-gray-500">No Amazon product data available</p>
                                </div>
                            )}
                            <Droppable
                                id="droppable-area"
                                className={selectedProducts.length > 0 ? `` : 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-2.5 h-[326px]'}
                            >
                                {selectedProducts.length > 0 ? (
                                    <div className="relative h-full">
                                        {selectedProducts[0] && 'scraped_product' in selectedProducts[0] ? (
                                            <ProductCard product={selectedProducts[0]} />
                                        ) : (
                                            <div className="p-4">
                                                <h4 className="font-medium">{(selectedProducts[0] as QuickSearchResult).product_name}</h4>
                                                <p className="text-sm text-gray-600">{(selectedProducts[0] as QuickSearchResult).store_name}</p>
                                                <p className="text-lg font-semibold text-green-600">{(selectedProducts[0] as QuickSearchResult).price}</p>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                const productId = selectedProducts[0] && 'scraped_product' in selectedProducts[0]
                                                    ? selectedProducts[0].scraped_product.id
                                                    : `${(selectedProducts[0] as QuickSearchResult).store_name}-${(selectedProducts[0] as QuickSearchResult).asin}`;
                                                handleRemoveProduct(productId);
                                            }}
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
                        products={Array.isArray(data) && data.length > 0 && 'store_name' in data[0]
                            ? data
                            : (data && 'opportunities' in data ? data.opportunities : [])}
                        onRowClick={handleRowClick}
                    />
                </div>
            </section>

            <DragOverlay>
                {activeProduct && 'scraped_product' in activeProduct ? (
                    <Overlay activeProduct={activeProduct} />
                ) : activeProduct && 'store_name' in activeProduct ? (
                    <div className="p-4 bg-white border rounded-lg shadow-lg">
                        <h4 className="font-medium">{(activeProduct as QuickSearchResult).product_name}</h4>
                        <p className="text-sm text-gray-600">{(activeProduct as QuickSearchResult).store_name}</p>
                        <p className="text-lg font-semibold text-green-600">{(activeProduct as QuickSearchResult).price}</p>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}