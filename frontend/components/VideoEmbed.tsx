"use client"

import { motion } from "framer-motion"

export function VideoEmbed() {
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
          <iframe
            src="https://www.youtube.com/embed/YVkswhpFN3Q"
            title="AI Marketplace Demo"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      </div>
    </section>
  )
}
