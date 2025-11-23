"use client"

import { motion } from "framer-motion"
import { Accordion } from "@/components/Accordion"

const faqs = [
  {
    question: "How does the AI marketplace work?",
    answer:
      "Our marketplace connects AI model creators with users who need AI capabilities. Models are stored on Walrus, and metadata is stored on Sui blockchain for transparency and security.",
  },
  {
    question: "What types of AI models are supported?",
    answer:
      "We support various AI model types including text generation, image creation, audio processing, embeddings, and multimodal models. Popular frameworks like PyTorch, TensorFlow, and ONNX are all supported.",
  },
  {
    question: "How is pricing determined?",
    answer:
      "Model creators set their own pricing, typically charged per hour of usage. We also support free models and custom pricing arrangements. All payments are transparent and processed on-chain.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we prioritize security. Your data is processed securely, models are stored on decentralized Walrus storage, and all transactions are secured by Sui blockchain.",
  },
  {
    question: "How do I upload my own AI model?",
    answer:
      "Simply connect your wallet, go to the Upload page, provide your model details and files, set your pricing, and publish. Our platform handles the deployment and makes your model available to users worldwide.",
  },
  {
    question: "What wallets are supported?",
    answer:
      "We support all major Sui wallets including Sui Wallet, Suiet, and other Sui-compatible wallets. Make sure you're connected to the Sui network.",
  },
]

export function FAQ() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground text-pretty">
            Everything you need to know about our AI marketplace
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Accordion items={faqs} />
        </motion.div>
      </div>
    </section>
  )
}
