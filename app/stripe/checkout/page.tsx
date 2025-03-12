"use client";
import {useVerifyStripeSubscriptionMutation } from "@/redux/api/subscriptionApi";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/public/assets/svg/Optisage Logo.svg";
import { GrStatusGood } from "react-icons/gr";
import { MdErrorOutline } from "react-icons/md";

export default function StripeCheckout() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [verifySubscription] = useVerifyStripeSubscriptionMutation();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const status = searchParams.get("status");

    if (status === "success") {
      verifySubscription({ session_id: sessionId })
        .unwrap()
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
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
        <section className=" h-screen">
          <div className=" flex justify-center py-10">
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

          <div className=" flex justify-center">
            {failed ? (
              <MdErrorOutline size={120} color="red" />
            ) : (
              <GrStatusGood size={120} color="#18cb96" />
            )}
          </div>
          <div className=" flex justify-center">
            {failed ? (
              <div className=" text-center">
                <h1 className=" font-semibold text-2xl">
                  Subscription Failed.
                </h1>
                <p>Sorry we were unable to complete your subscription.</p>
              </div>
            ) : (
              <div className=" text-center">
                <h1 className=" font-semibold text-2xl">
                  Subscription Successful.
                </h1>
                <p>Please check your mail to complete your registration.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
