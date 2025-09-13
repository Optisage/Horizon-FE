
import { Metadata } from "next";
import Pricing from "./_components/Pricing";

export const metadata: Metadata = {
  title: "Our Pricing",
  description: "Pricing Plans",
};

const page = () => {
  return <Pricing />;
};

export default page;
