import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useCreateSubscriptionMutation } from "../../../redux/api/subscriptionApi";

const SubscriptionCheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [createSubscription] = useCreateSubscriptionMutation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setMessage("Stripe has not been initialized.");
      return;
    }

    setLoading(true);
    setMessage("");

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setMessage("Card element not found.");
      setLoading(false);
      return;
    }

    try {
      // Create a PaymentMethod
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          email: email, // Send email to Stripe
        },
      });

      if (pmError || !paymentMethod) {
        setMessage(pmError?.message || "Error creating payment method.");
        setLoading(false);
        return;
      }

      // Create subscription on the backend
      const res = await createSubscription({
        payment_method: paymentMethod.id,
        email: email,
        name:name,
        pricing_id:2
      }).unwrap();


      // Handle SCA if required
      if (res.clientSecret) {
        const { error: confirmError } = await stripe.confirmCardPayment(res.clientSecret);
        if (confirmError) {
          setMessage(confirmError.message || "Payment authentication failed.");
          setLoading(false);
          return;
        }
      }

      setMessage("Subscription successful! Thank you.");
    } catch (err: any) {
      setMessage(err.data?.error || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center w-full h-svh">
      <form
        onSubmit={handleSubmit}
        className="max-w-md w-full mx-auto p-6 border border-gray-300 rounded-lg bg-white shadow-sm space-y-5"
      >
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-4 border border-gray-300 rounded-md bg-gray-50 w-full"
          required
        />
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-4 border border-gray-300 rounded-md bg-gray-50 mb-6 w-full"
          required
        />

        {/* Card Element */}
        <div className="p-4 border border-gray-300 rounded-md bg-gray-50 mb-6">
          <CardElement options={{ hidePostalCode: true }} />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || loading}
          className={`w-full py-2 px-4 rounded-md text-white font-semibold ${
            !stripe || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } transition-colors`}
          aria-disabled={!stripe || loading}
        >
          {loading ? "Processing..." : "Subscribe"}
        </button>

        {/* Message */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-md text-center ${
              message.includes("success")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
            aria-live="polite"
          >
            {message}
          </div>
        )}
      </form>
    </main>
  );
};

export default SubscriptionCheckoutForm;