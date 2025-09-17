"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { BsStars } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import { HiOutlineArrowPath } from "react-icons/hi2";
import {
  useChatMutation,
  useAnalyzeMutation,
  useLazyPurchaseQuantityQuery,
} from "./../../../../redux/api/totanAi"; // Ensure this path is correct for your project
import { useAppSelector, useAppDispatch } from "@/redux/hooks"; // Ensure this path is correct
import {
  createNewSession,
  addMessage,
  updateConversationState,
  updateSessionId,
  updateAnalysisData,
  updateCollectedData,
  selectCurrentSession,
  startNewAnalysisInSession,
} from "@/redux/slice/chatSlice"; // Ensure this path is correct

// Type definition for a single message
type Message = {
  sender: "ai" | "user";
  text: string;
  type?: "analysis" | "chat" | "system" | "error" | "retry";
  retryAction?: () => void;
};

/**
 * Custom hook for a typing animation effect.
 * @param text The full text to be typed out.
 * @param speed The speed of typing in milliseconds per character.
 * @returns An object containing the currently displayed text and a boolean indicating if typing is active.
 */
const useTypingEffect = (text: string, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    
    if (text.length === 0) {
      setIsTyping(false);
      return;
    }

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isTyping };
};

/**
 * A component to render an AI message with a typing effect.
 * It calls an onComplete callback once the animation finishes.
 */
const TypingMessage = ({ message, onComplete }: { message: Message; onComplete?: () => void }) => {
  const { displayedText, isTyping } = useTypingEffect(message.text, 20);
  const hasCompletedRef = useRef(false);
  
  useEffect(() => {
    if (!isTyping && !hasCompletedRef.current && onComplete) {
      hasCompletedRef.current = true;
      onComplete();
    }
  }, [isTyping, onComplete]);

  // Reset completion flag when the message text changes
  useEffect(() => {
    hasCompletedRef.current = false;
  }, [message.text]);

  return (
    <div className="flex items-start gap-2 self-start">
      <div className="shrink-0">
        <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center text-base">
          <BsStars className="rotate-90 size-5" />
        </div>
      </div>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-2xl text-base rounded-bl-none ${
          message.type === "analysis"
            ? "bg-blue-50 text-blue-900 border border-blue-200"
            : message.type === "system"
            ? "bg-yellow-50 text-yellow-900 border border-yellow-200"
            : message.type === "error"
            ? "bg-red-50 text-red-900 border border-red-200"
            : message.type === "retry"
            ? "bg-orange-50 text-orange-900 border border-orange-200"
            : "bg-[#ECF1F6] text-[#4B4B62]"
        }`}
      >
        <div className="whitespace-pre-line">
          {displayedText}
        </div>
        {message.type === "retry" && message.retryAction && (
          <button
            onClick={message.retryAction}
            className="mt-3 flex items-center gap-2 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg transition-colors text-sm font-medium"
          >
            <HiOutlineArrowPath className="size-4" />
            Retry Analysis
          </button>
        )}
      </div>
    </div>
  );
};

const TotanChat = () => {
  const dispatch = useAppDispatch();
  const currentSession = useAppSelector(selectCurrentSession);
  
  const [input, setInput] = useState("");
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(-1);

  const { marketplaceId } = useAppSelector((state) => state?.global);
  const { first_name, last_name } = useAppSelector((state) => state.api?.user) || {};
  
  const getUserInitials = () => {
    const firstInitial = first_name?.charAt(0)?.toUpperCase() || '';
    const lastInitial = last_name?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial || 'U';
  };

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [analyzeProduct, { isLoading: isAnalyzing }] = useAnalyzeMutation();
  const [sendChat, { isLoading: isChatting }] = useChatMutation();
  const [getPurchaseQuantity] = useLazyPurchaseQuantityQuery();

  // Initialize a chat session on component mount if one doesn't exist
  useEffect(() => {
    if (!currentSession) {
      dispatch(createNewSession({ firstName: first_name }));
    }
  }, [currentSession, dispatch, first_name]);
  
  const validateASIN = (asin: string): boolean => {
    const asinRegex = /^[A-Z0-9]{10}$/i;
    return asinRegex.test(asin.trim());
  };

  const validateCostPrice = (price: string): number | null => {
    const numPrice = Number.parseFloat(price);
    return !isNaN(numPrice) && numPrice > 0 ? numPrice : null;
  };

  const validateFulfillment = (response: string): boolean | null => {
    const normalized = response.toLowerCase().trim();
    if (normalized === "yes" || normalized === "y" || normalized === "true" || normalized === "1") return true;
    if (normalized === "no" || normalized === "n" || normalized === "false" || normalized === "0") return false;
    return null;
  };

  // Triggers the local typing animation state
  const addAIMessagesWithTyping = (newMessages: Message[]) => {
    setPendingMessages(newMessages);
    setCurrentTypingIndex(0);
  };

  // Called when a message is done typing; dispatches it to Redux and moves to the next
  const handleTypingComplete = () => {
    if (currentTypingIndex >= 0 && currentTypingIndex < pendingMessages.length) {
      dispatch(addMessage(pendingMessages[currentTypingIndex]));
      
      if (currentTypingIndex < pendingMessages.length - 1) {
        setTimeout(() => setCurrentTypingIndex(prev => prev + 1), 300); // Delay before next message
      } else {
        setPendingMessages([]);
        setCurrentTypingIndex(-1);
      }
    }
  };

  const performAnalysis = async () => {
    if (!currentSession) return;
    dispatch(updateConversationState("analyzing"));

    try {
      const result = await analyzeProduct({
        asin: currentSession.collectedData.asin,
        costPrice: currentSession.collectedData.costPrice,
        marketplaceId: marketplaceId,
        isAmazonFulfilled: currentSession.collectedData.isAmazonFulfilled,
      }).unwrap();

      if (result.success) {
        const analysis = result.data;
        dispatch(updateAnalysisData(analysis));
        dispatch(updateSessionId(analysis.session_id));
        dispatch(updateConversationState("chat_ready"));

        const analysisMessage = `🎉 **Analysis Complete!**

📊 **Overall Score**: ${analysis.score} (${analysis.category})
💰 **ROI**: ${analysis.roi}%
📈 **Profit Margin**: ${analysis.profit_margin}%
📦 **Monthly Sales**: ${analysis.monthly_sales.toLocaleString()} units

**Detailed Breakdown:**
• Amazon on Listing: ${analysis.breakdown.amazon_on_listing}
• FBA Sellers: ${analysis.breakdown.fba_sellers}
• Buy Box Eligible: ${analysis.breakdown.buy_box_eligible}
• Variation Listing: ${analysis.breakdown.variation_listing}
• Sales Rank Impact: ${analysis.breakdown.sales_rank_impact}
• Estimated Demand: ${analysis.breakdown.estimated_demand}
• Offer Count: ${analysis.breakdown.offer_count}
• Profitability: ${analysis.breakdown.profitability}

Now you can ask me any questions about this product! 💬`;

        const messagesToAdd: Message[] = [{ sender: "ai", text: analysisMessage, type: "analysis" }];
        
        try {
          const quantityResult = await getPurchaseQuantity(currentSession.collectedData.asin).unwrap();
          const quantityData = quantityResult.data;
          const quantityMessage = `📦 **Purchase Quantity Recommendations:**
• **Conservative Approach**: ${Math.round(quantityData.conservative_quantity)} units
• **Aggressive Approach**: ${Math.round(quantityData.aggressive_quantity)} units`;
          messagesToAdd.push({ sender: "ai", text: quantityMessage, type: "analysis" });
        } catch (error) {
          console.error("Failed to get purchase quantity:", error);
        }

        addAIMessagesWithTyping(messagesToAdd);
      }
    } catch (error: any) {
      console.error("Analysis failed:", error);
      
      // Check if it's a timeout error
      const isTimeoutError = error?.data?.error?.includes('cURL error 28') || 
                            error?.data?.error?.includes('Operation timed out') ||
                            error?.data?.message?.includes('timeout') ||
                            error?.message?.includes('timeout');

      if (isTimeoutError) {
        addAIMessagesWithTyping([
          {
            sender: "ai",
            text: "⏰ The analysis is taking longer than expected and timed out. This sometimes happens due to high server load or network issues.\n\nDon't worry, your product data is saved! You can try the analysis again.",
            type: "retry",
            retryAction: () => performAnalysis(),
          },
        ]);
      } else {
        addAIMessagesWithTyping([
          {
            sender: "ai",
            text: "❌ Sorry, I couldn't analyze this product. Please check the ASIN and try again. Let's start over - please provide a new ASIN.",
            type: "error",
          },
        ]);
        dispatch(updateConversationState("waiting_for_asin"));
        dispatch(updateCollectedData({ asin: "", costPrice: 0, isAmazonFulfilled: false }));
      }
    }
  };

  const handleConversationalInput = async (userInput: string) => {
    if (!currentSession) return;

    dispatch(addMessage({ sender: "user", text: userInput }));

    switch (currentSession.conversationState) {
      case "waiting_for_asin":
        if (validateASIN(userInput)) {
          const asin = userInput.trim().toUpperCase();
          dispatch(updateCollectedData({ asin }));
          addAIMessagesWithTyping([
            { sender: "ai", text: `Great! I've got the ASIN: ${asin}` },
            { sender: "ai", text: "Now, what will be the cost price of this product? (Enter the amount in USD, e.g., 125)" },
          ]);
          dispatch(updateConversationState("waiting_for_cost_price"));
        } else {
          addAIMessagesWithTyping([{ sender: "ai", text: "❌ That doesn't look like a valid ASIN. ASINs are 10-character codes (letters and numbers). Please try again." }]);
        }
        break;

      case "waiting_for_cost_price":
        const price = validateCostPrice(userInput);
        if (price !== null) {
          dispatch(updateCollectedData({ costPrice: price }));
          addAIMessagesWithTyping([
            { sender: "ai", text: `Perfect! Cost price set to $${price}` },
            { sender: "ai", text: "Last question: Will this product be Amazon Fulfilled (FBA)? Please answer 'yes' or 'no'." },
          ]);
          dispatch(updateConversationState("waiting_for_fulfillment"));
        } else {
          addAIMessagesWithTyping([{ sender: "ai", text: "❌ Please enter a valid price (numbers only, greater than 0). For example: 125 or 99.99" }]);
        }
        break;

      case "waiting_for_fulfillment":
        const fulfillment = validateFulfillment(userInput);
        if (fulfillment !== null) {
          dispatch(updateCollectedData({ isAmazonFulfilled: fulfillment }));
          addAIMessagesWithTyping([
            { sender: "ai", text: `Got it! ${fulfillment ? "Amazon Fulfilled (FBA)" : "Merchant Fulfilled (FBM)"}`},
            { sender: "ai", text: "🔄 Now analyzing your product... This may take a moment." },
          ]);
          await performAnalysis();
        } else {
          addAIMessagesWithTyping([{ sender: "ai", text: "❌ Please answer with 'yes' or 'no' to indicate if the product will be Amazon Fulfilled (FBA)." }]);
        }
        break;

      case "chat_ready":
        if (!currentSession.sessionId) return;
        try {
          const result = await sendChat({
            session_id: currentSession.sessionId,
            question: userInput,
          }).unwrap();
          if (result.success) {
            addAIMessagesWithTyping([{ sender: "ai", text: result.data.response, type: "chat" }]);
          }
        } catch (error) {
          console.error("Chat failed:", error);
          addAIMessagesWithTyping([{ sender: "ai", text: "❌ Sorry, I couldn't process your question. Please try again." }]);
        }
        break;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !currentSession) return;
    const userInput = input.trim();
    setInput("");
    await handleConversationalInput(userInput);
  };
  
  const startNewAnalysis = () => {
    dispatch(startNewAnalysisInSession({ firstName: first_name }));
  };

  const getPlaceholderText = () => {
    if (!currentSession) return "Loading session...";
    switch (currentSession.conversationState) {
      case "waiting_for_asin": return "Enter ASIN (e.g., B0D9YZJ3V7)...";
      case "waiting_for_cost_price": return "Enter cost price (e.g., 125)...";
      case "waiting_for_fulfillment": return "Type 'yes' or 'no'...";
      case "analyzing": return "Analyzing product...";
      case "chat_ready": return "Ask anything about this product...";
      default: return "Type your message...";
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages, currentTypingIndex]);

  if (!currentSession) {
    return (
      <section className="flex items-center justify-center min-h-[50dvh] md:min-h-[80dvh]">
        <p>Loading Chat...</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6 min-h-[50dvh] md:min-h-[80dvh]">
      {/* Header */}
      <div className="flex items-center justify-between shadow-sm pb-4">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center">
            <BsStars className="rotate-90 size-5" />
          </div>
          <div>
            <h1 className="text-[#171717] font-medium text-xl md:text-2xl">
              Totan (AI)
            </h1>
            {currentSession.conversationState !== "waiting_for_asin" && (
              <p className="text-sm text-gray-500">
                {currentSession.conversationState === "waiting_for_cost_price" && "Collecting cost price..."}
                {currentSession.conversationState === "waiting_for_fulfillment" && "Checking fulfillment method..."}
                {currentSession.conversationState === "analyzing" && "Analyzing product..."}
                {currentSession.conversationState === "chat_ready" && "Ready for questions"}
              </p>
            )}
          </div>
        </div>
        {currentSession.sessionId && (
          <button
            onClick={startNewAnalysis}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            New Analysis
          </button>
        )}
      </div>

      {/* Chat messages */}
      <div className="flex flex-col gap-4 flex-1 max-h-[75dvh] sm:max-h-[60vh] overflow-y-auto pr-2">
        {currentSession.messages.map((msg, idx) => (
          <div
            key={`${currentSession.id}-${idx}`} // Use a more stable key
            className={`flex items-start gap-2 ${
              msg.sender === "ai" ? "self-start" : "self-end flex-row-reverse"
            }`}
          >
            {/* Avatar */}
            <div className="shrink-0">
              {msg.sender === "ai" ? (
                <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center text-base">
                  <BsStars className="rotate-90 size-5" />
                </div>
              ) : (
                <div className="size-10 rounded-full bg-[#4B4B62] text-white flex items-center justify-center text-base font-medium">
                  {getUserInitials()}
                </div>
              )}
            </div>

            {/* Message bubble */}
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-base ${
                msg.type === "analysis"
                  ? "bg-blue-50 text-blue-900 border border-blue-200"
                  : msg.type === "system"
                  ? "bg-gray-100 text-gray-600 text-center font-medium text-sm"
                  : msg.type === "error"
                  ? "bg-red-50 text-red-900 border border-red-200"
                  : msg.type === "retry"
                  ? "bg-orange-50 text-orange-900 border border-orange-200"
                  : "bg-[#ECF1F6] text-[#4B4B62]"
              } ${msg.sender === "ai" ? "rounded-bl-none" : "rounded-br-none"} ${
                msg.type === "system" ? "w-full max-w-none mx-auto" : ""
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>
              {msg.type === "retry" && msg.retryAction && (
                <button
                  onClick={msg.retryAction}
                  className="mt-3 flex items-center gap-2 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg transition-colors text-sm font-medium"
                >
                  <HiOutlineArrowPath className="size-4" />
                  Retry Analysis
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Currently typing message */}
        {currentTypingIndex >= 0 && pendingMessages[currentTypingIndex] && (
          <TypingMessage 
            message={pendingMessages[currentTypingIndex]} 
            onComplete={handleTypingComplete}
          />
        )}

        {/* Loading bubble */}
        {(isAnalyzing || isChatting) && (
          <div className="flex items-start gap-2 self-start">
            <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center text-base">
              <BsStars className="rotate-90 size-4" />
            </div>
            <div className="bg-[#ECF1F6] p-4 rounded-2xl text-sm flex gap-1 rounded-bl-none">
              <span className="bounce-dot animation-delay-0 size-2 bg-[#C7CCD6] rounded-full" />
              <span className="bounce-dot animation-delay-200 size-2 bg-[#C7CCD6] rounded-full" />
              <span className="bounce-dot animation-delay-300 size-2 bg-[#C7CCD6] rounded-full" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input field */}
      <div className="relative">
        <input
          className="flex-1 outline-none bg-transparent border border-[#D1D1D1] p-4 pr-32 rounded-2xl w-full focus:border-primary"
          placeholder={getPlaceholderText()}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={
            isAnalyzing || isChatting || currentSession.conversationState === "analyzing" || currentTypingIndex >= 0
          }
        />
        
        {/* Send button */}
        <button
          type="button"
          aria-label="Send message"
          onClick={handleSend}
          disabled={
            isAnalyzing || isChatting || currentSession.conversationState === "analyzing" || currentTypingIndex >= 0
          }
          className="absolute top-0 bottom-0 size-10 my-auto right-16 sm:right-28 flex items-center justify-center gap-2 rounded-lg sm:w-[110px] sm:h-[42px] py-2 px-4 text-white font-semibold bg-primary hover:bg-primary/90 disabled:bg-gray-300 duration-150 transition-colors"
        >
          <span className="hidden sm:block">Send</span>
          <IoSend className="size-10 sm:size-5" />
        </button>
        
        {/* Voice icon button - positioned on the right side */}
        <button
          type="button"
          title="Use voice mode"
          aria-label="Voice input"
          className="absolute top-0 bottom-0 my-auto right-3 size-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MdOutlineKeyboardVoice className="size-5" />
        </button>
      </div>
    </section>
  );
};

export default TotanChat;