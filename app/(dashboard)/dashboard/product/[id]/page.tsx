import { Metadata } from "next";
import ProductDetails from "../../_components/ProductDetails";

export const metadata: Metadata = {
  title: "Product", // product name
  description:
    "Bear Paws Banana Bread Cookies - Soft Cookie Snack Packs, Made With Real Banana, Family Pack, 480g, 12 Pouches", //product desc.
};

const page = () => {
  return <ProductDetails />;
};

export default page;
