import { Metadata } from "next";
import UpcScanner from "./_components/UpcScanner";

export const metadata: Metadata = {
  title: "UPC Scanner",
  description: "UPC Scanner",
};

const page = () => {
  return <UpcScanner />;
};

export default page;

