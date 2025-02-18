import { Metadata } from "next";
import ResetPassword from "./_components/ResetPassword";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your account password",
};

const page = () => {
  return <ResetPassword />;
};

export default page;
