"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, type File, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileDropzoneProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  accept?: string
  maxFiles?: number
  maxSize?: number
  className?: string
}

export function FileDropzone({
  files,
  onFilesChange,
  accept,
  maxFiles = 5,
  maxSize = 100 * 1024 * 1024, // 100MB default
  className = "",
}: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setErrors([])
      const newErrors: string[] = []

      // Handle rejected files
      rejectedFiles.forEach((rejection) => {
        rejection.errors.forEach((error: any) => {
          if (error.code === "file-too-large") {
            newErrors.push(`${rejection.file.name} is too large (max ${formatFileSize(maxSize)})`)
          } else if (error.code === "file-invalid-type") {
            newErrors.push(`${rejection.file.name} has invalid file type`)
          } else {
            newErrors.push(`${rejection.file.name}: ${error.message}`)
          }
        })
      })

      // Check total file count
      if (files.length + acceptedFiles.length > maxFiles) {
        newErrors.push(`Maximum ${maxFiles} files allowed`)
        return
      }

      setErrors(newErrors)

      if (acceptedFiles.length > 0) {
        onFilesChange([...files, ...acceptedFiles])
      }
    },
    [files, onFilesChange, maxFiles, maxSize],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept
      ? accept.split(",").reduce(
          (acc, ext) => {
            acc[`application/${ext.replace(".", "")}`] = [ext]
            return acc
          },
          {} as Record<string, string[]>,
        )
      : undefined,
    maxSize,
    multiple: maxFiles > 1,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  })

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "py":
        return "🐍"
      case "js":
        return "📜"
      case "json":
        return "📋"
      case "yaml":
      case "yml":
        return "⚙️"
      case "md":
        return "📝"
      case "txt":
        return "📄"
      default:
        return "📁"
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <motion.div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive || dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
          ${files.length >= maxFiles ? "opacity-50 cursor-not-allowed" : ""}
        `}
        whileHover={{ scale: files.length >= maxFiles ? 1 : 1.02 }}
        whileTap={{ scale: files.length >= maxFiles ? 1 : 0.98 }}
      >
        <input {...getInputProps()} disabled={files.length >= maxFiles} />

        <motion.div animate={{ scale: isDragActive ? 1.1 : 1 }} transition={{ duration: 0.2 }} className="space-y-4">
          <div className="flex justify-center">
            <Upload className={`w-12 h-12 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
          </div>

          <div>
            <p className="text-lg font-medium">{isDragActive ? "Drop files here" : "Drag & drop files here"}</p>
            <p className="text-muted-foreground">
              or <span className="text-primary font-medium">browse files</span>
            </p>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            {accept && <p>Accepted formats: {accept}</p>}
            <p>
              Max {maxFiles} files, {formatFileSize(maxSize)} each
            </p>
            <p>
              {files.length}/{maxFiles} files selected
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {errors.map((error, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <h4 className="font-medium text-sm">Selected Files ({files.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-lg">{getFileIcon(file.name)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="text-destructive">
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
