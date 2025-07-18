"use client"

import { useEffect, useRef, useState } from "react"
import { BsStars } from "react-icons/bs"
import { IoSend } from "react-icons/io5"
import {
  useChatMutation,
  useAnalyzeMutation,
  useLazyPurchaseQuantityQuery,
  useLazyChatHistoryQuery,
} from "./../../../../redux/api/totanAi" // Update this path to match your project structure
import { useAppSelector } from "@/redux/hooks"
 // Update this path to match your project structure

type Message = {
  sender: "ai" | "user"
  text: string
  type?: "analysis" | "chat" | "system"
}

type ConversationState =
  | "waiting_for_asin"
  | "waiting_for_cost_price"
  | "waiting_for_fulfillment"
  | "analyzing"
  | "chat_ready"

type AnalysisData = {
  session_id: string
  score: number
  category: string
  breakdown: {
    amazon_on_listing: number
    fba_sellers: number
    buy_box_eligible: number
    variation_listing: number
    sales_rank_impact: number
    estimated_demand: number
    offer_count: number
    profitability: number
  }
  roi: number
  profit_margin: number
  monthly_sales: number
}

const TotanChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Welcome to Totan AI! 🚀" },
    { sender: "ai", text: "I'll help you analyze Amazon products. Let's start!" },
    { sender: "ai", text: "Please provide the ASIN number of the product you'd like to analyze." },
  ])
  const [input, setInput] = useState("")
  const [conversationState, setConversationState] = useState<ConversationState>("waiting_for_asin")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [collectedData, setCollectedData] = useState({
    asin: "",
    costPrice: 0,
    isAmazonFulfilled: false,
  })

  const { marketplaceId } = useAppSelector((state) => state?.global)

  const chatEndRef = useRef<HTMLDivElement | null>(null)

  // API hooks
  const [analyzeProduct, { isLoading: isAnalyzing }] = useAnalyzeMutation()
  const [sendChat, { isLoading: isChatting }] = useChatMutation()
  const [getPurchaseQuantity] = useLazyPurchaseQuantityQuery()
  const [getChatHistory] = useLazyChatHistoryQuery()

  const validateASIN = (asin: string): boolean => {
    // Basic ASIN validation - should be 10 characters, alphanumeric
    const asinRegex = /^[A-Z0-9]{10}$/i
    return asinRegex.test(asin.trim())
  }

  const validateCostPrice = (price: string): number | null => {
    const numPrice = Number.parseFloat(price)
    return !isNaN(numPrice) && numPrice > 0 ? numPrice : null
  }

  const validateFulfillment = (response: string): boolean | null => {
    const normalized = response.toLowerCase().trim()
    if (normalized === "yes" || normalized === "y" || normalized === "true" || normalized === "1") {
      return true
    }
    if (normalized === "no" || normalized === "n" || normalized === "false" || normalized === "0") {
      return false
    }
    return null
  }

  const performAnalysis = async () => {
    setConversationState("analyzing")

    try {
      const result = await analyzeProduct({
        asin: collectedData.asin,
        costPrice: collectedData.costPrice,
        marketplaceId: marketplaceId,
        isAmazonFulfilled: collectedData.isAmazonFulfilled,
      }).unwrap()

      if (result.success) {
        const analysis = result.data
        setAnalysisData(analysis)
        setSessionId(analysis.session_id)
        setConversationState("chat_ready")

        // Add analysis results to chat
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

Now you can ask me any questions about this product! 💬`

        setMessages((prev) => [...prev, { sender: "ai", text: analysisMessage, type: "analysis" }])

        // Get purchase quantity data
        try {
          const quantityResult = await getPurchaseQuantity(collectedData.asin).unwrap()
          const quantityMessage = `📦 **Purchase Quantity Recommendations:**
• **Conservative Approach**: ${Math.round(quantityResult.conservative_quantity)} units
• **Aggressive Approach**: ${Math.round(quantityResult.aggressive_quantity)} units`

          setMessages((prev) => [...prev, { sender: "ai", text: quantityMessage, type: "analysis" }])
        } catch (error) {
          console.error("Failed to get purchase quantity:", error)
        }
      }
    } catch (error) {
      console.error("Analysis failed:", error)
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "❌ Sorry, I couldn't analyze this product. Please check the ASIN and try again. Let's start over - please provide a new ASIN.",
        },
      ])
      setConversationState("waiting_for_asin")
      setCollectedData({ asin: "", costPrice: 0, isAmazonFulfilled: false })
    }
  }

  const handleConversationalInput = async (userInput: string) => {
    const userMessage: Message = { sender: "user", text: userInput }
    setMessages((prev) => [...prev, userMessage])

    switch (conversationState) {
      case "waiting_for_asin":
        if (validateASIN(userInput)) {
          setCollectedData((prev) => ({ ...prev, asin: userInput.trim().toUpperCase() }))
          setMessages((prev) => [
            ...prev,
            { sender: "ai", text: `Great! I've got the ASIN: ${userInput.trim().toUpperCase()}` },
            { sender: "ai", text: "Now, what's the cost price of this product? (Enter the amount in USD, e.g., 125)" },
          ])
          setConversationState("waiting_for_cost_price")
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "ai",
              text: "❌ That doesn't look like a valid ASIN. ASINs are 10-character codes (letters and numbers). Please try again.",
            },
          ])
        }
        break

      case "waiting_for_cost_price":
        const price = validateCostPrice(userInput)
        if (price !== null) {
          setCollectedData((prev) => ({ ...prev, costPrice: price }))
          setMessages((prev) => [
            ...prev,
            { sender: "ai", text: `Perfect! Cost price set to $${price}` },
            {
              sender: "ai",
              text: "Last question: Is this product Amazon Fulfilled (FBA)? Please answer 'yes' or 'no'.",
            },
          ])
          setConversationState("waiting_for_fulfillment")
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "ai",
              text: "❌ Please enter a valid price (numbers only, greater than 0). For example: 125 or 99.99",
            },
          ])
        }
        break

      case "waiting_for_fulfillment":
        const fulfillment = validateFulfillment(userInput)
        if (fulfillment !== null) {
          setCollectedData((prev) => ({ ...prev, isAmazonFulfilled: fulfillment }))
          setMessages((prev) => [
            ...prev,
            { sender: "ai", text: `Got it! ${fulfillment ? "Amazon Fulfilled (FBA)" : "Merchant Fulfilled (FBM)"}` },
            { sender: "ai", text: "🔄 Now analyzing your product... This may take a moment." },
          ])
          await performAnalysis()
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "ai",
              text: "❌ Please answer with 'yes' or 'no' to indicate if the product is Amazon Fulfilled (FBA).",
            },
          ])
        }
        break

      case "chat_ready":
        if (!sessionId) return

        try {
          const result = await sendChat({
            session_id: sessionId,
            question: userInput,
          }).unwrap()

          if (result.success) {
            setMessages((prev) => [...prev, { sender: "ai", text: result.data.response, type: "chat" }])
          }
        } catch (error) {
          console.error("Chat failed:", error)
          setMessages((prev) => [
            ...prev,
            { sender: "ai", text: "❌ Sorry, I couldn't process your question. Please try again." },
          ])
        }
        break
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userInput = input.trim()
    setInput("")

    await handleConversationalInput(userInput)
  }

  const resetAnalysis = () => {
    setConversationState("waiting_for_asin")
    setSessionId(null)
    setAnalysisData(null)
    setCollectedData({ asin: "", costPrice: 0, isAmazonFulfilled: false })
    setMessages([
      { sender: "ai", text: "Welcome to Totan AI! 🚀" },
      { sender: "ai", text: "I'll help you analyze Amazon products. Let's start!" },
      { sender: "ai", text: "Please provide the ASIN number of the product you'd like to analyze." },
    ])
  }

  const getPlaceholderText = () => {
    switch (conversationState) {
      case "waiting_for_asin":
        return "Enter ASIN (e.g., B0D9YZJ3V7)..."
      case "waiting_for_cost_price":
        return "Enter cost price (e.g., 125)..."
      case "waiting_for_fulfillment":
        return "Type 'yes' or 'no'..."
      case "analyzing":
        return "Analyzing product..."
      case "chat_ready":
        return "Ask anything about this product..."
      default:
        return "Type your message..."
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <section className="flex flex-col gap-6 min-h-[50dvh] md:min-h-[80dvh]">
      {/* Header */}
      <div className="flex items-center justify-between shadow-sm pb-4">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center">
            <BsStars className="rotate-90 size-5" />
          </div>
          <div>
            <h1 className="text-[#171717] font-medium text-xl md:text-2xl">Totan (AI)</h1>
            {conversationState !== "waiting_for_asin" && (
              <p className="text-sm text-gray-500">
                {conversationState === "waiting_for_cost_price" && "Collecting cost price..."}
                {conversationState === "waiting_for_fulfillment" && "Checking fulfillment method..."}
                {conversationState === "analyzing" && "Analyzing product..."}
                {conversationState === "chat_ready" && "Ready for questions"}
              </p>
            )}
          </div>
        </div>
        {sessionId && (
          <button
            onClick={resetAnalysis}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            New Analysis
          </button>
        )}
      </div>

      {/* Chat messages */}
      <div className="flex flex-col gap-4 flex-1 max-h-[75dvh] sm:max-h-[60vh] overflow-y-auto pr-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${msg.sender === "ai" ? "self-start" : "self-end flex-row-reverse"}`}
          >
            {/* Avatar */}
            <div className="shrink-0">
              {msg.sender === "ai" ? (
                <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center text-base">
                  <BsStars className="rotate-90 size-5" />
                </div>
              ) : (
                <div className="size-10 rounded-full bg-[#4B4B62] text-white flex items-center justify-center text-base font-medium">
                  BA
                </div>
              )}
            </div>

            {/* Message bubble */}
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-base ${
                msg.type === "analysis"
                  ? "bg-blue-50 text-blue-900 border border-blue-200"
                  : msg.type === "system"
                    ? "bg-yellow-50 text-yellow-900 border border-yellow-200"
                    : "bg-[#ECF1F6] text-[#4B4B62]"
              } ${msg.sender === "ai" ? "rounded-bl-none" : "rounded-br-none"}`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>
            </div>
          </div>
        ))}

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
        <button
          type="button"
          aria-label="Send message"
          onClick={handleSend}
          disabled={isAnalyzing || isChatting || conversationState === "analyzing"}
          className="absolute top-0 bottom-0 size-10 my-auto right-3 flex items-center justify-center gap-2 rounded-lg sm:w-[110px] sm:h-[42px] py-2 px-4 text-white font-semibold bg-primary hover:bg-primary/90 disabled:bg-gray-300 duration-150 transition-colors"
        >
          <span className="hidden sm:block">Send</span>
          <IoSend className="size-10 sm:size-5" />
        </button>
        <input
          className="flex-1 outline-none bg-transparent border border-[#D1D1D1] p-4 pr-32 rounded-2xl w-full focus:border-primary"
          placeholder={getPlaceholderText()}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isAnalyzing || isChatting || conversationState === "analyzing"}
        />
      </div>
    </section>
  )
}

export default TotanChat
