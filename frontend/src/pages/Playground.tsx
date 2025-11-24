import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Play, Copy, Download, Loader2, Trash2, Clock } from "lucide-react"
import { useBlockchainModels } from "@/hooks/useBlockchainModels"
import type { ModelManifest } from "@/types/model"

const INSTANCE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes in milliseconds
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000'

export default function Playground() {
  const { id } = useParams<{ id: string }>()
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const { models, loading: modelsLoading } = useBlockchainModels()
  const [model, setModel] = useState<ModelManifest | null>(null)
  const [isCreatingInstance, setIsCreatingInstance] = useState(false)
  const [isDeletingInstance, setIsDeletingInstance] = useState(false)
  const [instanceError, setInstanceError] = useState<string | null>(null)
  const [instanceData, setInstanceData] = useState<any>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [instanceCreatedAt, setInstanceCreatedAt] = useState<number | null>(null)

  useEffect(() => {
    if (!modelsLoading && models.length > 0 && id) {
      const foundModel = models.find(m => m.id === id)
      if (foundModel) {
        setModel(foundModel)
      }
    }
  }, [id, models, modelsLoading])

  // Manual instance creation function
  const handleCreateInstance = async () => {
    if (!model || !model.objectId || instanceData) return

    setIsCreatingInstance(true)
    setInstanceError(null)

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/instances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blob_id: model.objectId
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create instance')
      }

      const data = await response.json()
      // console.log('Instance created:', data)
      setInstanceData(data)
      setInstanceCreatedAt(Date.now())
      setTimeRemaining(INSTANCE_TIMEOUT_MS)
    } catch (error) {
      console.error('Failed to create instance:', error)
      setInstanceError(error instanceof Error ? error.message : 'Failed to create instance')
    } finally {
      setIsCreatingInstance(false)
    }
  }

  // Manual instance deletion function
  const handleDeleteInstance = async () => {
    if (!instanceData || !instanceData.instance_id) return

    setIsDeletingInstance(true)
    setInstanceError(null)

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/instances/${instanceData.instance_id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to delete instance')
      }

      // console.log('Instance deleted:', instanceData.instance_id)
      setInstanceData(null)
      setInstanceCreatedAt(null)
      setTimeRemaining(0)
      setOutput("")
      setInput("")
    } catch (error) {
      console.error('Failed to delete instance:', error)
      setInstanceError(error instanceof Error ? error.message : 'Failed to delete instance')
    } finally {
      setIsDeletingInstance(false)
    }
  }

  // Countdown timer effect
  useEffect(() => {
    if (!instanceCreatedAt || !instanceData) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - instanceCreatedAt
      const remaining = INSTANCE_TIMEOUT_MS - elapsed

      if (remaining <= 0) {
        // Time's up, auto-delete the instance
        clearInterval(interval)
        setTimeRemaining(0)
        handleDeleteInstance()
      } else {
        setTimeRemaining(remaining)
      }
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [instanceCreatedAt, instanceData])

  // Format time remaining as MM:SS
  const formatTimeRemaining = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Delete instance when component unmounts (page closes or navigates away)
  useEffect(() => {
    return () => {
      if (instanceData && instanceData.instance_id) {
        const deleteUrl = `${BACKEND_API_URL}/api/instances/${instanceData.instance_id}`
        
        fetch(deleteUrl, {
          method: 'DELETE',
          keepalive: true
        }).catch(() => {
          navigator.sendBeacon(deleteUrl)
        })
        
        // console.log('Deleting instance:', instanceData.instance_id)
      }
    }
  }, [instanceData])

  if (modelsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Loading model...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Model not found</p>
        </div>
        <Footer />
      </div>
    )
  }

  const runModel = async () => {
    if (!input.trim()) return
    
    // Check if instance is available
    if (!instanceData || !instanceData.public_ip) {
      setOutput("Error: No instance available. Please create an instance first.")
      return
    }
    
    setIsRunning(true)
    setOutput("")
    
    try {
      const predictUrl = `http://${instanceData.public_ip}:8000/predict`
      
      const response = await fetch(predictUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: input
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Handle different response formats
      if (typeof data === 'string') {
        setOutput(data)
      } else if (data.result) {
        setOutput(data.result)
      } else if (data.prediction) {
        setOutput(data.prediction)
      } else if (data.output) {
        setOutput(data.output)
      } else {
        setOutput(JSON.stringify(data, null, 2))
      }
    } catch (error) {
      console.error('Failed to run model:', error)
      setOutput(`Error: ${error instanceof Error ? error.message : 'Failed to connect to model instance'}`)
    } finally {
      setIsRunning(false)
    }
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
              <p className="text-muted-foreground mb-4">{model.about}</p>
              <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                <span>Author: {model.author || "Unknown"}</span>
                <span>•</span>
                <span>Framework: {model.framework}</span>
                <span>•</span>
                <span>Type: {model.type}</span>
              </div>
              
              {/* Instance Creation Section */}
              {!instanceData && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium mb-1">Instance Required</p>
                      <p className="text-sm text-muted-foreground">
                        Create an instance to start using this model
                      </p>
                    </div>
                    <Button 
                      onClick={handleCreateInstance}
                      disabled={isCreatingInstance || !model.objectId}
                      className="ml-4"
                    >
                      {isCreatingInstance ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Create Instance
                        </>
                      )}
                    </Button>
                  </div>
                  {instanceError && (
                    <p className="text-sm text-red-500 mt-2">{instanceError}</p>
                  )}
                  {isCreatingInstance && (
                    <p className="text-xs text-muted-foreground mt-2">
                      This may take a few minutes...
                    </p>
                  )}
                </div>
              )}
              
              {instanceData && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-green-600">Instance Ready</p>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeRemaining(timeRemaining)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Instance ID: {instanceData.instance_id}
                      </p>
                      {instanceData.public_ip && (
                        <p className="text-sm text-muted-foreground">
                          IP: {instanceData.public_ip}
                        </p>
                      )}
                    </div>
                    <Button 
                      onClick={handleDeleteInstance}
                      disabled={isDeletingInstance}
                      variant="destructive"
                      size="sm"
                      className="ml-4"
                    >
                      {isDeletingInstance ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Instance
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Instance will automatically terminate in {formatTimeRemaining(timeRemaining)}
                  </div>
                  {instanceError && (
                    <p className="text-sm text-red-500 mt-2">{instanceError}</p>
                  )}
                </div>
              )}
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