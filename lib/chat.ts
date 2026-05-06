import { client } from "./openrouter"
import { SYSTEM_PROMPT } from "./prompt"
import { retrieveContext } from "./retrieve"

export const chat = async (query: string) => {
  const context = await retrieveContext(query)
  const res = await client.chat.send({
    chatRequest: {
      model: "openai/gpt-oss-120b:free",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT.replace("{{document}}", context),
        },
        {
          role: "user",
          content: query,
        },
      ],
    },
  })
  return res.choices[0].message.content
}
