import React from 'react'

interface ProductDataProp {
    productData: {
        [key: string]: string
    }
    isSelected: boolean
}

const ProductInformation = ({ productData, isSelected }: ProductDataProp) => {
    return (
        <div className="w-full lg:w-[400px] mt-3 md:mt-0 flex flex-col lg:h-auto h-96">
            {isSelected &&
                <>
                    <p className="font-semibold">Product Information</p>
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 mt-2.5 flex-1 flex">
                        <div className="flex flex-col flex-1 justify-between">
                            {Object.entries(productData).map(([key, value]) => (
                                <div key={key} className="grid grid-cols-3 gap-8 border-b px-4 flex-1">
                                    <span className="text-sm font-medium col-span-2 flex items-center">{key}</span>
                                    <span className="text-sm font-medium flex items-center">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div></>}
        </div>
    )
}

export default ProductInformation