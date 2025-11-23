"use client"

import { motion } from "framer-motion"
import { Play } from "lucide-react"
import { useState } from "react"

export function VideoEmbed() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">See It In Action</h2>
          <p className="text-xl text-muted-foreground text-pretty">
            Watch how easy it is to deploy and use AI models on our platform
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-chart-1/20 border border-border/50"
        >
          {!isPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(true)}
                className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-2xl"
              >
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              </motion.button>
            </div>
          ) : (
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="AI Marketplace Demo"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}

          {/* Placeholder content when not playing */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-chart-1/10 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-2xl font-semibold mb-2">Platform Demo</h3>
                <p className="text-muted-foreground">Click to watch our platform in action</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
