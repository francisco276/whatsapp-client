// utils/handleFileUpload.ts
import type { MultipartFile } from '@fastify/multipart'

export interface ProcessedFile {
  buffer: Buffer
  filename: string
  mimetype: string
  fieldname: string
}

export async function handleFileUpload (parts: AsyncIterable<MultipartFile | import('@fastify/multipart').MultipartValue>): Promise<{
  fields: Record<string, string>
  files: ProcessedFile[]
}> {
  const fields: Record<string, string> = {}
  const files: ProcessedFile[] = []

  for await (const part of parts) {
    if (part.type === 'file') {
      const chunks: Uint8Array[] = []
      for await (const chunk of part.file) chunks.push(chunk)
      const buffer = Buffer.concat(chunks)

      files.push({
        buffer,
        filename: part.filename,
        mimetype: part.mimetype,
        fieldname: part.fieldname
      })
    } else if (part.type === 'field') {
      fields[part.fieldname] = String(part.value)
    }
  }

  return { fields, files }
}
