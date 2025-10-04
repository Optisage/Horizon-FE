/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import { useGetSearchByIdQuery, useReverseSearchQuery } from '@/redux/api/quickSearchApi';
import { ReverseSearchData } from '@/types/goCompare';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { ProductCard } from '../_components/ProductCard';
import ReverseSearchTable from '../_components/ReverseSearchTable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Droppable } from '../_components/dnd/Droppable';
import { TbListSearch } from 'react-icons/tb';
import Overlay from '../_components/dnd/Overlay';
import ProductInformation from '../_components/ProductInformation';
import GoCompareLoader from '../_components/Loader';
import Loader from '@/utils/loader';

export default function ReverseSearch() {
    const params = useSearchParams();
    const pathname = usePathname();
    const query = params.get('query') ?? '';
    const store = params.get('store') ?? '';
    const searchId = params.get('searchId');

    const [lastQueryParams, setLastQueryParams] = useState({
        query, store
    });

    const [isRouteChanging, setIsRouteChanging] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(300);
    const [sortBy, setSortBy] = useState("roi");
    const [sortOrder, setSortOrder] = useState("desc");

    const searchByIdResult = useGetSearchByIdQuery(
        { id: searchId ?? '' },
        { skip: !searchId, refetchOnMountOrArgChange: true }
    );

    const reverseSearchResult = useReverseSearchQuery(
        { store, queryName: query, perPage, sortBy, sortOrder },
        { skip: !!searchId, refetchOnMountOrArgChange: true }
    );

    type QueryResult = {
        data: ReverseSearchData[] | undefined;
        isLoading: boolean;
        isError: boolean;
        isFetching: boolean;
        error?: FetchBaseQueryError | SerializedError;
    };

    const result: QueryResult = searchId ? {
        data: searchByIdResult?.data?.data?.data,
        isLoading: searchByIdResult.isLoading,
        isError: searchByIdResult.isError,
        isFetching: searchByIdResult.isFetching,
        error: searchByIdResult.error,
    } : {
        data: reverseSearchResult?.data?.data?.data,
        isLoading: reverseSearchResult.isLoading,
        isError: reverseSearchResult.isError,
        isFetching: reverseSearchResult.isFetching,
        error: reverseSearchResult.error,
    };

    const { data, isLoading, isError, isFetching, error } = result;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 1,
                tolerance: 5,
                delay: 0,
            },
        }),
    )

    useEffect(() => {
        const currentParams = { query, store };
        const hasParamsChanged =
            lastQueryParams.query !== currentParams.query ||
            lastQueryParams.store !== currentParams.store

        if (hasParamsChanged) {
            setIsRouteChanging(true);
            setLastQueryParams(currentParams);
        }
    }, [query, store, pathname]);

    useEffect(() => {
        if (!isFetching) {
            setIsRouteChanging(false);
        }
    }, [isFetching]);

    const [selectedProducts, setSelectedProducts] = useState<ReverseSearchData | null>(null);

    const [activeProduct, setActiveProduct] = useState<ReverseSearchData | null>(null)

    const handleRowClick = (product: ReverseSearchData) => {
        setSelectedProducts(product)
    }

    const transformedData: ReverseSearchData[] = (data || [])
        .filter((item): item is ReverseSearchData => item.scraped_product !== null)
        .map((item, index) => {
            const sharedId = item.id;
            return {
                ...item,
                amazon_product: item.amazon_product ? { ...item.amazon_product, id: sharedId } : null,
                scraped_product: { ...item.scraped_product!, id: sharedId },
            };
        });

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;

        const draggedProduct = transformedData.find(item =>
            item.scraped_product?.id === active.id || item.amazon_product?.id === active.id
        );

        if (draggedProduct) {
            setActiveProduct(draggedProduct);
        }

        console.log("Drag started:", draggedProduct);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && over.id === 'droppable-area' && activeProduct) {
            setSelectedProducts(activeProduct);
        }

        setActiveProduct(null);
        console.log("Drag ended:", { active, over });
    };


    const handleRemoveProduct = () => {
        setSelectedProducts(null);
    }

    const productData = {
        "Avg. Amazon 90 day price": String(selectedProducts?.amazon_product?.metrics?.avg_amazon_90_day_price ?? '-'),
        "Gross ROI": typeof selectedProducts?.roi_percentage === 'number' ? `${selectedProducts.roi_percentage.toFixed(1)}%` : '0%',
        "Match quality%": '-',
        "Sales rank": String(selectedProducts?.amazon_product?.metrics?.sales_rank ?? '-'),
        "Avg. 3 month sales rank": String(selectedProducts?.amazon_product?.metrics?.avg_3_month_sales_rank ?? '-'),
        ASIN: String(selectedProducts?.amazon_product?.asin ?? '-'),
        "Number of sellers": String(selectedProducts?.amazon_product?.metrics?.number_of_sellers ?? 'Not available'),
        "Amazon on listing": selectedProducts?.amazon_product?.metrics?.amazon_on_listing ? 'YES' : 'NO',
    };


    useEffect(() => {
        setSelectedProducts(null);
    }, [data]);

    if ((isLoading || isRouteChanging) && searchId) return <Loader />;
    if (isLoading || isRouteChanging) {
        return (
            <GoCompareLoader
                asin={query}
                storeNames={[store]}
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
        console.error("Tactical Reverse Search failed:", errorMessage);
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
                            {selectedProducts && selectedProducts?.amazon_product ? (
                                <ProductCard product={selectedProducts.amazon_product ?? selectedProducts.scraped_product} />
                            ) : (
                                data?.[0]?.amazon_product ? <ProductCard product={data[0].amazon_product} /> :
                                    <div className='flex items-center justify-center border rounded-lg'>{selectedProducts?.reason || data?.[0]?.reason}</div>
                            )}
                            <Droppable
                                id="droppable-area"
                                className={selectedProducts ? `` : 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-2.5 h-[326px]'}
                            >
                                {selectedProducts ? (
                                    <div className="relative h-full">
                                        <ProductCard product={selectedProducts.scraped_product} />
                                        <button
                                            onClick={() => handleRemoveProduct()}
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
                        isSelected={selectedProducts ? true : false}
                    />
                </div>

                <div>
                    <h2 className="font-semibold mb-4">Tactical Reverse Search Results</h2>
                    <ReverseSearchTable
                        products={transformedData || []}
                        onRowClick={handleRowClick}
                    />
                </div>
            </section>

            <DragOverlay>
                {activeProduct ? (
                    <Overlay activeProduct={activeProduct.scraped_product} />
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
