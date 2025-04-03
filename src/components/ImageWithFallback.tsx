"use client"

import { useState } from "react"
import { Package } from "lucide-react"

interface ImageWithFallbackProps {
  src: string | undefined
  alt: string
  className?: string
}

export function ImageWithFallback({ src, alt, className = "" }: ImageWithFallbackProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <Package className="h-10 w-10 text-muted-foreground" />
      </div>
    )
  }

  return <img src={src || "/placeholder.svg"} alt={alt} className={className} onError={() => setError(true)} />
}

