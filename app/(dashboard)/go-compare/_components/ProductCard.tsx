import Image from "next/image"

interface ProductCardProps {
  product: any
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-2.5 pb-0 h-[326px]">
      <div className="relative h-48 bg-gray-100">
        <Image
          src={product.storeLogo || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="mt-3">
        <h3 className="text-sm text-left mb-1 line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="font-bold">{product.storePrice}</span>
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.store}
              width={70}
              height={20}
              className="object-contain"
            />
        </div>
      </div>
    </div>
  )
}

