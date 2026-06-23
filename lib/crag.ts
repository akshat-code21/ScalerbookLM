import { retrieveDocuments, serializeDocuments } from "./retrieve"
import { gradeDocuments } from "./grader"
import { rewriteQuery } from "./rewriter"

export type CRAGAction = "CORRECT" | "CORRECTED" | "MAX_ITERATIONS"

export interface CRAGResult {
  action: CRAGAction
  context: string
  iterations: number
  originalQuery: string
  finalQuery: string
}

export async function executeCRAG(
  query: string,
  maxIterations = 3
): Promise<CRAGResult> {
  console.log(`[CRAG] Starting corrective RAG pipeline for query: "${query}"`)

  let currentQuery = query

  for (let i = 1; i <= maxIterations; i++) {
    console.log(`[CRAG] --- Iteration ${i}/${maxIterations} ---`)
    console.log(`[CRAG] Retrieving with query: "${currentQuery}"`)

    // Step 1: Retrieve documents
    const docs = await retrieveDocuments(currentQuery)

    if (docs.length === 0) {
      console.log(`[CRAG] No documents retrieved, rewriting query...`)
      if (i < maxIterations) {
        currentQuery = await rewriteQuery(query, currentQuery, i)
        continue
      }
      // Last iteration with no docs — return empty context
      return {
        action: "MAX_ITERATIONS",
        context: "",
        iterations: i,
        originalQuery: query,
        finalQuery: currentQuery,
      }
    }

    // Step 2: Grade each document for relevance (LLM-as-judge)
    const gradedDocs = await gradeDocuments(currentQuery, docs)
    const relevantDocs = gradedDocs
      .filter((g) => g.grade === "relevant")
      .map((g) => g.doc)

    // Step 3: Check if we have relevant documents
    if (relevantDocs.length > 0) {
      const action: CRAGAction = i === 1 ? "CORRECT" : "CORRECTED"
      console.log(
        `[CRAG] Found ${relevantDocs.length} relevant doc(s) — action=${action}`
      )
      return {
        action,
        context: serializeDocuments(relevantDocs),
        iterations: i,
        originalQuery: query,
        finalQuery: currentQuery,
      }
    }

    // Step 4: All documents irrelevant — rewrite query and retry
    console.log(`[CRAG] All documents irrelevant in iteration ${i}`)
    if (i < maxIterations) {
      currentQuery = await rewriteQuery(query, currentQuery, i)
    }
  }

  // Exhausted all iterations — best-effort with last retrieval
  console.log(`[CRAG] Max iterations reached, using best-effort context`)
  const finalDocs = await retrieveDocuments(currentQuery)
  return {
    action: "MAX_ITERATIONS",
    context: serializeDocuments(finalDocs),
    iterations: maxIterations,
    originalQuery: query,
    finalQuery: currentQuery,
  }
}
