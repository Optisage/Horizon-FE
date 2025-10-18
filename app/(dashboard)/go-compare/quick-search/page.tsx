"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { useGetSearchByIdQuery, useQuickSearchQuery, useGetComparisonProductDetailsQuery, useGetProductDetailsQuery } from '@/redux/api/quickSearchApi';
import Image from "next/image";
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { TbListSearch } from "react-icons/tb";
import { Droppable } from "../_components/dnd/Droppable";
import { ProductCard } from "../_components/ProductCard";
import SimpleProductCard from "../_components/SimpleProductCard";
import Overlay from "../_components/dnd/Overlay";
import ProductInformation from "../_components/ProductInformation";
import QuickSearchTable from "../_components/QuickSearchTable";
import { ProductObj, QuickSearchData, QuickSearchResult } from "@/types/goCompare";
// Ensure we're using the latest type definitions
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
    
    // Create a reference to the Comparison Workspace section
    const comparisonWorkspaceRef = useRef<HTMLDivElement>(null);

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
        data: QuickSearchResult[] | QuickSearchData | { results: QuickSearchResult[] } | undefined;
        isLoading: boolean;
        isError: boolean;
        isFetching: boolean;
        error?: FetchBaseQueryError | SerializedError;
    };

    // Log the raw API response for debugging (only in development)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            if (quickSearchResult.data) {
                console.log("Quick Search API Response:", quickSearchResult.data);
            }
            if (searchByIdResult.data) {
                console.log("Search By ID API Response:", searchByIdResult.data);
            }
        }
    }, [quickSearchResult.data, searchByIdResult.data]);

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
    const [selectedAsin, setSelectedAsin] = useState<string | null>(null)
    const [selectedSalesPrice, setSelectedSalesPrice] = useState<string | null>(null)
    
    // Transform products data with memoization to prevent unnecessary recalculations
    const transformedProducts = useMemo(() => {
        // Handle QuickSearchResult type
        let quickSearchResults: QuickSearchResult[] = [];
        let productObjs: ProductObj[] = [];
        
        // Determine which data structure we're working with
        if (Array.isArray(data) && data.length > 0) {
            if ('store_name' in data[0]) {
                // It's a QuickSearchResult array
                quickSearchResults = data as QuickSearchResult[];
            } else if ('scraped_product' in data[0]) {
                // It's a ProductObj array
                // Use type assertion with unknown as intermediate step
                productObjs = (data as unknown) as ProductObj[];
            }
        } else if (data && 'results' in data) {
            quickSearchResults = data.results as QuickSearchResult[];
        } else if (data && 'opportunities' in data) {
            productObjs = data.opportunities as ProductObj[];
        }
        
        // If amazon_price exists at the top level of data, add it to each QuickSearchResult
        if (data && 'amazon_price' in data && quickSearchResults.length > 0) {
            quickSearchResults = quickSearchResults.map(product => ({
                ...product,
                amazon_price: String(data.amazon_price) // Ensure it's a string
            }));
        }
        
        // Return the appropriate array based on which one has data
        return quickSearchResults.length > 0 ? quickSearchResults : productObjs;
    }, [data]);


    // Get ASIN for product details API call
    // Log the values being sent to the query only in development
    if (process.env.NODE_ENV === 'development') {
        console.log("Selected ASIN:", selectedAsin);
        console.log("Marketplace ID:", marketplace_id);
        console.log("Selected Sales Price:", selectedSalesPrice);
    }

    // Left Container API - Amazon Product Details
    const amazonProductDetailsResult = useGetProductDetailsQuery(
        { asin: selectedAsin || asin || '', marketplace_id: marketplace_id || 1 },
        { skip: (!selectedAsin && !asin) || !marketplace_id }
    );

    // Right Container API - Comparison Product Details (when needed)
    const comparisonProductDetailsResult = useGetComparisonProductDetailsQuery(
        { asin: selectedAsin || asin || '', marketplace_id: marketplace_id || 1, sales_price: selectedSalesPrice || undefined },
        { skip: (!selectedAsin && !asin) || !marketplace_id || !selectedSalesPrice }
    );
    
    // Log the product details response for debugging
    useEffect(() => {
        if (amazonProductDetailsResult.data && process.env.NODE_ENV === 'development') {
            console.log("Amazon Product details response:", amazonProductDetailsResult.data);
            console.log("Amazon Product current_price:", amazonProductDetailsResult.data.data?.current_price);
            console.log("Amazon Product data structure:", amazonProductDetailsResult.data.data);
        }
        if (amazonProductDetailsResult.error) {
            console.error("Amazon Product details error:", amazonProductDetailsResult.error);
        }
        if (comparisonProductDetailsResult.data && process.env.NODE_ENV === 'development') {
            console.log("Comparison Product details response:", comparisonProductDetailsResult.data);
        }
        if (comparisonProductDetailsResult.error) {
            console.error("Comparison Product details error:", comparisonProductDetailsResult.error);
        }
    }, [amazonProductDetailsResult.data, amazonProductDetailsResult.error, comparisonProductDetailsResult.data, comparisonProductDetailsResult.error]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Using a smaller distance for quicker drag initiation
            },
        }),
    )

    const handleDragStart = useCallback((event: DragStartEvent) => {
        if (process.env.NODE_ENV === 'development') {
            console.log("Drag started:", event)
        }
        const { active } = event

        // Extract the product directly from event data if available
        if (active.data.current?.product) {
            setActiveProduct(active.data.current.product);
            return;
        }

        // Handle QuickSearchResult[] data structure (fallback if data is not in event)
        if (Array.isArray(data) && data.length > 0 && 'store_name' in data[0]) {
            const idParts = String(active.id).split('-');
            // Remove rowIndex from the end to match with data
            const productId = idParts.length > 2 ? `${idParts[0]}-${idParts[1]}` : String(active.id);
            
            const draggedProduct = (data as QuickSearchResult[]).find(
                (product) => `${product.store_name}-${product.asin}` === productId || 
                             `${product.store_name}-${product.asin}` === active.id
            )
            if (draggedProduct) {
                setActiveProduct(draggedProduct as any)
            }
        }
        // Handle new API response format with results array
        else if (data && 'results' in data) {
            const idParts = String(active.id).split('-');
            const productId = idParts.length > 2 ? `${idParts[0]}-${idParts[1]}` : String(active.id);
            
            const draggedProduct = data.results.find(
                (product: any) => `${product.store_name}-${product.asin}` === productId || 
                                 `${product.store_name}-${product.asin}` === active.id
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
    }, [data])

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event
        if (process.env.NODE_ENV === 'development') {
            console.log("Drag ended:", { active, over })
        }
        
        // Reset active product
        setActiveProduct(null)
        
        // Only process if dropping in the droppable area
        if (over && over.id === "droppable-area") {
                // Handle direct product data from the drag event
                    if (active.data.current?.product) {
                        const draggedProduct = active.data.current.product;
                        // Set product for comparison
                        setSelectedProducts([draggedProduct])
   
                        // Update selected ASIN for product details
                        if ('asin' in draggedProduct) {
                            console.log("Drag setting ASIN:", draggedProduct.asin, "Price:", draggedProduct.price);
                            setSelectedAsin(draggedProduct.asin);
                            setSelectedSalesPrice(draggedProduct.price);
                        } else if ('scraped_product' in draggedProduct) {
                            console.log("Drag setting ASIN:", draggedProduct.scraped_product.id, "Price:", draggedProduct.scraped_product.price.formatted);
                            setSelectedAsin(draggedProduct.scraped_product.id);
                            setSelectedSalesPrice(draggedProduct.scraped_product.price.formatted);
                        }
   
                        // Scroll to Comparison Workspace section
                        setTimeout(() => {
                            comparisonWorkspaceRef.current?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }, 100);
   
                        return;
                    }
            
            // Fallback to handle QuickSearchResult[] data structure if no direct data
            if (Array.isArray(data) && data.length > 0 && 'store_name' in data[0]) {
                const idParts = String(active.id).split('-');
                // Remove rowIndex from the end to match with data
                const productId = idParts.length > 2 ? `${idParts[0]}-${idParts[1]}` : String(active.id);
                
                const draggedProduct = (data as QuickSearchResult[]).find(
                    (product) => `${product.store_name}-${product.asin}` === productId || 
                                 `${product.store_name}-${product.asin}` === active.id
                )
                if (draggedProduct) {
                    console.log("Results array drag setting ASIN:", draggedProduct.asin, "Price:", draggedProduct.price);
                    setSelectedProducts([draggedProduct as any])
                    setSelectedAsin(draggedProduct.asin);
                    setSelectedSalesPrice(draggedProduct.price);
                }
            }
            // Handle new API response format with results array
            else if (data && 'results' in data) {
                const idParts = String(active.id).split('-');
                const productId = idParts.length > 2 ? `${idParts[0]}-${idParts[1]}` : String(active.id);
                
                const draggedProduct = data.results.find(
                    (product: any) => `${product.store_name}-${product.asin}` === productId || 
                                     `${product.store_name}-${product.asin}` === active.id
                )
                if (draggedProduct) {
                    console.log("Fallback drag setting ASIN:", draggedProduct.asin, "Price:", draggedProduct.price);
                    setSelectedProducts([draggedProduct as any])
                    setSelectedAsin(draggedProduct.asin);
                    setSelectedSalesPrice(draggedProduct.price);
                }
            }
            // Handle old QuickSearchData structure
            else if (data && 'opportunities' in data) {
                const draggedProduct = data.opportunities.find(
                    (product) => product.scraped_product.id === active.id
                )
                if (draggedProduct) {
                    setSelectedProducts([draggedProduct])
                    setSelectedAsin(draggedProduct.scraped_product.id);
                }
            }
        }
    }, [data])

    const handleRowClick = (product: ProductObj | QuickSearchResult) => {
        console.log("Row clicked - Product:", product);
        console.log("Product keys:", Object.keys(product));
        console.log("Product has 'asin' property:", 'asin' in product);
        console.log("Product has 'scraped_product' property:", 'scraped_product' in product);
        console.log("Product has 'store_name' property:", 'store_name' in product);
        setSelectedProducts([product as any])
        if ('asin' in product) {
            console.log("Setting ASIN:", product.asin, "Price:", product.price);
            setSelectedAsin(product.asin);
            setSelectedSalesPrice(product.price);
        } else if ('scraped_product' in product) {
            console.log("Setting ASIN:", product.scraped_product.id, "Price:", product.scraped_product.price.formatted);
            setSelectedAsin(product.scraped_product.id);
            setSelectedSalesPrice(product.scraped_product.price.formatted);
        } else if ('store_name' in product) {
            // This is a QuickSearchResult - use the original search ASIN and the product's price
            console.log("QuickSearchResult detected - using original ASIN:", asin, "Price:", (product as any).price);
            setSelectedAsin(asin); // Use the ASIN from the original search
            setSelectedSalesPrice((product as any).price);
        } else {
            console.log("Product doesn't match expected structure");
        }

        // Scroll to Comparison Workspace section with smooth behavior
        setTimeout(() => {
            comparisonWorkspaceRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100); // Small delay to ensure state updates complete
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

    const amazonProductDetails = amazonProductDetailsResult.data?.data || amazonProductDetailsResult.data;
    
    // Create product data object from API response
    const productData = {
        "Avg. Amazon 90 day price": amazonProductDetails?.avg_amazon_90_day_price != null
            ? `$${Number(amazonProductDetails.avg_amazon_90_day_price).toFixed(2)}`
            : 'N/A',

        "Gross ROI": amazonProductDetails?.gross_roi != null
            ? `${Number(amazonProductDetails.gross_roi).toFixed(1)}%`
            : 'N/A',

        "Sales rank": amazonProductDetails?.sales_rank != null
            ? String(amazonProductDetails.sales_rank)
            : 'N/A',

        "Avg. 3 month sales rank": amazonProductDetails?.avg_3_month_sales_rank != null
            ? String(amazonProductDetails.avg_3_month_sales_rank)
            : 'N/A',

        "ASIN": amazonProductDetails?.asin || asin || 'N/A',

        "Number of Sellers": amazonProductDetails?.number_of_sellers != null
            ? String(amazonProductDetails.number_of_sellers)
            : 'N/A',

        "Monthly Sellers": amazonProductDetails?.monthly_sellers != null
            ? String(amazonProductDetails.monthly_sellers)
            : 'N/A',

        "Amazon on listing": amazonProductDetails?.amazon_on_listing != null
            ? (amazonProductDetails.amazon_on_listing ? 'YES' : 'NO')
            : 'N/A'
    }

    useEffect(() => {
        const currentParams = { asin, marketplace_id, queue };
        const hasParamsChanged =
            lastQueryParams.asin !== currentParams.asin ||
            lastQueryParams.marketplace_id !== currentParams.marketplace_id ||
            lastQueryParams.queue !== currentParams.queue;

        if (hasParamsChanged) {
            // Immediately set route changing to show loading screen without delay
            setIsRouteChanging(true);
            setLastQueryParams(currentParams);
        }
    }, [asin, marketplace_id, queue, pathname, lastQueryParams.asin, lastQueryParams.marketplace_id, lastQueryParams.queue]);

    useEffect(() => {
        if (!isFetching) {
            setIsRouteChanging(false);
        }
    }, [isFetching]);

    useEffect(() => {
        setSelectedProducts([]);
    }, [data]);

    // Always show a loader when loading or route changing
    if (isLoading || isRouteChanging) {
        if (searchId) return <Loader />;
        
        return (
            <GoCompareLoader
                asin={asin}
                storeNames={Array.isArray(data) && data.length > 0 && 'store_name' in data[0] ? data.map(item => item.store_name) : []}
                isLoading={true}
            />
        );
    }
    if (isError) {
        let errorMessage = "Unknown error";
        let errorDetails = "";
        
        if (error && typeof error === 'object') {
            console.log("Error object:", error); // Log the full error object for debugging
            
            if ('status' in error) {
                const status = error.status;
                errorDetails = `Status: ${status}`;
                
                if (typeof error.data === 'string') {
                    errorMessage = error.data;
                } else if (typeof error.data === 'object' && error.data !== null) {
                    const errorData = error.data as any;
                    errorMessage = errorData.error || errorData.message || errorData.errorMessage || errorMessage;
                    
                    // Extract more details if available
                    if (errorData.details) {
                        errorDetails += ` - ${JSON.stringify(errorData.details)}`;
                    }
                }
            } else if ('message' in error) {
                errorMessage = error.message || errorMessage;
            }
            
            // Check for network errors
            if ('name' in error && error.name === 'FetchError') {
                errorMessage = "Network error: Unable to connect to the server";
            }
        }
        
        console.error("Quick Search failed:", errorMessage, errorDetails ? `(${errorDetails})` : "");
        
        return (
            <div className="p-4 border border-red-300 bg-red-50 rounded-md">
                <h3 className="text-red-600 font-medium text-lg mb-2">Search Error</h3>
                <p className="text-red-700 mb-1">{errorMessage}</p>
                {errorDetails && <p className="text-red-500 text-sm">{errorDetails}</p>}
                <p className="text-sm mt-3">Please try again or contact support if the issue persists.</p>
            </div>
        );
    }


    return (
        <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            modifiers={[restrictToWindowEdges]}
        >
            <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh]">
                <div className="flex flex-col lg:flex-row gap-6" ref={comparisonWorkspaceRef}>
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold mb-4" id="comparison-workspace">Comparison Workspace</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2.5">
                            {/* First product card - Amazon product using team-b API */}
                            {amazonProductDetailsResult.data?.data ? (
                                <SimpleProductCard product={{
                                    asin: amazonProductDetailsResult.data.data.asin,
                                    product_name: amazonProductDetailsResult.data.data.product_name,
                                    image_url: amazonProductDetailsResult.data.data.image_url,
                                    price: amazonProductDetailsResult.data.data.current_price.toString(),
                                    product_url: amazonProductDetailsResult.data.data.product_url,
                                    store_name: "Amazon",
                                    currency: "USD",
                                    country: "US",
                                    created_at: new Date().toISOString(),
                                    profit_margin: 0,
                                    gross_roi: 0,
                                    target_fees: "0",
                                    amazon_price: (amazonProductDetailsResult.data.data.current_price || 0).toString(),
                                    sales_rank: amazonProductDetailsResult.data.data.sales_rank ? amazonProductDetailsResult.data.data.sales_rank.toString() : "N/A",
                                    buybox_price: (amazonProductDetailsResult.data.data.current_price || 0).toString(),
                                    number_of_sellers: (amazonProductDetailsResult.data.data.number_of_sellers || 0).toString(),
                                    id: amazonProductDetailsResult.data.data.asin
                                }} />
                            ) : selectedProducts.length > 0 ? (
                                <SimpleProductCard product={selectedProducts[0]} />
                            ) : Array.isArray(data) && data.length > 0 && 'store_name' in data[0] ? (
                                <SimpleProductCard product={data[0]} />
                            ) : data && 'amazon_product' in data && data.amazon_product ? (
                                <SimpleProductCard product={data.amazon_product} />
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[326px] flex items-center justify-center">
                                    <p className="text-gray-500">No product data available</p>
                                </div>
                            )}
                            
                            {/* Droppable area for comparison */}
                            <Droppable
                                id="droppable-area"
                                className={selectedProducts.length > 0 ? `` : 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-[326px]'}
                            >
                                {selectedProducts.length > 0 ? (
                                    <div className="relative h-full">
                                        {selectedProducts[0] && 'scraped_product' in selectedProducts[0] ? (
                                            <ProductCard product={selectedProducts[0]} />
                                        ) : (
                                            <div className="h-full">
                                                {/* Direct cast to avoid type compatibility issues */}
                                                <ProductCard product={selectedProducts[0] as any} />
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
                        products={transformedProducts}
                        onRowClick={handleRowClick}
                    />
                </div>
            </section>

            <DragOverlay>
                {activeProduct && 'scraped_product' in activeProduct ? (
                    <Overlay activeProduct={activeProduct} />
                ) : activeProduct && 'store_name' in activeProduct ? (
                    <div className="p-4 bg-white border rounded-lg shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex-shrink-0 relative overflow-hidden rounded">
                                <Image 
                                    src={(activeProduct as QuickSearchResult).image_url || "https://via.placeholder.com/48?text=No+Image"} 
                                    alt={(activeProduct as QuickSearchResult).product_name || "Product"} 
                                    className="w-full h-full object-contain"
                                    width={48}
                                    height={48}
                                    unoptimized={true}
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium line-clamp-1">{(activeProduct as QuickSearchResult).product_name}</h4>
                        <p className="text-sm text-gray-600">{(activeProduct as QuickSearchResult).store_name}</p>
                        <p className="text-lg font-semibold text-green-600">{(activeProduct as QuickSearchResult).price}</p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}