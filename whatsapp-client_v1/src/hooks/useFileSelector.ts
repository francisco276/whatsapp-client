import { useState } from 'react'

export type FileType = 'document' | 'image' | 'video'

export interface SelectedFile {
  id: string
  file: File
  name: string
  size: number
  type: FileType
  preview?: string
}

export const useFileSelector = () => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])

  const handleFileSelect = (type: FileType) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true

    if (type === 'document') input.accept = '.pdf,.doc,.docx,.txt,.xlsx,.pptx,.zip,.rar'
    if (type === 'image') input.accept = 'image/*'
    if (type === 'video') input.accept = 'video/*'

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (!target.files) return

      const files = Array.from(target.files)
      const newFiles: SelectedFile[] = files.map(file => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type,
        preview: type === 'image' ? URL.createObjectURL(file) : undefined
      }))

      setSelectedFiles(prev => [...prev, ...newFiles])
    }

    input.click()
  }

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== id))
  }

  const clearFiles = () => {
    setSelectedFiles([])
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    selectedFiles,
    handleFileSelect,
    removeFile,
    clearFiles,
    formatFileSize
  }
}
