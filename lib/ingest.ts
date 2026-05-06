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
  try {
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

    const splits = await splitter.splitDocuments(docs)

    for (const doc of splits) {
      for (const key of Object.keys(doc.metadata)) {
        const val = doc.metadata[key]
        if (
          val !== null &&
          typeof val !== "string" &&
          typeof val !== "number" &&
          typeof val !== "boolean"
        ) {
          delete doc.metadata[key]
        }
      }
    }

    const embeddings = createOpenRouterEmbeddings()
    if (!embeddings) {
      throw new Error("Embeddings not created");
    }
    const vectorStore = new Chroma(embeddings, {
      collectionName: "assignment-3",
    })

    await vectorStore.addDocuments(splits)

    console.log("added document embeddings to vector store");
  } catch (error) {
    console.error(error);
  }
}
