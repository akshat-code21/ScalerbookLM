import { ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Dispatch, SetStateAction } from "react"

export default function Chat({ input, setInput }: {
    input: string | undefined,
    setInput: Dispatch<SetStateAction<string | undefined>>
}) {
    return (
        <div className="flex w-full justify-center">
            <div className="relative w-full max-w-md">
                <Input
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
                    >
                        <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}