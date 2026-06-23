import { createOpenRouterEmbeddings } from "./embedding"
import { QdrantVectorStore } from "@langchain/qdrant"
import { Document } from "@langchain/core/documents"

export const retrieveDocuments = async (query: string, topK = 4): Promise<Document[]> => {
  const embeddings = createOpenRouterEmbeddings()
  // const vectorStore = new Chroma(embeddings, {
  //   collectionName: "assignment-3",
  //   chromaCloudAPIKey: process.env.CHROMA_API_KEY,
  //   clientParams: {
  //     host: "api.trychroma.com",
  //     port: 8000,
  //     ssl: true,
  //     tenant: process.env.CHROMA_TENANT,
  //     database: process.env.CHROMA_DATABASE,
  //   },
  // })
  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: "assignment-3",
    apiKey: process.env.QDRANT_API_KEY,
  })

  return await vectorStore.similaritySearch(query, topK)
}

export const serializeDocuments = (docs: Document[]): string => {
  return docs
    .map((doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
    .join("\n\n")
}
