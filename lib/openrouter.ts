// import { OpenAI } from "@langchain/openai"
// import { OpenRouter } from "@openrouter/sdk"
import { OpenAI } from "openai"

// export const client = new OpenRouter()
export const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY
})

