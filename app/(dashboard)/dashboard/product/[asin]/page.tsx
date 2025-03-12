"use client";

import { useParams } from "next/navigation";
import ProductDetails from "../../_components/ProductDetails";
import { useAppSelector } from "@/redux/hooks";

export interface ProductDetailsProps {
  asin: string;
  marketplaceId: number;
}

const ProductPage = () => {
  const params = useParams();
  const asin = params?.asin as string;
  const { marketplaceId } = useAppSelector((state) => state?.global);
  //const marketplaceId = "1";

  // console.log("Params:", { asin });
  // console.log("Marketplace ID:", marketplaceId);

  return <ProductDetails asin={asin} marketplaceId={marketplaceId} />;
};

export default ProductPage;
