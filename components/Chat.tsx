"use client"
import { ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Dispatch, SetStateAction } from "react"
import axios from "axios"
import { ChatMessages } from "@openrouter/sdk/models"

export default function Chat({ input, setInput, messages, setMessages }: {
    input: string,
    setInput: Dispatch<SetStateAction<string>>
    messages: ChatMessages[]
    setMessages: Dispatch<SetStateAction<ChatMessages[]>>
}) {
    const hasMessages = messages.length > 0;

    const handleSend = async () => {
        const query = input;

        try {
            setMessages((prevMessages) => [...prevMessages, {
                role: "user",
                content: query
            }])
            setInput("");
            const {data} = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
                query
            })
            setMessages((prevMessages) => [...prevMessages, {
                role: "assistant",
                content: data.response
            }])
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div className={hasMessages ? "absolute inset-x-0 bottom-0 z-20 w-full bg-background px-4 py-4" : "flex w-full justify-center"}>
            <div className={hasMessages ? "relative w-full" : "relative w-full max-w-md"}>
                <Input
                    value={input}
                    className="h-10 min-h-10 rounded-full py-2 pr-12 pl-4 shadow-sm"
                    placeholder="Message ScalerbookLM..."
                    onChange={(e) => setInput(e.target.value)}
                />
                <div className="pointer-events-none absolute inset-y-0 right-1 z-10 flex items-center">
                    <Button
                        type="submit"
                        size="icon-sm"
                        variant="default"
                        aria-label="Send message"
                        className="pointer-events-auto rounded-full shadow-sm touch-manipulation active:translate-y-0!"
                        onClick={handleSend}
                    >
                        <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}