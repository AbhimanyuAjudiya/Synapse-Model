"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Upload, Search } from "lucide-react"

export function GetStartedCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-chart-1/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Join thousands of developers and creators building the future of AI
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="group">
              <Search className="mr-2 w-4 h-4" />
              Explore Models
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="group bg-transparent">
              <Upload className="mr-2 w-4 h-4" />
              Upload Your Model
            </Button>
          </div>

          <div className="pt-8 text-sm text-muted-foreground">
            <p>Connect your wallet to start using the platform</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
