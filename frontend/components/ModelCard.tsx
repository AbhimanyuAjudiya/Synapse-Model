"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Clock, Zap } from "lucide-react"
import type { ModelManifest } from "@/types/model"

interface ModelCardProps {
  model: ModelManifest
}

export function ModelCard({ model }: ModelCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return "📝"
      case "image":
        return "🎨"
      case "audio":
        return "🎵"
      case "multimodal":
        return "🔗"
      case "embedding":
        return "🧠"
      default:
        return "🤖"
    }
  }

  const formatPrice = (pricing: ModelManifest["pricing"]) => {
    if (!pricing || pricing.mode === "free") return "Free"
    if (pricing.mode === "hourly" && pricing.pricePerHour) {
      return `${pricing.pricePerHour} POL/hr`
    }
    return "Custom"
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
      <Card className="model-card h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="aspect-video relative overflow-hidden rounded-lg mb-3">
            <img
              src={model.thumbnailUrl || "/placeholder.svg"}
              alt={model.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs bg-black/50 backdrop-blur-sm border-white/10">
                {getTypeIcon(model.type)} {model.type}
              </Badge>
            </div>
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="text-xs bg-black/50 backdrop-blur-sm border-white/10">
                {model.framework}
              </Badge>
            </div>
          </div>

          <h3 className="font-semibold text-lg text-balance">{model.name}</h3>
          <p className="text-sm text-muted-foreground text-pretty line-clamp-2">{model.about}</p>
        </CardHeader>

        <CardContent className="pb-3 flex-1">
          <div className="flex flex-wrap gap-1 mb-3">
            {model.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {model.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{model.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              <span>Instant</span>
            </div>
            <div className="flex items-center font-medium">
              <Zap className="w-4 h-4 mr-1 text-blue-400" />
              <span>{formatPrice(model.pricing)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full group btn-primary">
            Try Now
            <motion.div className="ml-2" whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
              →
            </motion.div>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
