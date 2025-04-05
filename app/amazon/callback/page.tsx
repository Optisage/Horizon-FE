"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLazyAmazonAuthQuery } from "@/redux/api/auth";
import ConnectedModal from "./modal";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false); // Initialize as false
  const [amazonVerify] = useLazyAmazonAuthQuery();
  const spapiOauthCode = searchParams.get("spapi_oauth_code");
  const sellingPartnerId = searchParams.get("selling_partner_id");

  useEffect(() => {
    amazonVerify({
      spapi_oauth_code: spapiOauthCode,
      selling_partner_id: sellingPartnerId,
    })
      .unwrap()
      .then(() => {
        router.push("/dashboard");
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        // Check if the error status is 400
        if (err.status === 400) {
          setConnected(true); // Show the modal
        }
      });
  }, [searchParams, spapiOauthCode, sellingPartnerId, amazonVerify, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {loading ? (
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      ) : (
        <p className="text-red-500">
          Failed to authenticate. Please try again.
        </p>
      )}
      {/* Modal shows when connected is true */}
      <ConnectedModal isConnectedVisible={connected} />
    </div>
  );
}