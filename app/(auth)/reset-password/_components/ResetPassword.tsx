"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

const ResetPassword = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <span className="flex flex-col gap-3">
        <h1 className="text-[#111827] font-bold text-xl md:text-2xl">
          Create New Password
        </h1>
        <p className="text-[#6B7280]">
          Please, enter a new password below different from the previous
          password
        </p>
      </span>

      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="text-sm text-neutral-700 font-medium"
          >
            Enter New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Enter password"
              className="p-3 pr-10 bg-[#F4F4F5] border border-transparent focus:border-neutral-700 placeholder:text-[#52525B] text-sm rounded-md outline-none w-full"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-600 hover:text-neutral-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <IoEyeOffOutline className="size-6" />
              ) : (
                <IoEyeOutline className="size-6" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="confirm_password"
            className="text-sm text-neutral-700 font-medium"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              id="confirm_password"
              placeholder="Enter password"
              className="p-3 pr-10 bg-[#F4F4F5] border border-transparent focus:border-neutral-700 placeholder:text-[#52525B] text-sm rounded-md outline-none w-full"
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-neutral-600 hover:text-neutral-800"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <IoEyeOffOutline className="size-6" />
              ) : (
                <IoEyeOutline className="size-6" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          onClick={() => router.push("/")}
          className="rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold p-2 active:scale-95 duration-200"
        >
          Create New Password
        </button>
      </form>
    </>
  );
};

export default ResetPassword;
