import { Metadata } from "next";
import Seller from "../_components/Seller";

export const metadata: Metadata = {
  title: "Other Sellers",
  description: "Other Sellers on optisage",
};

const page = () => {
  return <Seller />;
};

export default page;
