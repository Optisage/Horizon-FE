"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import LockIllustration from "@/public/assets/svg/lock-illustration.svg";

const ForgotPassword = () => {
  const router = useRouter();

  return (
    <>
      <div>
        <Image
          src={LockIllustration}
          alt="lock illustration"
          width={90}
          height={76}
        />

        <span className="flex flex-col gap-3">
          <h1 className="text-[#111827] font-bold text-xl md:text-2xl">
            Passsword Recovery
          </h1>
          <p className="text-[#6B7280]">
            Enter your registered email below to receive password instructions
          </p>
        </span>
      </div>

      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="text-sm text-neutral-700 font-medium"
          >
            Email Address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Ex: marc@example.com"
            className="p-3 bg-[#F4F4F5] border border-transparent focus:border-neutral-700 placeholder:text-[#52525B] text-sm rounded-md outline-none w-full"
            required
          />
        </div>

        <button
          type="submit"
          onClick={() => router.push("/reset-password")}
          className="rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold p-2 active:scale-95 duration-200"
        >
          Send me an email
        </button>
      </form>
    </>
  );
};

export default ForgotPassword;
