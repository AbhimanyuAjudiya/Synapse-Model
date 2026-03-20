"use client"

import { motion } from "framer-motion"
import { Trophy, ExternalLink } from "lucide-react"

const bounties = [
  {
    award: "$1,500",
    currency: "ETH",
    event: "ETHGlobal New Delhi 2025",
    track: "Fluence Track",
    glow: "shadow-yellow-500/10",
    border: "border-yellow-500/20",
    dot: "bg-yellow-400",
    amountColor: "text-yellow-400",
    link: "https://ethglobal.com/showcase/synapsemodel-00exr",
  },
  {
    award: "$1,000",
    currency: "Fluence Credits",
    event: "Fluence Network",
    track: "Decentralized Compute",
    glow: "shadow-blue-500/10",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
    amountColor: "text-blue-400",
    link: "https://x.com/fluence_project/status/1972731325351415895",
  },
  {
    award: "$10,000",
    currency: "AWS Credits",
    event: "Amazon Web Services",
    track: "Startup Build Program",
    glow: "shadow-violet-500/10",
    border: "border-violet-500/20",
    dot: "bg-violet-400",
    amountColor: "text-violet-400",
    link: null,
  },
]

export function Bounties() {
  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 mb-4"
        >
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Bounties Won
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </motion.div>

        {/* Cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {bounties.map((bounty, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className={`relative rounded-lg border ${bounty.border} bg-white/[0.03] shadow-lg ${bounty.glow} backdrop-blur-sm px-4 py-3 flex items-center gap-3`}
            >
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${bounty.dot}`} />
              <div className="min-w-0 flex-1">
                <div className={`text-lg font-bold leading-none ${bounty.amountColor}`}>
                  {bounty.award}
                  <span className="text-[10px] font-normal text-muted-foreground ml-1">{bounty.currency}</span>
                </div>
                <div className="text-xs text-foreground/80 font-medium mt-0.5 truncate">{bounty.event}</div>
                <div className="text-[10px] text-muted-foreground truncate">{bounty.track}</div>
              </div>
              {bounty.link && (
                <a
                  href={bounty.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
