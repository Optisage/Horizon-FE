import { Metadata } from "next";
import Settings from "./_components/Settings";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings",
};

const page = () => {
  return <Settings />;
};

export default page;
