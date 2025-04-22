import Image from "next/image"
import walmart from "@/public/assets/svg/gocompare/walmart.svg"


interface ProductCardProps {
  product: any
}

export function ProductCard({ product }: ProductCardProps) {
  if (!product) return null; 

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-2.5 pb-0 h-[326px]">
      <div className="relative h-48 bg-gray-100">
        <Image
          src={product.image_url || product?.scraped_product?.image_url}
          alt={product?.product_name || product?.scraped_product?.product_name}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="mt-3">
        <h3 className="text-sm text-left mb-1 line-clamp-2">{product?.product_name || product?.scraped_product?.product_name}</h3>
        <div className="flex items-center justify-between">
          <span className="font-bold">${product?.pricing?.current_price || product?.scraped_product?.price?.amount}</span>
            <Image
              src={product.store?.logo || walmart}
              alt={product.store}
              width={70}
              height={20}
              className="object-contain"
            />
            {/* <Image
              src={amazon || "/placeholder.svg"}
              alt="store"
              width={70}
              height={20}
              className="object-contain"
            /> */}
        </div>
      </div>
    </div>
  )
}

