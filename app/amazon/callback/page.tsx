"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      const spapiOauthCode = searchParams.get("spapi_oauth_code");

      if (!spapiOauthCode) {
        console.error("Authorization code not found in URL.");
        return;
      }

      try {
        const response = await fetch("https://api.amazon.com/auth/o2/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            spapi_oauth_code: spapiOauthCode,
            client_id: "amzn1.application-oa2-client.d59a0a95a8b6495fabd9dcc456446b81",
            client_secret: "amzn1.oa2-cs.v1.f14b202a4c9046a9e1dee178efa6039dbf2dc57314aa254ac828f6038d78f532",
          }).toString(),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("Access Token:", data);
          // Store token and redirect
          localStorage.setItem("amazon_access_token", data.access_token);
          router.push("/dashboard");
        } else {
          console.error("Token exchange failed:", data);
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {loading ? (
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      ) : (
        <p className="text-red-500">Failed to authenticate. Please try again.</p>
      )}
    </div>
  );
}
