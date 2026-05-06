import path from "node:path"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv"
import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured"
import { Chroma } from "@langchain/community/vectorstores/chroma"
import { createOpenRouterEmbeddings } from "./embedding"

const uploadDir = () =>
  path.resolve(process.env.ROOT_PATH ?? "", "public/uploads")

export const ingestFile = async (file: File, storedFileName?: string) => {
  const filePath = path.join(uploadDir(), storedFileName ?? file.name)
  let docs
  if (file.type === "application/pdf") {
    const loader = new PDFLoader(filePath)
    docs = await loader.load()
  } else if (file.type === "text/csv") {
    const loader = new CSVLoader(filePath)
    docs = await loader.load()
  } else {
    const loader = new UnstructuredLoader(filePath)
    docs = await loader.load()
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 0,
  })

  const documents = await splitter.splitDocuments(docs)

  const embeddings = createOpenRouterEmbeddings()
  const vectorStore = new Chroma(embeddings, {
    collectionName: "assignment-3",
  })

  await vectorStore.addDocuments(documents)
}
