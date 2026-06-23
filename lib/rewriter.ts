import { client } from "./openrouter"

const REWRITE_PROMPT = `You are a query rewriter. The user's question failed to retrieve relevant documents from a knowledge base. Reformulate the question to improve retrieval.

This is attempt {iteration} of rewriting. Try a different angle or use alternative keywords and phrasing.

Original question: {originalQuery}
Previous rewrite (if any): {currentQuery}

Rules:
- Keep the same intent as the original question
- Use different keywords, synonyms, or rephrasings
- Make the query more specific or more general depending on what might help
- Output ONLY the rewritten question, nothing else
- Do NOT include any preamble, explanation, or thinking — just the rewritten question`

export async function rewriteQuery(
  originalQuery: string,
  currentQuery: string,
  iteration: number
): Promise<string> {
  const prompt = REWRITE_PROMPT
    .replace("{iteration}", String(iteration))
    .replace("{originalQuery}", originalQuery)
    .replace("{currentQuery}", currentQuery === originalQuery ? "N/A" : currentQuery)

  try {
    const res = await client.chat.send({
      chatRequest: {
        model: "qwen/qwen3-1.7b:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      },
    })

    const rewritten = (res.choices[0]?.message?.content ?? "").trim()

    if (!rewritten || rewritten.length < 3) {
      console.warn("[CRAG Rewriter] SLM returned empty/invalid response, keeping current query")
      return currentQuery
    }

    console.log(`[CRAG Rewriter] Iteration ${iteration}: "${currentQuery}" → "${rewritten}"`)
    return rewritten
  } catch (error) {
    console.error("[CRAG Rewriter] Error rewriting query:", error)
    return currentQuery
  }
}
