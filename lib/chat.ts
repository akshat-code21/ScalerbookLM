import { client } from "./openrouter"
import { SYSTEM_PROMPT } from "./prompt"
import { executeCRAG } from "./crag"
import { ChatMessages } from "@openrouter/sdk/models"
import { ChatCompletionMessage, ChatCompletionMessageParam } from "openai/resources/index.mjs"

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
  ] as ChatCompletionMessageParam[]

  // const res = await client.chat.send({
  //   chatRequest: {
  //     model: "openai/gpt-oss-120b:free",
  //     messages,
  //   },
  // })

  const res = await client.chat.completions.create({
    messages,
    model: "gpt-5.4-nano"
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
  ] as ChatCompletionMessageParam[]

  const stream = await client.chat.completions.create({
    model: "gpt-5.4-nano",
    messages,
    stream: true,
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

