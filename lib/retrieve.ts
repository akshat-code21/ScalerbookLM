import { Chroma } from "@langchain/community/vectorstores/chroma"
import { createOpenRouterEmbeddings } from "./embedding"

export const retrieveContext = async (query: string) => {
  const embeddings = createOpenRouterEmbeddings()
  const vectorStore = new Chroma(embeddings, {
    collectionName: "assignment-3",
  })

  const retrievedDocs = await vectorStore.similaritySearch(query, 2)
  const serialized = retrievedDocs
    .map((doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
    .join("\n")
  return serialized
}
