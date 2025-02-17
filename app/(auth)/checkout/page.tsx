"use client";

import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import SubscriptionCheckoutForm from "../_components/checkOutForm";


// Replace with your actual Stripe publishable key
const stripePromise = loadStripe("pk_test_51QqgbuRbwUnvSLLdXBsQ3ydcxfqpOMLwGnou8PQEvx8eGE4MTPUoFEFyo7nSBNN7E93xWynFCprbCcGgZtPL6fGS00b7PxImhn");

const SubscriptionCheckoutPage = () => (
  <Elements stripe={stripePromise}>
    <SubscriptionCheckoutForm />
  </Elements>
);

export default SubscriptionCheckoutPage; 