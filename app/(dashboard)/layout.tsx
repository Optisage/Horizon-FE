'use client'
import { useLazyGetProfileQuery } from "@/redux/api/auth";
import { DashNav, DashSider } from "./_components";
import { useEffect } from "react";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slice/authSlice";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [getProfile, {  }] = useLazyGetProfileQuery();
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch();


  useEffect(() => {
    getProfile({})
      .unwrap()
      .then((res) => {
        dispatch(setUser(res));
      })
      .catch(() => {
        messageApi.error("failed to get Profile");
      });
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);
  return (
    <div className="drawer lg:drawer-open text-black mx-auto max-w-screen-2xl 2xl:border">
      {contextHolder}
      <label htmlFor="my-drawer-2" className="sr-only">
        Toggle Drawer
      </label>
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-white">
        <DashNav />
        <div className="p-5 lg:p-6">{children}</div>
      </div>
      <DashSider />
    </div>
  );
}
