import { Document } from "@langchain/core/documents"
import { client } from "./openrouter"

const GRADING_PROMPT = `You are a relevance grader assessing whether a retrieved document chunk is relevant to a user question.

If the document contains keywords, concepts, or semantic meaning related to the question, grade it as "relevant". It does not need to perfectly answer the question — just be topically related.

If the document is completely unrelated to the question, grade it as "irrelevant".

Retrieved document:
{document}

User question:
{question}

Respond with ONLY one word: "relevant" or "irrelevant"`

export type RelevanceGrade = "relevant" | "irrelevant"

export interface GradedDocument {
  doc: Document
  grade: RelevanceGrade
}

async function gradeDocument(
  query: string,
  doc: Document
): Promise<GradedDocument> {
  const prompt = GRADING_PROMPT
    .replace("{document}", doc.pageContent)
    .replace("{question}", query)

  try {
    const res = await client.chat.send({
      chatRequest: {
        model: "openai/gpt-oss-120b:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0,
      },
    })

    const response = (res.choices[0]?.message?.content ?? "")
      .trim()
      .toLowerCase()

    const grade: RelevanceGrade = response.includes("relevant")
      && !response.includes("irrelevant")
      ? "relevant"
      : "irrelevant"

    return { doc, grade }
  } catch (error) {
    console.error("[CRAG Grader] Error grading document:", error)
    return { doc, grade: "relevant" }
  }
}

export async function gradeDocuments(
  query: string,
  docs: Document[]
): Promise<GradedDocument[]> {
  console.log(`[CRAG Grader] Grading ${docs.length} documents for query: "${query}"`)

  const results = await Promise.all(
    docs.map((doc) => gradeDocument(query, doc))
  )

  const relevant = results.filter((r) => r.grade === "relevant").length
  const irrelevant = results.filter((r) => r.grade === "irrelevant").length
  console.log(`[CRAG Grader] Results: ${relevant} relevant, ${irrelevant} irrelevant`)

  return results
}
