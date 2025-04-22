import Image from 'next/image'
import React from 'react'
import { Product } from '../QuickSearchTable'

interface ActiveProductProp {
    activeProduct: Product
}

const Overlay = ({ activeProduct }: ActiveProductProp) => {
    if (!activeProduct) return null;

    const { scraped_product, store, roi_percentage } = activeProduct;
    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-64 cursor-pointer">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 relative rounded overflow-hidden flex-shrink-0">
                    {/* <Image
                        src={scraped_product.storeLogo}
                        alt={scraped_product.product_name}
                        fill
                        className="object-cover"
                    /> */}
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


