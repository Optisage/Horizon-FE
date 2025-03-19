"use client";
import {useVerifyStripeSubscriptionMutation } from "@/redux/api/subscriptionApi";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/public/assets/svg/Optisage Logo.svg";
import success from "@/public/assets/svg/subSuccess.svg"
import failedimg from "@/public/assets/svg/subFailed.svg"
export default function StripeCheckout() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(status !== "success");
  const [verifySubscription] = useVerifyStripeSubscriptionMutation();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const currentStatus = searchParams.get("status");

    if (currentStatus === "success") {
      setLoading(true);
      verifySubscription({ session_id: sessionId })
        .unwrap()
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setFailed(true);
        });
    }
  }, [searchParams, verifySubscription]);

  return (
    <main>
      {loading ? (
        <div className=" flex justify-center h-screen items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <section className=" h-screen place-content-center place-items-center relative">
          <div className=" flex justify-center py-10 absolute top-10 w-full">
            <Link href="/">
              <Image
                src={Logo}
                alt="Logo"
                width={203}
                height={53}
                quality={90}
              />
            </Link>
          </div>

          <div className=" border rounded-xl shadow-xl p-7">
          <div className=" flex justify-center">
            {failed ? (
              <Image src={failedimg} alt="failed" className=""/>
            ) : (
             <Image src={success} alt="successful " className=" mb-6" />
            )}
          </div>
          <div className=" flex justify-center md:max-w-[400px]">
            {failed ? (
              <div className=" text-center space-y-2">
                <h1 className=" font-semibold text-2xl">
                  Payment unsuccessful!
                </h1>
                <p>Please check your payment details and try again.</p>
                <div>
                  <a href="https://optisage.ai/pricing/">
                  <button className=" w-full rounded-md border shadow-[0px_-3px_0px_0px_#00000014_inset] py-2">
                  Select another plan
                  </button>
                  </a>
                </div>
              </div>
            ) : (
              <div className=" text-center">
                <h1 className=" font-semibold text-2xl mb-6">
                Your subscription is successful!
                </h1>
                <p>An email has been sent to <span className=" font-semibold">macdonald@gmail.com</span>, Please follow the instructions and set up account</p>
                <div className=" mt-1">
                  <button className=" w-full rounded-md border shadow-[0px_-3px_0px_0px_#00000014_inset] py-2">
                  Resend Email
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>

          <div className=" absolute bottom-5 w-full flex justify-center">
            <a href="https://optisage.ai/contact/" className=" underline">
            Contact Support
            </a>
          </div>
        </section>
      )}
    </main>
  );
}
