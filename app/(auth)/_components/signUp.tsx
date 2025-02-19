"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import Logo from "@/public/assets/svg/Optisage Logo.svg";

import { useSetPasswordMutation } from "@/redux/api/auth";
import { message } from "antd";


const SignUp = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [expires, setExpires] = useState("");
  const [token, setToken] = useState("");

  const [signUp, {data, isLoading}]= useSetPasswordMutation()
  const [messageApi, contextHolder] = message.useMessage();
  console.log(data)
  useEffect(() => {
    // Extract the expires value from the URL
    const params = new URLSearchParams(window.location.search);
    const expiresValue = params.get("expires");
    const emailValue = params.get("email");
    const tokenValue = params.get("signature")
    if (expiresValue) {
      setExpires(expiresValue);
      console.log("Expires value set to:", expiresValue); // Log the value
    };
    if (tokenValue) setToken(tokenValue);
    if (emailValue) setEmail(emailValue);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("starting")

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const payload = {
      email,
      password,
      password_confirmation: confirmPassword,
      expires: expires,
    };

    try {
      const response = await signUp({data: payload , token}).unwrap();
      console.log("Sign-up success:", response);
      messageApi.open({
        type: 'success',
        content: 'Registration Completed',
      });
      router.push("/");
    } catch (error) {
      console.error("Sign-up failed:", error);
      messageApi.open({
        type: 'success',
        content: 'Registration Failed',
      });
    
    }
  };

  return (
    <section className="bg-[#FAFAFA] h-screen flex flex-col items-center px-4 md:px-0">
      {contextHolder}
      <div className="pt-20">
        <Link href="/">
          <Image src={Logo} alt="Logo" width={203} height={53} quality={90} />
        </Link>
      </div>

      <div className="w-full max-w-[480px] sm:w-[480px] flex flex-col gap-4 p-6 px-3 sm:p-6 bg-white my-auto rounded-lg shadow-md">
        
          <>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
                  className="p-3 bg-[#d7d7d7] border border-transparent focus:border-neutral-700 placeholder:text-[#52525B] text-sm rounded-md outline-none w-full"
                 // required
                  value={email}
                  disabled
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

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
                {/**...CONFIRM PASSWORD....*/}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="password"
                    className="text-sm text-neutral-700 font-medium"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type='password'
                      name="confirm-password"
                        id="confirm-password"
                      placeholder="Confirm your password"
                      className="p-3 pr-10 bg-[#F4F4F5] border border-transparent focus:border-neutral-700 placeholder:text-[#52525B] text-sm rounded-md outline-none w-full"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                   
                  </div>
                </div>

              <button
                type="submit"
                className="rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold p-2 active:scale-95 duration-200"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </button>
            </form>

            <Link href="" className="font-medium underline">
              Privacy Policy
            </Link>

            <p>
              Forgot your password? You can{" "}
              <Link href="" className="underline hover:font-medium">
                reset it here
              </Link>
              .
            </p>
          </>
        
      </div>
    </section>
  );
};

export default SignUp;
