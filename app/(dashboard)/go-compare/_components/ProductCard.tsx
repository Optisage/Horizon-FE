import Link from "next/link";
import { AmazonProduct, ProductObj } from "@/types/goCompare";

type ProductCardType = ProductObj | AmazonProduct;

interface ProductCardProps {
  product: ProductCardType;
}

const getCurrencySign = (currency: string | number | undefined): string => {
  switch (currency) {
    case "GBP":
    case 2:
      return "£"
    case "USD":
    case 1:
      return "$"
    case "CAD":
    case 3:
      return "C$"
    default:
      return ""
  }
}

export function ProductCard({ product }: ProductCardProps) {
  if (!product) return null;

  const isAmazonProduct = (p: ProductCardType): p is AmazonProduct => 'asin' in p;

  const imageUrl = isAmazonProduct(product)
    ? product.image_url
    : product.scraped_product.image_url;

  const productUrl = isAmazonProduct(product)
    ? product.page_url
    : product.scraped_product.product_url;

  const productName = isAmazonProduct(product)
    ? product.product_name
    : product.scraped_product.product_name;

  const logoUrl = isAmazonProduct(product)
    ? product.store.logo
    : product.scraped_product.store_logo_url;

  const currencySign = isAmazonProduct(product)
    ? getCurrencySign(product.store.country_id)
    : getCurrencySign(product.scraped_product.price.currency);

  const price = isAmazonProduct(product)
    ? product.pricing.current_price
    : product.scraped_product.price.amount;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-2.5 pb-0 h-[326px]">
      <div className="relative h-48 ">
        <img
          src={imageUrl}
          alt={productName}
          className="object-contain w-full h-full rounded-md object-center"

        />
      </div>
      <div className="mt-3">
        <Link className="text-sm text-left mb-1 line-clamp-2 hover:underline" target="_blank" rel="noopener noreferrer" href={productUrl}>{productName}</Link>
        <div className="flex items-center justify-between">
          <span className="font-bold">{currencySign}{price}</span>
          <img
            src={logoUrl}
            alt={productName}
            className="object-contain w-10 h-10"
          />
        </div>
      </div>
    </div>
  );
}


