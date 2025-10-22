import React from 'react'

// ThreeDotLoader component for loading animation
const ThreeDotLoader = () => (
    <div className="three-dot-loader">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
    </div>
);

// Helper function to check if Gross ROI should show loading
const shouldShowGrossROILoading = (value: string, isLoading: boolean) => {
    // Show loading when:
    // 1. Component is in loading state OR value looks incomplete
    // 2. AND value is empty, null, undefined, or looks like a placeholder
    const isPlaceholderValue = !value || 
                              value === '0.0%' || 
                              value === '0%' || 
                              value === 'N/A' || 
                              value === '-' || 
                              value === '' || 
                              value === 'null' || 
                              value === 'undefined';
    
    // Show loader if loading OR if value appears to be a placeholder
    const shouldShow = isLoading || (isPlaceholderValue && value !== undefined);
    
    // Debug logging
    console.log('Gross ROI Loading Check:', {
        value,
        isLoading,
        isPlaceholderValue,
        shouldShow
    });
    
    return shouldShow;
};

interface ProductDataProp {
    productData: {
        [key: string]: string
    }
    isSelected: boolean
    isLoading?: boolean
}

const ProductInformation = ({ productData, isSelected, isLoading }: ProductDataProp) => {
    return (
        <div className="w-full lg:w-[400px] mt-3 md:mt-0 flex flex-col lg:h-auto">
            {isSelected &&
                <>
                    <h2 className="text-lg font-semibold mb-4">Product Information</h2>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {isLoading && Object.keys(productData).length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                <span className="ml-2 text-sm text-gray-600">Loading...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {Object.entries(productData).map(([key, value], index) => (
                                    <div
                                        key={key}
                                        className={`flex justify-between py-3 px-4 ${
                                            index !== Object.entries(productData).length - 1 ? 'border-b border-gray-100' : ''
                                        }`}
                                    >
                                        <span className="text-sm text-gray-700">{key}</span>
                                        <span className="text-sm font-medium">
                                            {key === "Gross ROI" && shouldShowGrossROILoading(value, isLoading || false) ? (
                                                <ThreeDotLoader />
                                            ) : (
                                                value
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            }
        </div>
    )
}

export default ProductInformation