import Link from "next/link";
import { AmazonProduct, ProductObj, ReverseAmazon, ReverseAmazonScraped } from "@/types/goCompare";

type ProductCardType = ProductObj | AmazonProduct | ReverseAmazon | ReverseAmazonScraped;

interface ProductCardProps {
  product: ProductCardType;
}

const getCurrencySign = (currency: string | number | undefined): string => {
  switch (currency) {
    case "GBP":
    case 2:
      return "£"
    case "USD":
    case "$":
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

  const isAmazonProduct = (p: ProductCardType): p is AmazonProduct => 'store' in p && 'pricing' in p;
  const isProductObj = (p: ProductCardType): p is ProductObj => 'scraped_product' in p;
  const isReverseAmazonScraped = (p: ProductCardType): p is ReverseAmazonScraped => 'id' in p && 'image' in p && 'price' in p && 'name' in p;

  let imageUrl = "";
  let productUrl = "";
  let productName = "";
  let logoUrl = "";
  let currencySign = "";
  let price: number | string = "";

  if (isAmazonProduct(product)) {
    imageUrl = product.image_url;
    productUrl = product.page_url;
    productName = product.product_name;
    logoUrl = product.store.logo;
    currencySign = getCurrencySign(product.store.country_id);
    price = product.pricing.current_price;
  }
  else if (isProductObj(product)) {
    imageUrl = product.scraped_product.image_url;
    productUrl = product.scraped_product.product_url;
    productName = product.scraped_product.product_name;
    logoUrl = product.scraped_product.store_logo_url;
    currencySign = getCurrencySign(product.scraped_product.price.currency);
    price = product.scraped_product.price.amount;
  }
  else if (isReverseAmazonScraped(product)) {
    imageUrl = product.image;
    productUrl = product.url;
    productName = product.name;
    logoUrl = product.store.logo;
    logoUrl = product.store.logo;
    currencySign = getCurrencySign(product.currency);
    price = product.price;
  } else {
    imageUrl = product.image;
    productUrl = product.url;
    productName = product.product_name;
    logoUrl = product.store.logo;
    logoUrl = product.store.logo;
    currencySign = getCurrencySign(product.currency);
    price = product.price;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-2.5 pb-0 h-[326px]">
      <div className="relative h-48 ">
        <img src={imageUrl} alt={productName} className="object-contain w-full h-full rounded-md object-center" />
      </div>
      <div className="mt-3">
        <Link className="text-sm text-left mb-1 line-clamp-2 hover:underline"
          target="_blank" rel="noopener noreferrer" href={productUrl || "#"}
        >
          {productName}
        </Link>
        <div className="flex items-center justify-between">
          <span className="font-bold">{currencySign}{price}</span>
          {logoUrl && (
            <img src={logoUrl} alt="Store logo" className="object-contain w-10 h-10" />
          )}
        </div>
      </div>
    </div>
  );
}


