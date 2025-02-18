import { Metadata } from "next";
import ForgotPassword from "./_components/ForgotPassword";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your account password",
};

const page = () => {
  return <ForgotPassword />;
};

export default page;
