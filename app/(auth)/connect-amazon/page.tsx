"use client"
import React from "react";

import Link from "next/link";
import Image from "next/image";
import amazon from "@/public/assets/svg/amazon.svg"


const ConnectAmazon = () => {
  
  return (
    <section className="">
      <div >
        <Link href={"https://sellercentral.amazon.com/apps/authorize/consent?application_id=amzn1.sp.solution.9878d848-7196-4832-9fd2-5b5796ea88c5&state=ourauth&version=beta&response_type=code&scope=sellingpartnerapi%3A%3Aauthorization&redirect_uri=https%3A%2F%2Fstaging.optisage.ai%2Famazon%2Fcallback"}>
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
