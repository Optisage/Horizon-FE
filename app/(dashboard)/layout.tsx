"use client";
import { useLazyGetProfileQuery } from "@/redux/api/auth";
import { DashNav, DashSider } from "./_components";
import { useEffect, useState } from "react";
import { message, Modal } from "antd";
//import { useDispatch } from "react-redux";
//import { setUser } from "@/redux/slice/authSlice";

import { GoAlert } from "react-icons/go";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [getProfile, {}] = useLazyGetProfileQuery();
  const [messageApi, contextHolder] = message.useMessage();
  //const dispatch = useDispatch();
  const router = useRouter();
  // State to manage modal visibility
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleLogout = () => {
    // Clear the token cookie
    Cookies.remove("optisage-token");
    router.push("/");
  };

  useEffect(() => {
    getProfile({})
      .unwrap()
      .then((res) => {
        if (
          res?.data?.is_subscribed === false &&
          res?.data?.is_trial_expired === true
        ) {
          setIsModalVisible(true);
        }
      })
      .catch(() => {
        messageApi.error("failed to get Profile");
      });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [setIsModalVisible, getProfile]);
  return (
    <div className="drawer lg:drawer-open text-black mx-auto max-w-screen-2xl">
      {contextHolder}
      <label htmlFor="my-drawer-2" className="sr-only">
        Toggle Drawer
      </label>
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-[#E7EBEE] max-h-dvh overflow-y-scroll">
        <div className="p-2">
          <DashNav />
        </div>
        <div className="p-2 pb-4">
          {children}

          <Modal
            title="Subscription Alert"
            open={isModalVisible}
            footer={null}
            maskClosable={false}
            closable={false}
            centered={true}
          >
            <div className=" space-y-5">
              <div className=" flex justify-center">
                <GoAlert size={60} color="orange" />
              </div>

              <div className=" text-center">
                <h1 className=" font-semibold">
                  Please be informed that your subscription has expired. To
                  continue enjoying uninterrupted access to our services, please
                  renew your subscription as soon as possible.
                </h1>
              </div>
              <div className=" grid grid-cols-2 gap-10">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-lg font-bold"
                  onClick={() => handleLogout()}
                >
                  Log Out
                </button>

                <Link
                  href={"/renewSubscription"}
                  className=" hover:text-white text-center px-4 py-2 bg-green-500 text-white rounded-lg font-bold"
                >
                  Subscribe Now
                </Link>
              </div>
            </div>
          </Modal>
        </div>
      </div>
      <DashSider />
    </div>
  );
}

