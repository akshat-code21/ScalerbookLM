import { ChatMessage } from "@langchain/core/messages"
import { client } from "./openrouter"
import { SYSTEM_PROMPT } from "./prompt"
import { retrieveContext } from "./retrieve"
import { ChatMessages, ChatRequest } from "@openrouter/sdk/models"

export const chat = async (query: string) => {
  const context = await retrieveContext(query)
  let messages = [{
    role: "system",
    content: SYSTEM_PROMPT.replace("{{document}}", context),
  },
  {
    role: "user",
    content: query,
  }
  ] as ChatMessages[]
  const res = await client.chat.send({
    chatRequest: {
      model: "openai/gpt-oss-120b:free",
      messages
    },
  })
  messages.push({
    role: "assistant",
    content: res.choices[0].message.content,
  })
  return res.choices[0].message.content
}
