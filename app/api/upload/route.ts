import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { ingestFile } from "@/lib/ingest"

const UPLOAD_DIR = path.resolve(process.env.ROOT_PATH ?? "", "public/uploads")
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const body = Object.fromEntries(formData)
    const file = (body.file as Blob) || null

    const prefix = Date.now()

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR)
      }

      fs.writeFileSync(
        path.resolve(UPLOAD_DIR, `${prefix}-${(body.file as File).name}`),
        buffer
      )

      await ingestFile(body.file as File, `${prefix}-${(body.file as File).name}`)
    } else {
      return NextResponse.json({
        success: false,
      })
    }

    return NextResponse.json({
      success: true,
      name: `${prefix}-${(body.file as File).name}`,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    )
  }
}
