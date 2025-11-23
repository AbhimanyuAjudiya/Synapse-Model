"use client"

import { motion } from "framer-motion"
import { Shield, Zap, Globe, Coins } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Decentralized & Secure",
    description: "Built on Sui blockchain with Walrus storage for maximum security and decentralization.",
  },
  {
    icon: Zap,
    title: "Instant Deployment",
    description: "Deploy AI models instantly with Fluence runtime. No infrastructure management required.",
  },
  {
    icon: Globe,
    title: "Global Accessibility",
    description: "Access AI models from anywhere in the world with low-latency edge computing.",
  },
  {
    icon: Coins,
    title: "Fair Pricing",
    description: "Pay only for what you use with transparent, blockchain-based pricing and payments.",
  },
]

export function Features() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance">Why Choose Our Platform</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Experience the future of AI with our decentralized marketplace
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="feature-card text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-all"
              >
                <feature.icon className="w-8 h-8 text-blue-400" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-balance">{feature.title}</h3>
              <p className="text-muted-foreground text-pretty leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
