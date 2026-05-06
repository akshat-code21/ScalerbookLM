import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { ingestFile } from "@/lib/ingest"

const UPLOAD_DIR = path.resolve(process.env.ROOT_PATH ?? "", "public/uploads")
export async function POST(req: NextRequest) {
  let storedFileName: string | undefined
  try {
    const formData = await req.formData()
    const body = Object.fromEntries(formData)
    const file = (body.file as Blob) || null

    const prefix = Date.now()

    if (file) {
      storedFileName = `${prefix}-${(body.file as File).name}`
      const buffer = Buffer.from(await file.arrayBuffer())
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR)
      }

      fs.writeFileSync(
        path.resolve(UPLOAD_DIR, storedFileName),
        buffer
      )

      await ingestFile(body.file as File, storedFileName)
    } else {
      return NextResponse.json({
        success: false,
      })
    }

    return NextResponse.json({
      success: true,
      name: storedFileName,
    })
  } catch (error) {
    console.error(error)
    if (storedFileName) {
      const filePath = path.resolve(UPLOAD_DIR, storedFileName)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      },
      {
        status: 500,
      }
    )
  }
}
