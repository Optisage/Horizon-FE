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

        // If successful, redirect back to signup page at step 6 with amazon_connected=true
        const signupUrl = new URL('/auth/signup', window.location.origin);
        signupUrl.searchParams.set('step', '6');
        signupUrl.searchParams.set('amazon_connected', 'true');
        
        router.push(signupUrl.toString());
        
      } catch (err) {
        console.error(err);
        setLoading(false);

        interface ApiError {
          status?: number;
          originalStatus?: number;
        }

        // Handle error structure properly
        if (
          (err as ApiError)?.status === 401 ||
          (err as ApiError)?.originalStatus === 401
        ) {
          setConnected(true); // This should trigger a rerender immediately
        } else {
          // For other errors, redirect back to signup with error
          const signupUrl = new URL('/auth/signup', window.location.origin);
          signupUrl.searchParams.set('step', '6');
          signupUrl.searchParams.set('amazon_error', 'true');
          
          router.push(signupUrl.toString());
        }
      }
    };

    if (spapiOauthCode && sellingPartnerId) {
      verifyAmazonAuth();
    } else {
      // If no required parameters, redirect back to signup
      const signupUrl = new URL('/auth/signup', window.location.origin);
      signupUrl.searchParams.set('step', '6');
      signupUrl.searchParams.set('amazon_error', 'true');
      
      router.push(signupUrl.toString());
    }
  }, [searchParams, spapiOauthCode, sellingPartnerId, router, amazonVerify]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-600">Connecting your Amazon store...</p>
        </div>
      ) : (
        <p className="text-red-500">
          Failed to authenticate. Please try again.
        </p>
      )}
      <ConnectedModal isConnectedVisible={connected} />
    </div>
  );
}