"use client";

import { useParams } from "next/navigation";
import ProductDetails from "../../_components/ProductDetails";

export interface ProductDetailsProps {
  asin: string;
  marketplaceId: string;
}

const ProductPage = () => {
  const params = useParams();
  const asin = params?.asin as string;
  const marketplaceId = "ATVPDKIKX0DER";

  // console.log("Params:", { asin });
  // console.log("Marketplace ID:", marketplaceId);

  return <ProductDetails asin={asin} marketplaceId={marketplaceId} />;
};

export default ProductPage;
