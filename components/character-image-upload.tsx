"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Camera, Trash2 } from "lucide-react"
import Image from "next/image"

interface CharacterImageUploadProps {
  initialImage?: string | null
  onImageChange: (imageData: string | null) => void
}

export default function CharacterImageUpload({ initialImage, onImageChange }: CharacterImageUploadProps) {
  const [image, setImage] = useState<string | null>(initialImage || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target?.result as string
      setImage(imageData)
      onImageChange(imageData)
      setIsUploading(false)
    }
    reader.onerror = () => {
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImage(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="border-[#5c3c2e] bg-[#2a1f1a]">
      <CardContent className="pt-6 flex flex-col items-center">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold text-[#ff6a39]">Imagen del Personaje</h3>
          <p className="text-sm text-[#c4a59d]">Sube una imagen para tu superviviente</p>
        </div>

        {image ? (
          <div className="relative w-40 h-40 mb-4">
            <Image
              src={image || "/placeholder.svg"}
              alt="Imagen del personaje"
              fill
              className="object-cover rounded-full border-4 border-[#a13b29]"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
              onClick={handleRemoveImage}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="w-40 h-40 rounded-full bg-[#3c2a20] flex items-center justify-center border-4 border-[#5c3c2e] mb-4">
            <Camera className="h-12 w-12 text-[#8a7a72]" />
          </div>
        )}

        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} ref={fileInputRef} />

        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="border-[#5c3c2e] bg-[#3c2a20] hover:bg-[#4c3a30] text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Subiendo..." : "Subir Imagen"}
        </Button>
      </CardContent>
    </Card>
  )
}
