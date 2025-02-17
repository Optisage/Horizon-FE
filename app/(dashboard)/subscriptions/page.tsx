import { Metadata } from "next";
import Subscriptions from "./_components/Subscriptions";

export const metadata: Metadata = {
  title: "Subscriptions",
  description: "Subscription Plans",
};

const page = () => {
  return <Subscriptions />;
};

export default page;
