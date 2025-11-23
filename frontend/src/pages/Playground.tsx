import { useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Play, Copy, Download } from "lucide-react"

export default function Playground() {
  const { id } = useParams<{ id: string }>()
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)

  // Mock model data - in real app this would come from API
  const model = {
    id: id || "1",
    name: "GPT-4 Turbo",
    description: "Advanced language model for complex reasoning and creative tasks",
    type: "text",
    framework: "PyTorch",
    author: "OpenAI Labs"
  }

  const runModel = async () => {
    if (!input.trim()) return
    
    setIsRunning(true)
    // Simulate API call
    setTimeout(() => {
      setOutput(`Mock response for: "${input}"\n\nThis is a simulated response from the ${model.name} model. In a real implementation, this would connect to the actual model running on the Fluence network.`)
      setIsRunning(false)
    }, 2000)
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Model Playground</h1>
              <p className="text-lg text-muted-foreground">
                Test and interact with {model.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{model.type}</Badge>
              <Badge variant="outline">{model.framework}</Badge>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{model.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{model.description}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Author: {model.author}</span>
                <span>•</span>
                <span>Framework: {model.framework}</span>
                <span>•</span>
                <span>Type: {model.type}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Playground Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Input
                  <Button 
                    onClick={runModel} 
                    disabled={!input.trim() || isRunning}
                    className="ml-2"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isRunning ? "Running..." : "Run"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your prompt or input here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Output
                  {output && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyOutput}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[300px] p-4 bg-muted/50 rounded-md font-mono text-sm whitespace-pre-wrap">
                  {isRunning ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : output ? (
                    output
                  ) : (
                    <span className="text-muted-foreground">
                      Output will appear here after running the model...
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Usage Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Usage Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Best Practices</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Be specific and clear in your prompts</li>
                    <li>• Provide context when necessary</li>
                    <li>• Start with simple queries to understand the model</li>
                    <li>• Experiment with different input formats</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Limitations</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Responses are limited to model capabilities</li>
                    <li>• Processing time depends on input complexity</li>
                    <li>• Some content may be filtered for safety</li>
                    <li>• Usage costs apply for extended sessions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}