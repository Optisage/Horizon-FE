import { Metadata } from "next";
import Dashboard from "./_components/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard Home",
};

const page = () => {
  return <Dashboard />;
};

export default page;
