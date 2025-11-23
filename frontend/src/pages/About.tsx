import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Users, 
  Shield, 
  Zap, 
  Target, 
  Globe, 
  Rocket, 
  Code, 
  Database, 
  Network,
  TrendingUp,
  Award,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Server,
  Cloud
} from "lucide-react"

export default function About() {
  const features = [
    {
      icon: Brain,
      title: "Advanced AI Models",
      description: "Access cutting-edge AI models from leading researchers and developers worldwide, spanning from LLMs to computer vision and beyond.",
      badge: "50+ Models"
    },
    {
      icon: Users,
      title: "Global Community",
      description: "Join a thriving ecosystem of AI researchers, developers, and innovators collaborating to push the boundaries of artificial intelligence.",
      badge: "10K+ Developers"
    },
    {
      icon: Shield,
      title: "Decentralized & Secure",
      description: "Built on blockchain infrastructure ensuring complete transparency, immutable ownership, and censorship-resistant access to AI.",
      badge: "100% Decentralized"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized infrastructure delivers sub-second model loading and inference, making AI accessible at the speed of thought.",
      badge: "< 100ms Response"
    }
  ]

  const stats = [
    { number: "1M+", label: "API Calls Monthly", icon: TrendingUp },
    { number: "500+", label: "Active Developers", icon: Code },
    { number: "50+", label: "AI Models", icon: Brain },
    { number: "99.9%", label: "Uptime", icon: Award }
  ]

  const timeline = [
    {
      year: "2024",
      title: "Genesis",
      description: "Founded with a vision to democratize AI through Web3 technology"
    },
    {
      year: "Early 2024",
      title: "Alpha Launch",
      description: "First decentralized AI models deployed on testnet"
    },
    {
      year: "Mid 2024",
      title: "Mainnet Beta",
      description: "Public launch with core marketplace functionality"
    },
    {
      year: "Late 2024",
      title: "Community Growth",
      description: "Reached 10,000+ developers and 50+ AI models"
    },
    {
      year: "2025",
      title: "Future Vision",
      description: "Expanding to multi-chain support and enterprise solutions"
    }
  ]

  const techStack = [
    {
      category: "Blockchain",
      icon: Network,
      technologies: [
        { name: "Sui", description: "Main blockchain for smart contracts" },
      ]
    },
    {
      category: "Storage",
      icon: Database,
      technologies: [
        { name: "Walrus Storage", description: "Decentralized model storage" },
      ]
    },
    {
      category: "Compute",
      icon: Server,
      technologies: [
        { name: "Fluence Network", description: "Decentralized inference" },
      ]
    }
  ]

  const principles = [
    {
      icon: Globe,
      title: "Open Access",
      description: "AI should be accessible to everyone, regardless of geographic location or economic status."
    },
    {
      icon: Lock,
      title: "True Ownership",
      description: "Creators maintain full ownership and control over their AI models and intellectual property."
    },
    {
      icon: Shield,
      title: "Transparency",
      description: "All transactions, model performance, and governance decisions are fully transparent on-chain."
    },
    {
      icon: Users,
      title: "Community First",
      description: "Decisions are made by the community, for the community, through decentralized governance."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }
        
        .animate-delay-200 { animation-delay: 0.2s; }
        .animate-delay-400 { animation-delay: 0.4s; }
        .animate-delay-600 { animation-delay: 0.6s; }
        .animate-delay-800 { animation-delay: 0.8s; }
        .animate-delay-1000 { animation-delay: 1.0s; }
        
        .gradient-text {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        
        .icon-bounce:hover {
          animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-8px,0);
          }
          70% {
            transform: translate3d(0,-4px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }
      `}</style>
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fadeInUp">
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="text-sm px-4 py-2 bg-card/95 backdrop-blur-xl border border-border/50">
              <Sparkles className="w-4 h-4 mr-2" />
              Revolutionizing AI Access
            </Badge>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 text-balance gradient-text">
            The Future of AI is Decentralized
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto text-pretty mb-8 leading-relaxed">
            We're building the world's first truly decentralized AI marketplace where creators, developers, 
            and innovators come together to shape the future of artificial intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90">
              Explore Models <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-card/90 border-border/50">
              Join Community
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20 animate-fadeIn animate-delay-200">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="animate-scaleIn card-hover"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <Card className="text-center bg-card/95 backdrop-blur-xl border border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3 icon-bounce" />
                  <div className="text-3xl font-bold mb-1">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-20 animate-fadeInUp animate-delay-400">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the next generation of AI accessibility with features designed for the decentralized web.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-fadeInUp card-hover"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <Card className="h-full bg-card/95 backdrop-blur-xl border border-border/50 hover:border-primary/20 transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <feature.icon className="w-12 h-12 text-primary icon-bounce" />
                      <Badge variant="outline" className="bg-card/90 border-border/50">{feature.badge}</Badge>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="mb-20 animate-fadeInUp animate-delay-600">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-card/95 backdrop-blur-xl border border-primary/20 card-hover">
              <CardContent className="pt-8">
                <Target className="w-12 h-12 text-primary mb-4 icon-bounce" />
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  To democratize artificial intelligence by creating a decentralized marketplace 
                  where AI creators and users can connect directly, without intermediaries or 
                  centralized gatekeepers controlling access to transformative technology.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/95 backdrop-blur-xl border border-border/50 card-hover">
              <CardContent className="pt-8">
                <Rocket className="w-12 h-12 text-primary mb-4 icon-bounce" />
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  A future where AI innovation thrives in an open, transparent ecosystem where 
                  every breakthrough benefits humanity, creators are fairly compensated, and 
                  artificial intelligence serves as a force for global empowerment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Principles */}
        <div className="mb-20 animate-fadeInUp animate-delay-800">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Core Principles</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The fundamental values that guide everything we build and every decision we make.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {principles.map((principle, index) => (
              <div
                key={principle.title}
                className={`${index % 2 === 0 ? 'animate-slideInLeft' : 'animate-slideInRight'} card-hover`}
                style={{ animationDelay: `${0.9 + index * 0.1}s` }}
              >
                <Card className="bg-card/95 backdrop-blur-xl border border-border/50 hover:border-primary/20 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <principle.icon className="w-8 h-8 text-primary mt-1 flex-shrink-0 icon-bounce" />
                      <div>
                        <h4 className="text-lg font-semibold mb-2">{principle.title}</h4>
                        <p className="text-muted-foreground">{principle.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
         <div className="mb-20 animate-fadeInUp animate-delay-1000">
          <Card className="bg-card/95 backdrop-blur-xl border border-border/50">
            <CardHeader>
              <CardTitle className="text-center text-3xl sm:text-4xl flex items-center justify-center gap-3">
                <Cloud className="w-10 h-10 icon-bounce" />
                Built on Web3 Infrastructure
              </CardTitle>
              <p className="text-center text-muted-foreground text-lg mt-4">
                Leveraging the most advanced decentralized technologies for maximum security, 
                scalability, and censorship resistance.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {techStack.map((stack, index) => (
                  <div
                    key={stack.category}
                    className="flex flex-col items-center animate-fadeInUp"
                    style={{ animationDelay: `${1.1 + index * 0.1}s` }}
                  >
                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <stack.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-6 text-center">{stack.category}</h3>
                    <div className="space-y-4 w-full max-w-xs">
                      {stack.technologies.map((tech) => (
                        <div key={tech.name} className="text-center">
                          <div className="font-medium text-sm mb-1">{tech.name}</div>
                          <div className="text-xs text-muted-foreground leading-relaxed">{tech.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Call to Action */}
        <div className="text-center animate-fadeInUp">
          <Card className="bg-card/95 backdrop-blur-xl border border-primary/30 card-hover">
            <CardContent className="pt-12 pb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Join the Revolution?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Be part of the movement that's reshaping how the world accesses and benefits from artificial intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90">
                  <Users className="w-5 h-5 mr-2" />
                  Join Our Community
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-card/90 border-border/50">
                  <Code className="w-5 h-5 mr-2" />
                  Start Building
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}