"use client"
import React from "react";
import { signIn } from "next-auth/react";



const ConnectAmazon = () => {
  
  return (
    <section className="">
      <div >
        <button className="text-center w-full"
       onClick={() => signIn("amazon")}
        >Connect Amazon Seller Central</button>
      </div>
    </section>
  );
};

export default ConnectAmazon;
