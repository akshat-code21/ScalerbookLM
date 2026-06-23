import { client } from "./openrouter"
import { SYSTEM_PROMPT } from "./prompt"
import { executeCRAG } from "./crag"
import { ChatMessages } from "@openrouter/sdk/models"

export const chat = async (query: string) => {
  const cragResult = await executeCRAG(query)
  console.log(
    `[CRAG] action=${cragResult.action} iterations=${cragResult.iterations} finalQuery="${cragResult.finalQuery}"`
  )

  let messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT.replace("{{document}}", cragResult.context).replace(
        "{{question}}",
        query
      ),
    },
    {
      role: "user",
      content: query,
    },
  ] as ChatMessages[]

  const res = await client.chat.send({
    chatRequest: {
      model: "openai/gpt-oss-120b:free",
      messages,
    },
  })

  messages.push({
    role: "assistant",
    content: res.choices[0].message.content,
  })

  return res.choices[0].message.content
}

export const chatStream = async (query: string) => {
  const cragResult = await executeCRAG(query)
  console.log(
    `[CRAG] action=${cragResult.action} iterations=${cragResult.iterations} finalQuery="${cragResult.finalQuery}"`
  )

  let messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT.replace("{{document}}", cragResult.context).replace(
        "{{question}}",
        query
      ),
    },
    {
      role: "user",
      content: query,
    },
  ] as ChatMessages[]

  const stream = await client.chat.send({
    chatRequest: {
      model: "openai/gpt-oss-120b:free",
      messages,
      stream: true,
    },
  })

  const encoder = new TextEncoder()
  let response = ""
  const streamOutput = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content
          response += content
          if (content) {
            controller.enqueue(encoder.encode(content))
          }
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })

  messages.push({
    role: "assistant",
    content: response,
  })

  return streamOutput
}

