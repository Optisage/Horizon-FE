"use client";

import { useEffect, useRef, useState } from "react";
import { BsStars } from "react-icons/bs";
import { IoSend } from "react-icons/io5";

type Message = {
  sender: "ai" | "user";
  text: string;
};

const TotanChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Welcome" },
    { sender: "ai", text: "How may I help out today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Hold on while I generate the lead" },
      ]);
      setLoading(false);
    }, 1500);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <section className="flex flex-col gap-8 min-h-[50dvh] md:min-h-[80dvh] rounded-xl bg-white p-4 lg:p-5">
      {/* Header */}
      <div className="flex items-center gap-4 shadow-sm pb-4">
        <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center">
          <BsStars className="rotate-90 size-5" />
        </div>
        <h1 className="text-[#171717] font-medium text-xl md:text-2xl">
          Totan (AI)
        </h1>
      </div>

      {/* Chat messages */}
      <div className="flex flex-col gap-4 flex-1 max-h-[75dvh] sm:max-h-[60vh] overflow-y-auto pr-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
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
                  BA
                </div>
              )}
            </div>

            {/* Message bubble */}
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-base bg-[#ECF1F6] text-[#4B4B62] ${
                msg.sender === "ai" ? "rounded-bl-none" : "rounded-br-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading bubble */}
        {loading && (
          <div className="flex items-start gap-2 self-start">
            <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center text-base">
              <BsStars className="rotate-90 size-4" />
            </div>
            <div className="bg-[#ECF1F6] p-4 rounded-2xl text-sm flex gap-1 rounded-bl-none">
              <span className="bounce-dot animation-delay-0 size-2 bg-[#C7CCD6] rounded-full" />
              <span className="bounce-dot animation-delay-200 size-2 bg-[#C7CCD6] rounded-full" />
              <span className="bounce-dot animation-delay-300 size-2 bg-[#C7CCD6] rounded-full" />
              {/* <span className="bounce-dot animation-delay-400 size-2 bg-[#C7CCD6] rounded-full" /> */}
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
          className="absolute top-0 bottom-0 size-10 my-auto right-3 flex items-center justify-center gap-2 rounded-lg sm:w-[110px] sm:h-[42px] py-2 px-4 text-white font-semibold bg-primary hover:bg-primary/90 duration-150 transition-colors"
        >
          <span className="hidden sm:block">Send</span>
          <IoSend className="size-10 sm:size-5" />
        </button>
        <input
          className="flex-1 outline-none bg-transparent border border-[#D1D1D1] p-4 pr-32 rounded-2xl w-full focus:border-primary"
          placeholder="Ask anything"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
      </div>
    </section>
  );
};

export default TotanChat;

