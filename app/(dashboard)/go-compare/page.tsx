import { Metadata } from "next";
import GoCompare from "./_components/GoCompare";

export const metadata: Metadata = {
  title: "Go Compare",
  description: "Go Compare",
};

const page = () => {
  return <GoCompare/>;
};

export default page;
