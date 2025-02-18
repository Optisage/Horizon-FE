"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import Amazon from "@/public/assets/svg/amazon.svg";
import { useLoginMutation } from "@/redux/api/auth";
import { message } from "antd";

const Login = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [login, {data, isLoading}] = useLoginMutation()



  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("starting")


    const payload = {
      email,
      password,
    };

    try {
      const response = await login(payload).unwrap();
      console.log("login-up success:", response);
      //router.push("/success");
    } catch (error) {
      console.error("Login failed:", error);
      message.error("failed")
    }
  };
  const handleContinue = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (step === 1 && email) {
      setStep(2);
    } else if (step === 2) {
      // Call handleSubmit when the password is provided
      if (!password) {
        message.error("Please enter your password.");
        return;
      }
  
      await handleSubmit(e);
    }
  };

  

  return (
    <>
      {step < 3 ? (
        <>
          <form className="flex flex-col gap-4" onSubmit={handleContinue}>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

              {step === 2 && (
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="password"
                    className="text-sm text-neutral-700 font-medium"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      placeholder="Enter your password"
                      className="p-3 pr-10 bg-[#F4F4F5] border border-transparent focus:border-neutral-700 placeholder:text-[#52525B] text-sm rounded-md outline-none w-full"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-neutral-600 hover:text-neutral-800"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <IoEyeOffOutline className="size-6" />
                    ) : (
                      <IoEyeOutline className="size-6" />
                    )}
                  </button>
                </div>
              </div>
            )}

              <button
                type="submit"
                className="rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold p-2 active:scale-95 duration-200"
              >
                {isLoading ? "Logging In..." : "Continue"}
                
              </button>
            </form>

          <Link href="" className="font-medium underline">
            Privacy Policy
          </Link>

          <p>
            Forgot your password? You can{" "}
            <Link
              href="/forgot-password"
              className="underline hover:font-medium"
            >
              reset it here
            </Link>
            .
          </p>
        </>
      ) : (
        <button
          onClick={() => router.push("/dashboard")} // connect to amazon api here
          className="text-gray-900 border border-[#E4E4E7] rounded-[10px] px-2 py-2 active:scale-95 duration-200 hover:bg-gray-50 flex gap-2 items-center justify-center text-sm"
        >
          <Image
            src={Amazon}
            alt="Amazon"
            className="size-8"
            width={31}
            height={32}
          />
          Connect your Seller Central for Better Experience
        </button>
      )}
    </>
  );
};

export default Login;
