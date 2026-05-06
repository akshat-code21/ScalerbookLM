"use client"
import { useState } from "react";
import Chat from "./Chat";
import Hero from "./Hero";
import { ChatMessages } from "@openrouter/sdk/models";
import ChatHistory from "./ChatHistory";

export default function Home() {
    const [input,setInput] = useState<string>("");
    const [messages,setMessages] = useState<ChatMessages[]>([]);
    const hasMessages = messages.length > 0;

    return (
        <div className={hasMessages ? "relative flex w-full flex-1 flex-col items-center justify-center gap-6 px-4 pt-8 pb-24" : "flex w-full flex-1 flex-col items-center justify-center gap-6 px-4 py-8"}>
            {!hasMessages && <Hero />}
            <ChatHistory messages={messages}/>
            <Chat input={input} setInput={setInput} messages={messages} setMessages={setMessages} />
        </div>
    )
}