"use client";

import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useRouter } from "next/navigation";
import { message } from "antd";

export default function CallbackPage() {
  const auth = useAuth();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (auth.isAuthenticated) {
      messageApi.success("Successfully logged in with Amazon");
      router.push("/dashboard");
    }
    if (auth.error) {
      messageApi.error("Failed to login with Amazon");
      router.push("/");
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [auth.isAuthenticated, auth.error]);

  return (
    <>
      {contextHolder}
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    </>
  );
} 