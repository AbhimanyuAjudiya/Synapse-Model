import { Hero } from "@/components/Hero"
import { Navbar } from "@/components/Navbar"
import { ExploreModels } from "@/components/ExploreModels"
import { Features } from "@/components/Features"
import { VideoEmbed } from "@/components/VideoEmbed"
import { FAQ } from "@/components/FAQ"
import { Footer } from "@/components/Footer"
import { GetStartedCTA } from "@/components/GetStartedCTA"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <ExploreModels />
        <Features />
        <VideoEmbed />
        <FAQ />
        <GetStartedCTA />
      </main>
      <Footer />
    </div>
  )
}