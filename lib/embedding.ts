import { OpenAIEmbeddings } from "@langchain/openai"

export function createOpenRouterEmbeddings() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set")
  }

  return new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey,
    encodingFormat: "float",
  })
}
