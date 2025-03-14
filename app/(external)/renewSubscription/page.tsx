
import { Metadata } from "next";

import RenewSubscription from "./_component/renewSubscription";

export const metadata: Metadata = {
  title: "Our Pricing",
  description: "Pricing Plans",
};

const page = () => {
  return <RenewSubscription />;
};

export default page;
