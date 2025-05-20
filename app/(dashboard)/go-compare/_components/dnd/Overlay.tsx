import { ProductObj } from '@/types/goCompare';
import React from 'react'

interface ActiveProductProp {
    activeProduct: ProductObj
}

const Overlay = ({ activeProduct }: ActiveProductProp) => {
    if (!activeProduct) return null;

    const { scraped_product, store} = activeProduct;
    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-64 cursor-pointer">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 relative rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img
                        src={scraped_product.store_logo_url}
                        alt={scraped_product.product_name}
                        className="object-contain w-10 h-10"
                    />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{scraped_product.product_name}</p>
                    <div className="flex items-center justify-between mt-1">
                        {/* <span className="text-sm font-bold">{activeProduct.targetSales}</span> */}
                        <span className="text-xs text-gray-500">{store.name}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Overlay


