"use client"
import { useState } from "react";
import Chat from "./Chat";
import Hero from "./Hero";

export default function Home() {
    const [input,setInput] = useState<string | undefined>();
    return (
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-6 px-4 py-8">
            <Hero />
            <Chat input={input} setInput={setInput} />
        </div>
    )
}