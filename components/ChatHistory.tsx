import { ChatMessages } from "@openrouter/sdk/models";

export default function ChatHistory({ messages }: { messages: ChatMessages[] }) {
    return (
        <div className="flex flex-col gap-4">
            {messages.map((message, index) => (
                <div key={index}>{message.content}</div>
            ))}
        </div>
    )
}