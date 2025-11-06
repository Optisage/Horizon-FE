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
 * Enhanced typing effect hook that simulates natural typing for the first 30-40 seconds,
 * then displays the rest of the message instantly
 */
const useNaturalTypingEffect = (
  text: string,
  maxTypingDuration: number = 35000
) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    setShowCursor(true);

    if (text.length === 0) {
      setIsTyping(false);
      setShowCursor(false);
      return;
    }

    let index = 0;
    let timeoutId: NodeJS.Timeout;
    let totalTimeElapsed = 0;
    const startTime = Date.now();

    const typeNextCharacter = () => {
      const currentTime = Date.now();
      totalTimeElapsed = currentTime - startTime;

      // If we've exceeded the max typing duration, show the rest of the text immediately
      if (totalTimeElapsed >= maxTypingDuration) {
        setDisplayedText(text);
        setIsTyping(false);
        setTimeout(() => setShowCursor(false), 500);
        return;
      }

      if (index >= text.length) {
        setIsTyping(false);
        // Hide cursor after a brief delay when done typing
        setTimeout(() => setShowCursor(false), 500);
        return;
      }

      const char = text[index];

      // Calculate dynamic delay based on character type
      let delay = 30; // Base delay

      if (char === " ") {
        delay = 50; // Slightly longer for spaces
      } else if (char === "." || char === "!" || char === "?") {
        delay = 300; // Pause at sentence endings
      } else if (char === "," || char === ";" || char === ":") {
        delay = 150; // Medium pause for punctuation
      } else if (char === "\n") {
        delay = 200; // Pause at line breaks
      } else if (/[a-zA-Z]/.test(char)) {
        // Variable speed for letters to simulate natural typing rhythm
        delay = Math.random() * 40 + 20; // 20-60ms
      } else if (/[0-9]/.test(char)) {
        delay = Math.random() * 30 + 25; // Numbers typed slightly slower
      }

      // Add occasional longer pauses to simulate thinking
      if (Math.random() < 0.03) {
        // 3% chance
        delay += Math.random() * 200 + 100; // Extra 100-300ms pause
      }

      // Faster typing for common words
      const upcomingWord = text.slice(index).split(" ")[0].toLowerCase();
      const commonWords = [
        "the",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
        "this",
        "that",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "have",
        "has",
        "had",
        "do",
        "does",
        "did",
        "will",
        "would",
        "could",
        "should",
        "can",
        "may",
        "might",
      ];

      if (
        commonWords.includes(upcomingWord) &&
        index > 0 &&
        text[index - 1] === " "
      ) {
        delay *= 0.7; // 30% faster for common words
      }

      // As we approach the time limit, speed up typing progressively
      const timeRatio = totalTimeElapsed / maxTypingDuration;
      if (timeRatio > 0.7) {
        // After 70% of the time has passed
        delay *= (1 - timeRatio) * 2; // Speed up significantly
        delay = Math.max(delay, 5); // But never go below 5ms
      }

      setDisplayedText(text.slice(0, index + 1));
      index++;

      timeoutId = setTimeout(typeNextCharacter, delay);
    };

    // Start typing with a small initial delay
    timeoutId = setTimeout(typeNextCharacter, 100);

    return () => clearTimeout(timeoutId);
  }, [text, maxTypingDuration]);

  // Cursor blinking effect
  useEffect(() => {
    if (!showCursor) return;

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530); // Natural cursor blink rate

    return () => clearInterval(cursorInterval);
  }, [showCursor, isTyping]);

  return {
    displayedText,
    isTyping,
    showCursor: showCursor && isTyping, // Only show cursor while typing
  };
};

/**
 * Enhanced TypingMessage component with natural typing effect and cursor
 */
const NaturalTypingMessage = ({
  message,
  onComplete,
}: {
  message: Message;
  onComplete?: () => void;
}) => {
  const { displayedText, isTyping, showCursor } = useNaturalTypingEffect(
    message.text
  );
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
        <div className="whitespace-pre-line relative">
          {displayedText}
          {showCursor && (
            <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" />
          )}
        </div>
        {message.type === "retry" && message.retryAction && !isTyping && (
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

  const { marketplaceId, currencyCode, currencySymbol } = useAppSelector((state) => state?.global);
  const { first_name, last_name } =
    useAppSelector((state) => state.api?.user) || {};

  const getUserInitials = () => {
    const firstInitial = first_name?.charAt(0)?.toUpperCase() || "";
    const lastInitial = last_name?.charAt(0)?.toUpperCase() || "";
    return firstInitial + lastInitial || "U";
  };

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [analyzeProduct, { isLoading: isAnalyzing }] = useAnalyzeMutation();
  const [sendChat, { isLoading: isChatting }] = useChatMutation();

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
    // Remove currency symbols and common formatting characters
    const cleanedPrice = price.replace(/[^0-9.]/g, '');
    const numPrice = Number.parseFloat(cleanedPrice);
    return !isNaN(numPrice) && numPrice > 0 ? numPrice : null;
  };

  const validateFulfillment = (response: string): boolean | null => {
    const normalized = response.toLowerCase().trim();
    if (
      normalized === "yes" ||
      normalized === "y" ||
      normalized === "true" ||
      normalized === "1"
    )
      return true;
    if (
      normalized === "no" ||
      normalized === "n" ||
      normalized === "false" ||
      normalized === "0"
    )
      return false;
    return null;
  };

  // Triggers the local typing animation state
  const addAIMessagesWithTyping = (newMessages: Message[]) => {
    setPendingMessages(newMessages);
    setCurrentTypingIndex(0);
  };

  // Called when a message is done typing; dispatches it to Redux and moves to the next
  const handleTypingComplete = () => {
    if (
      currentTypingIndex >= 0 &&
      currentTypingIndex < pendingMessages.length
    ) {
      dispatch(addMessage(pendingMessages[currentTypingIndex]));

      if (currentTypingIndex < pendingMessages.length - 1) {
        setTimeout(() => setCurrentTypingIndex((prev) => prev + 1), 300); // Delay before next message
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

        const analysisMessage = `🎉 Analysis Complete

📊 **Overall Score**: ${analysis.score} (${analysis.category})

You can now ask me any questions about this product's score and what it means for your business! 💬`;

        const messagesToAdd: Message[] = [
          { sender: "ai", text: analysisMessage, type: "analysis" },
        ];

        addAIMessagesWithTyping(messagesToAdd);
      }
    } catch (error: any) {
      console.error("Analysis failed:", error);

      // Check if it's a timeout error
      const isTimeoutError =
        error?.data?.error?.includes("cURL error 28") ||
        error?.data?.error?.includes("Operation timed out") ||
        error?.data?.message?.includes("timeout") ||
        error?.message?.includes("timeout");

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
        dispatch(
          updateCollectedData({
            asin: "",
            costPrice: 0,
            isAmazonFulfilled: false,
          })
        );
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
            {
              sender: "ai",
              text: `Now, what will be the cost price of this product? (Enter the amount in ${currencyCode}, e.g., ${currencySymbol}125)`,
            },
          ]);
          dispatch(updateConversationState("waiting_for_cost_price"));
        } else {
          addAIMessagesWithTyping([
            {
              sender: "ai",
              text: "❌ That doesn't look like a valid ASIN. ASINs are 10-character codes (letters and numbers). Please try again.",
            },
          ]);
        }
        break;

      case "waiting_for_cost_price":
        const price = validateCostPrice(userInput);
        if (price !== null) {
          dispatch(updateCollectedData({ costPrice: price }));
          addAIMessagesWithTyping([
            { sender: "ai", text: `Perfect! Cost price set to ${currencySymbol}${price.toFixed(2)}` },
            {
              sender: "ai",
              text: "Last question: Will this product be Amazon Fulfilled (FBA)? Please answer 'yes' or 'no'.",
            },
          ]);
          dispatch(updateConversationState("waiting_for_fulfillment"));
        } else {
          addAIMessagesWithTyping([
            {
              sender: "ai",
              text: `⚠️ Please enter a valid price (numbers only, greater than 0). For example: ${currencySymbol}125 or ${currencySymbol}99.99`,
            },
          ]);
        }
        break;

      case "waiting_for_fulfillment":
        const fulfillment = validateFulfillment(userInput);
        if (fulfillment !== null) {
          dispatch(updateCollectedData({ isAmazonFulfilled: fulfillment }));
          addAIMessagesWithTyping([
            {
              sender: "ai",
              text: `Got it! ${
                fulfillment
                  ? "Amazon Fulfilled (FBA)"
                  : "Merchant Fulfilled (FBM)"
              }`,
            },
            {
              sender: "ai",
              text: "🔄 Now analyzing your product... This may take a moment.",
            },
          ]);
          await performAnalysis();
        } else {
          addAIMessagesWithTyping([
            {
              sender: "ai",
              text: "❌ Please answer with 'yes' or 'no' to indicate if the product will be Amazon Fulfilled (FBA).",
            },
          ]);
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
            addAIMessagesWithTyping([
              { sender: "ai", text: result.data.response, type: "chat" },
            ]);
          }
        } catch (error) {
          console.error("Chat failed:", error);
          addAIMessagesWithTyping([
            {
              sender: "ai",
              text: "❌ Sorry, I couldn't process your question. Please try again.",
            },
          ]);
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
      case "waiting_for_asin":
        return "Enter ASIN (e.g., B0D9YZJ3V7)...";
      case "waiting_for_cost_price":
        return `Enter cost price in ${currencyCode} (e.g., ${currencySymbol}125)...`;
      case "waiting_for_fulfillment":
        return "Type 'yes' or 'no'...";
      case "analyzing":
        return "Analyzing product...";
      case "chat_ready":
        return "Ask anything about this product score...";
      default:
        return "Type your message...";
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
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh] rounded-xl bg-white p-4 lg:p-5">
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
                {currentSession.conversationState ===
                  "waiting_for_cost_price" && "Collecting cost price..."}
                {currentSession.conversationState ===
                  "waiting_for_fulfillment" && "Checking fulfillment method..."}
                {currentSession.conversationState === "analyzing" &&
                  "Analyzing product..."}
                {currentSession.conversationState === "chat_ready" &&
                  "Ready for questions"}
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
                  ? " text-blue-900 border border-blue-200"
                  : msg.type === "system"
                  ? "bg-gray-100 text-gray-600 text-center font-medium text-sm"
                  : msg.type === "error"
                  ? "bg-red-50 text-red-900 border border-red-200"
                  : msg.type === "retry"
                  ? "bg-orange-50 text-orange-900 border border-orange-200"
                  : "bg-[#ECF1F6] text-[#4B4B62]"
              } ${
                msg.sender === "ai" ? "rounded-bl-none" : "rounded-br-none"
              } ${msg.type === "system" ? "w-full max-w-none mx-auto" : ""}`}
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
          <NaturalTypingMessage
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
            isAnalyzing ||
            isChatting ||
            currentSession.conversationState === "analyzing" ||
            currentTypingIndex >= 0
          }
        />

        {/* Send button */}
        <button
          type="button"
          aria-label="Send message"
          onClick={handleSend}
          disabled={
            isAnalyzing ||
            isChatting ||
            currentSession.conversationState === "analyzing" ||
            currentTypingIndex >= 0
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