"use client"
import React from "react";

import Link from "next/link";
import Image from "next/image";
import amazon from "@/public/assets/svg/amazon.svg"


const ConnectAmazon = () => {

  const amazonAuthUrl = `https://sellercentral.amazon.com/apps/authorize/consent?${
    new URLSearchParams({
      application_id: process.env.NEXT_PUBLIC_AMAZON_CLIENT_ID!,
      state: "ourauth",
      version: "beta",
      response_type: "code",
      scope: "sellingpartnerapi::authorization",
      redirect_uri: process.env.NEXT_PUBLIC_AMAZON_REDIRECT_URI!,
    }).toString()
  }`;
  
  return (
    <section className="">
      <div >
        <Link href={amazonAuthUrl}>
        <button className="text-center w-full flex items-center justify-center gap-10"
        >
          <Image src={amazon} alt="amazon"/>
          Connect Amazon Seller Central
        </button>
        </Link>
      </div>
    </section>
  );
};

export default ConnectAmazon;
