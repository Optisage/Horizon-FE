import React from 'react'

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
                        {isLoading ? (
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
                                        <span className="text-sm font-medium">{value}</span>
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