"use client"
import { useLazyGetPricingQuery } from "@/redux/api/auth";
import { useLazyCreateStripeSubscriptionV2Query } from "@/redux/api/subscriptionApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { message } from "antd";
import { MdCancel } from "react-icons/md";

interface Feature {
  name: string;
  description: string;
}

interface PricingPlan {
  id: number;
  name: string;
  stripe_price_id: string;
  price: string;
  trial: number;
  currency: string;
  interval: string;
  meta_data: {
    notes?: string[];
    tooltip?: string;
    features?: Feature[];
    billing_note?: string;
  };
  status: number;
  created_at: string;
  updated_at: string;
  stripe_product_id: string;
}

export default function Pricing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  
  const [isAnnual, setIsAnnual] = useState(false);
  const [pricingData, setPricingData] = useState<PricingPlan[]>([]);
  const [expandedFeatures, setExpandedFeatures] = useState<{[key: number]: boolean}>({});
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  
  // User data from signup flow
  const [userEmail, setUserEmail] = useState<string>("");
  const [userFullname, setUserFullname] = useState<string>("");
  const [userRefCode, setUserRefCode] = useState<string>("");
  const [isFromSignup, setIsFromSignup] = useState(false);
  
  // API hooks
  const [pricings, { data: apiResponse, isLoading }] = useLazyGetPricingQuery();
  const [subscribe, { isLoading: isCheckoutLoading }] = useLazyCreateStripeSubscriptionV2Query();

  const stats = [
    {
      value: "$92",
      title: "Blended ARPU",
      subtitle: "Weighted average revenue per user",
    },
    {
      value: "85%",
      title: "Gross Margins",
      subtitle: "High-margin SaaS model",
    },
    {
      value: "8%",
      title: "Monthly Churn",
      subtitle: "Industry-competitive retention",
    },
    {
      value: "2.3x",
      title: "LTV/CAC Ratio",
      subtitle: "Healthy unit economics",
    },
  ];

  // Handle URL params from signup redirect
  useEffect(() => {
    const email = searchParams.get("email");
    const fullname = searchParams.get("fullname");
    const ref = searchParams.get("ref");

    if (email && fullname) {
      setUserEmail(email);
      setUserFullname(fullname);
      setIsFromSignup(true);
      if (ref) setUserRefCode(ref);
    }
  }, [searchParams]);

  useEffect(() => {
    pricings({});
  }, [pricings]);

  useEffect(() => {
    if (apiResponse?.data) {
      setPricingData(apiResponse.data);
    }
  }, [apiResponse]);

  // Error handling function
  const error = (err: string) => {
    messageApi.open({
      type: "error",
      content: err,
      icon: <MdCancel color="red" size={20} className="mr-2" />,
      style: {
        marginTop: "5vh",
        fontSize: 16,
      },
    });
  };

  // Direct checkout function for signup flow
  const proceedToCheckout = async (plan: any) => {
    if (!userEmail || !userFullname) {
      error("Missing user information. Please try again.");
      return;
    }

    const payload: {
      pricing_id: string;
      email: string;
      fullname: string;
      referral_code?: string;
    } = {
      pricing_id: plan.stripePriceId,
      email: userEmail,
      fullname: userFullname,
    };

    if (userRefCode) {
      payload.referral_code = userRefCode;
    }

    try {
      const response = await subscribe(payload).unwrap();
      
      if (response?.data?.url) {
        // Redirect to Stripe checkout
        if (window.top) {
          window.top.location.href = response.data.url;
        } else {
          window.open(response.data.url, "_blank");
        }
      } else {
        console.error("No checkout URL returned");
        error("Failed to create checkout session. Please try again.");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      error(err?.data?.message || "An error occurred during checkout");
    }
  };

  // Process pricing data to get plans for current billing interval
  const getProcessedPlans = () => {
    const currentInterval = isAnnual ? 'year' : 'month';
    const filteredPlans = pricingData.filter(plan => plan.interval === currentInterval);
    
    // Sort plans by price (ascending)
    const sortedPlans = filteredPlans.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    
    return sortedPlans.map((plan, index) => {
      // Determine if this is the default highlighted plan (Premium)
      const isDefaultHighlighted = plan.name.toUpperCase() === 'PREMIUM';
      
      // Calculate display price based on interval
      let displayPrice, priceLabel;
      if (plan.interval === 'year') {
        // For annual plans, show the full annual price
        displayPrice = parseFloat(plan.price).toFixed(0);
        priceLabel = "Per year";
      } else {
        // For monthly plans, show monthly price
        displayPrice = parseFloat(plan.price).toFixed(0);
        priceLabel = "Per month";
      }

      // Get features from meta_data or use fallback
      const features = plan.meta_data.features?.map(f => f.name) || [];
      
      // Get description from tooltip or generate based on plan name
      let description = plan.meta_data.tooltip || '';
      if (!description) {
        switch (plan.name.toUpperCase()) {
          case 'STARTER (PRO)':
          case 'STARTER':
            description = 'New sellers & small businesses';
            break;
          case 'PREMIUM':
            description = 'For growing sellers & established brands';
            break;
          case 'SAGE':
          case 'ENTERPRISE':
            description = 'Large sellers & enterprises';
            break;
          default:
            description = 'Professional plan';
        }
      }

      // Get notes and billing information
      const notes = plan.meta_data.notes || [];
      const billingNote = plan.meta_data.billing_note || 
                         (plan.interval === 'year' ? `Annual billing` : 'Monthly billing');
      
      // For monthly plans, prioritize upgrade notes and avoid annual billing notes
      // For annual plans, use billing notes or upgrade notes
      let upgradeNote;
      if (plan.interval === 'month') {
        // For monthly plans, find upgrade note or support note, avoid annual billing mentions
        upgradeNote = notes.find(note => 
          note.includes('upgrade') && !note.toLowerCase().includes('annual')
        ) || notes.find(note => note.includes('Support')) || 
        'Monthly subscription';
      } else {
        // For annual plans, use billing note or any relevant note
        upgradeNote = billingNote || 
                     notes.find(note => note.includes('upgrade')) || 
                     notes.find(note => note.includes('Support')) ||
                     'Annual subscription';
      }

      return {
        id: plan.id,
        name: plan.name, // Keep original name without modification
        price: parseInt(displayPrice),
        originalPrice: parseFloat(plan.price),
        priceLabel,
        description,
        features,
        note: upgradeNote,
        buttonText: billingNote,
        isDefaultHighlighted,
        stripePriceId: plan.id,
        interval: plan.interval,
        trial: plan.trial
      };
    });
  };

  const processedPlans = getProcessedPlans();

  // Set default selected plan when plans are loaded
  useEffect(() => {
    if (processedPlans.length > 0 && selectedPlanId === null) {
      const defaultPlan = processedPlans.find(plan => plan.isDefaultHighlighted) || processedPlans[0];
      setSelectedPlanId(defaultPlan.id);
    }
  }, [processedPlans, selectedPlanId]);

  // Reset selection when billing interval changes
  useEffect(() => {
    setSelectedPlanId(null);
  }, [isAnnual]);

  const toggleFeatures = (planId: number) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const handleCardClick = (planId: number) => {
    setSelectedPlanId(planId);
  };

  const handlePlanSelection = (plan: any) => {
    if (isFromSignup) {
      // Coming from signup - go directly to checkout
      proceedToCheckout(plan);
    } else {
      // Normal pricing page behavior
      console.log('Selected plan:', plan);
      // Add your normal plan selection logic here if needed
    }
  };

  // Update button text and loading state
  const getButtonText = (plan: any, isSelected: boolean) => {
    if (isFromSignup) {
      // Coming from signup flow
      if (isCheckoutLoading && isSelected) {
        return "Processing...";
      }
      return isSelected ? "Proceed to Checkout" : "Select plan";
    } else {
      // Normal pricing page
      return isSelected ? plan.buttonText : "Select plan";
    }
  };

  const isButtonLoading = (plan: any, isSelected: boolean) => {
    return isFromSignup && isSelected && isCheckoutLoading;
  };

  // Back to signup button component
  const BackToSignupButton = () => {
    if (!isFromSignup) return null;

    return (
      <div className="mb-6 text-center">
        <button
          onClick={() => {
            const signupUrl = new URL('/signUp', window.location.origin);
            signupUrl.searchParams.set('email', userEmail);
            signupUrl.searchParams.set('fullname', userFullname);
            signupUrl.searchParams.set('step', '1');
            if (userRefCode) {
              signupUrl.searchParams.set('ref', userRefCode);
            }
            router.push(signupUrl.toString());
          }}
          className="text-[#009F6D] hover:text-[#007A55] text-sm font-medium underline hover:no-underline transition-colors"
        >
          ← Back to signup
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <section className="bg-[#E7EBEE] py-12">
        <div className="max-w-5xl mx-auto lg:px-8">
          <div className="bg-white p-6 pb-20 rounded-3xl">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading pricing plans...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#E7EBEE] py-12 min-h-svh">
      {contextHolder}
      <div className="max-w-6xl mx-auto lg:px-8">
        <div className="bg-white p-6 pb-20 rounded-3xl">
          
          {/* Back button for signup users */}
          <BackToSignupButton />
          
          {/* Context message if coming from signup 
          {isFromSignup && (
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Plan
              </h2>
              <p className="text-gray-600">
                Select the package that best fits your needs, {userFullname}
              </p>
            </div>
          )}
            */}

          {/* Toggle */}
          <div className="flex justify-center mb-20">
            <div className="flex items-center space-x-4 bg-[#F3F8FB] rounded-full px-2 py-2">
              <button 
                onClick={() => setIsAnnual(false)}
                className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                  !isAnnual 
                    ? "text-white bg-[#0BAB79]" 
                    : "text-gray-600"
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                  isAnnual 
                    ? "text-white bg-[#0BAB79]" 
                    : "text-gray-600"
                }`}
              >
                Annually
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-6 md:grid-cols-3 ">
            {processedPlans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const isHighlighted = isSelected;
              
              return (
                <div
                  key={plan.id}
                  onClick={() => handleCardClick(plan.id)}
                  className={`rounded-2xl py-6 px-3 flex flex-col justify-between relative cursor-pointer transition-all duration-200 ${
                    isHighlighted
                      ? "bg-gradient-to-b from-[#08B27C] to-[#11946C] text-white scale-105 shadow-lg"
                      : "bg-white border border-[#D6D6D6] hover:border-[#08B27C] hover:shadow-md"
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 border border-[#08B27D] bg-white text-[#596375] text-xs px-3 py-1 rounded-full">
                      {isSelected ? "Selected" : "Most popular"}
                    </div>
                  )}
                  <div className="flex flex-col items-center space-y-4">
                    <h3
                      className={`text-2xl font-semibold text-center ${
                        isHighlighted ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-6xl text-center font-bold">
                      <span
                        className={`${
                          isHighlighted
                            ? "text-white"
                            : "bg-gradient-to-r from-[#11946C] to-[#08B27C] bg-clip-text text-transparent"
                        }`}
                      >
                        ${plan.price}
                      </span>
                    </p>
                    <div
                      className={`px-3 py-[2px] rounded-2xl text-white w-fit
                  ${isHighlighted ? "bg-[#232323]" : "bg-[#09AD7A]"}
                      `}
                    >
                      <span className="text-sm">{plan.priceLabel}</span>
                    </div>
                    <p
                      className={`mt-1 text-base text-center font-semibold ${
                        isHighlighted ? "text-white" : "text-[#222222]"
                      }`}
                    >
                      {plan.description}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm">
                      {/* Show first 5 features or all if expanded */}
                      {(expandedFeatures[plan.id] ? plan.features : plan.features.slice(0, 5)).map((feature, idx) => (
                        <li key={idx} className="flex gap-3">
                        <IoIosCheckmarkCircle fill={`${isHighlighted ? "white":"#009F6D"}`} className="flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      
                      {/* Show expand/collapse button if more than 5 features */}
                      {plan.features.length > 5 && (
                        <li className="ml-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card selection when clicking expand
                              toggleFeatures(plan.id);
                            }}
                            className={`text-xs font-medium underline hover:no-underline transition-colors ${
                              isHighlighted 
                                ? "text-white hover:text-gray-200" 
                                : "text-[#009F6D] hover:text-[#007A55]"
                            }`}
                          >
                            {expandedFeatures[plan.id] 
                              ? "Show less" 
                              : `+${plan.features.length - 5} more features`
                            }
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-6">
                    <p
                      className={`text-sm text-[#006D4B] w-full py-3 px-5 font-medium rounded-md bg-[#E0F4EE] text-center ${
                        isHighlighted ? "" : ""
                      }`}
                    >
                      {plan.note}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card selection when clicking button
                        handlePlanSelection(plan);
                      }}
                      disabled={!isSelected || isButtonLoading(plan, isSelected)}
                      className={`mt-3 w-full rounded-lg text-sm py-2 font-medium transition-all duration-200
                    ${
                      isSelected && !isButtonLoading(plan, isSelected)
                        ? isHighlighted
                          ? "bg-[#FFB951] text-white hover:bg-[#FF8E51] cursor-pointer"
                          : "bg-[#FFB951] text-white hover:bg-[#FF8E51] cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }
                  `}
                    >
                      {getButtonText(plan, isSelected)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Stats Section - Commented out as per original */}
        {/**
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white space-y-4 rounded-xl p-5 px-7">
              <p className="font-bold text-[#009F6D] text-4xl">{stat.value}</p>
              <p className="font-semibold text-[#3F3F3F] text-xl">
                {stat.title}
              </p>
              <p className="text-xs text-[#676A75]">{stat.subtitle}</p>
            </div>
          ))}
        </div>
         */}
      </div>
    </section>
  );
}