import { Metadata } from "next";
import History from "./_components/History";

export const metadata: Metadata = {
  title: "History",
  description: "Search History",
};

const page = () => {
  return <History />;
};

export default page;
