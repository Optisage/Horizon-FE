"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import Link from "next/link";
import { useLoginMutation } from "@/redux/api/auth";
import { message } from "antd";
import { email, password } from "@/lib/validationSchema";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slice/authSlice";
import Cookies from "js-cookie";

const Login: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const [messageApi, contextHolder] = message.useMessage();
  const [formValues, setFormValues] = useState({ email: "", password: "" });

  useEffect(() => {
    // Clear the token cookie
    Cookies.remove("optisage-token");
    dispatch(logout());
  }, [dispatch]);

  const handleSubmit = async (
    values: { email: string; password: string },
    setFieldError: (field: string, message: string) => void
  ) => {
    try {
      const response = await login(values).unwrap();
      if (response?.data?.user?.has_connected_amazon_account === true) {
        router.push("/dashboard");
      } else {
        router.push("/connect-amazon");
      }
      messageApi.success("Login Successful");
    } catch (error) {
      messageApi.error("Login Failed");
      console.log(error);
      const errorMessage =
        (error as { message?: string; data?: { message?: string } })?.data
          ?.message || "An error occurred";
      // Ensure this properly sets the field error
      setFieldError("password", errorMessage);
    }
  };

  return (
    <>
      {contextHolder}
      <Formik
        initialValues={formValues}
        enableReinitialize // This keeps values persistent when changing steps
        validationSchema={step === 1 ? email : password}
        onSubmit={async (values, { setFieldError }) => {
          if (step === 1) {
            setFormValues(values); // Store values before moving to step 2
            setStep(2);
          } else {
            await handleSubmit(values, setFieldError);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-sm text-neutral-700 font-medium"
              >
                Email Address
              </label>
              <Field
                type="email"
                name="email"
                placeholder="Ex: marc@example.com"
                className="p-3 bg-[#F4F4F5] border border-transparent focus:border-neutral-700 placeholder:text-[#52525B] text-sm rounded-md outline-none w-full"
              />
              <ErrorMessage
                name="email"
                component="p"
                className="text-red-500 text-sm mt-1"
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
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  className="p-3 pr-10 bg-[#F4F4F5] border border-transparent focus:border-neutral-700 placeholder:text-[#52525B] text-sm rounded-md outline-none w-full"
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
              <ErrorMessage
                name="password"
                component="p"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold p-2 active:scale-95 duration-200"
              disabled={isSubmitting || isLoading}
            >
              {isLoading ? "Logging In..." : "Continue"}
            </button>
          </Form>
        )}
      </Formik>

      <div className="flex flex-col gap-2 items-center">
        <p>
          Forgot your password? You can reset it{" "}
          <Link href="/forgot-password" className="underline hover:font-medium">
            here
          </Link>
          .
        </p>

        <p className="font-medium">
          New here?{" "}
          <Link href="/pricing" className="underline hover:font-semibold">
            Create an Account
          </Link>
          .
        </p>

        <Link
          href="https://getnoticed.ca/privacy-policy/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium"
        >
          Privacy Policy
        </Link>
      </div>
    </>
  );
};

export default Login;

