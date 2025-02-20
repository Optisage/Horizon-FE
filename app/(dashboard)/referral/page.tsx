import { Metadata } from "next";
import Referral from "./_components/Referral";

export const metadata: Metadata = {
  title: "Refer and Earn",
  description:
    "Invite your friends to join Optisage. Earn rewards when they sign up and upgrade their subscription.",
};

const page = () => {
  return <Referral />;
};

export default page;
