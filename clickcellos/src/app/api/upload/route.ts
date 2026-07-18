import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_FILE_SIZE = 10 * 1024 * 1024

function isValidImage(buffer: Buffer, mime: string): boolean {
  const header = buffer.subarray(0, 8)
  if (mime === "image/jpeg") return header[0] === 0xFF && header[1] === 0xD8
  if (mime === "image/png") return header[0] === 0x89 && header[1] === 0x50
  if (mime === "image/webp") return header[0] === 0x52 && header[1] === 0x49
  if (mime === "image/gif") return header[0] === 0x47 && header[1] === 0x49
  return false
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido. Envie JPEG, PNG, WebP ou GIF." }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Arquivo muito grande. O limite é 10MB." }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  if (!isValidImage(buffer, file.type)) {
    return NextResponse.json({ error: "Conteúdo do arquivo não corresponde ao tipo informado" }, { status: 400 })
  }

  const ext = path.extname(file.name) || ".jpg"
  const fileName = `${crypto.randomUUID()}${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads")

  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, fileName), buffer)

  const url = `/uploads/${fileName}`

  return NextResponse.json({ url }, { status: 201 })
}
