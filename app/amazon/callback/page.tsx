"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLazyAmazonAuthQuery } from "@/redux/api/auth";
import ConnectedModal from "./modal";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [amazonVerify] = useLazyAmazonAuthQuery();
  const spapiOauthCode = searchParams.get("spapi_oauth_code");
  const sellingPartnerId = searchParams.get("selling_partner_id");

  useEffect(() => {
    const verifyAmazonAuth = async () => {
      try {
        await amazonVerify({
          spapi_oauth_code: spapiOauthCode,
          selling_partner_id: sellingPartnerId,
        }).unwrap();
        
        router.push("/dashboard");
      } catch (err) {
        console.error(err);
        setLoading(false);
        
        // Handle error structure properly
        if ((err as any)?.status === 401 || (err as any)?.originalStatus === 401) {
          setConnected(true); // This should trigger a rerender immediately
        }
      }
    };

    if (spapiOauthCode && sellingPartnerId) {
      verifyAmazonAuth();
    }
  }, [searchParams, spapiOauthCode, sellingPartnerId, router]); // Removed amazonVerify from deps

  return (
    <div className="flex items-center justify-center min-h-screen">
      {loading ? (
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      ) : (
        <p className="text-red-500">
          Failed to authenticate. Please try again.
        </p>
      )}
      <ConnectedModal isConnectedVisible={connected} />
    </div>
  );
}