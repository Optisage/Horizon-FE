"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import sub from "@/public/assets/images/sub.jpg"
import LockIllustration from "@/public/assets/svg/lock-illustration.svg";
import { FormEvent, useState } from "react";
import { useForgetPasswordMutation } from "@/redux/api/auth";
import { message, Modal } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
const ForgotPassword = () => {
  const router = useRouter();
  const [ForgotPassword, {isLoading}] = useForgetPasswordMutation()
const [email, setEmail] =useState("")
  const [isModalOpen, setIsModalOpen] = useState(false);

const showModal = () => {
  setIsModalOpen(true);
};


const handleCancel = () => {
  setIsModalOpen(false);
};


const handleSubmit =(e: FormEvent)=>{
  e.preventDefault()
  ForgotPassword({email: email}).unwrap()
  .then(()=>{
    showModal()
  }).catch(()=>{
message.error("Failed to send link")
  });
}

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
            className="p-3 bg-[#F4F4F5] border border-transparent focus:border-neutral-700 placeholder:text-[#52525B] text-sm rounded-md outline-none w-full"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          //onClick={}
          disabled={isLoading}
          className="rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold p-2 active:scale-95 duration-200"
        >
          {
            isLoading && (
              <LoadingOutlined spin />
            )

          }
          Send me an email
        </button>
      </form>
      <Modal title="Reset Password" 
      open={isModalOpen}  
      onCancel={handleCancel}
      footer={false}
      centered={true}
      maskClosable={false}
      close={false}
      closeIcon={null}
      >
      <Image
      src={sub}
      alt="image" 
      className=" h-[100px] w-auto mx-auto"
      />
      <p className=" text-center font-bold text-sm">
       <span className=" text-green-500"> Reset Password Link</span><br/>
        Please check your email to complete your password reset
      </p>
      </Modal>
    </>
  );
};

export default ForgotPassword;
