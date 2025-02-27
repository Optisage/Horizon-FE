import Image from "next/image";
import Link from "next/link";

import Logo from "@/public/assets/svg/Optisage Logo.svg";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="bg-[#FAFAFA] h-screen flex flex-col items-center px-4 md:px-0">
      <div className="my-auto flex flex-col gap-20 lg:gap-28 items-center w-full max-w-[480px] sm:w-[480px]">
        <Link href="/">
          <Image src={Logo} alt="Logo" width={203} height={53} quality={90} />
        </Link>

        <div className="w-full max-w-[480px] sm:w-[480px] flex flex-col gap-4 md:gap-6 p-6 px-3 sm:p-6 bg-white rounded-lg shadow-md">
          {children}
        </div>
      </div>
    </section>
  );
}
