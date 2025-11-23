import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, Grid, List, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ModelCard } from "@/components/ModelCard"
import { ModelModal } from "@/components/ModelModal"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { useBlockchainModels } from "@/hooks/useBlockchainModels"
import type { ModelManifest, ModelType } from "@/types/model"

// Fallback mock data for when no blockchain models exist
const mockModels: ModelManifest[] = [
  {
    id: "demo-1",
    name: "Welcome Demo Model",
    about: "This is a demo model. Upload your own models to see them here!",
    type: "text",
    tags: ["demo", "example"],
    thumbnailUrl: "/ai-brain-neural-network.jpg",
    pricing: { mode: "free" },
    framework: "Custom",
    author: "SynapseModel",
    createdAt: "2024-01-01",
  },
]

const modelTypes: { value: ModelType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "audio", label: "Audio" },
  { value: "multimodal", label: "Multimodal" },
  { value: "embedding", label: "Embedding" },
]

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
]

export default function Models() {
  const { models: blockchainModels, loading, error, refetch } = useBlockchainModels()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<ModelType | "all">("all")
  const [selectedTag, setSelectedTag] = useState<string | "all">("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedModel, setSelectedModel] = useState<ModelManifest | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const modelsPerPage = 9

  // Use blockchain models if available, fallback to mock data for demo
  const allModels = (!loading && blockchainModels.length === 0) ? mockModels : blockchainModels
  
  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    allModels.forEach((model) => model.tags.forEach((tag) => tags.add(tag)))
    return Array.from(tags).sort()
  }, [])

  // Filter and sort models
  const filteredModels = useMemo(() => {
    const filtered = allModels.filter((model) => {
      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.about.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesType = selectedType === "all" || model.type === selectedType
      const matchesTag = selectedTag === "all" || model.tags.includes(selectedTag)

      return matchesSearch && matchesType && matchesTag
    })

    // Sort models
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
        case "oldest":
          return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
        case "price-low":
          const priceA = a.pricing?.mode === "hourly" ? a.pricing.pricePerHour || 0 : 0
          const priceB = b.pricing?.mode === "hourly" ? b.pricing.pricePerHour || 0 : 0
          return priceA - priceB
        case "price-high":
          const priceA2 = a.pricing?.mode === "hourly" ? a.pricing.pricePerHour || 0 : 0
          const priceB2 = b.pricing?.mode === "hourly" ? b.pricing.pricePerHour || 0 : 0
          return priceB2 - priceA2
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [allModels, searchQuery, selectedType, selectedTag, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredModels.length / modelsPerPage)
  const paginatedModels = filteredModels.slice((currentPage - 1) * modelsPerPage, currentPage * modelsPerPage)

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedType("all")
    setSelectedTag("all")
    setSortBy("newest")
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Loading/Error States */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-balance">AI Models</h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-xl text-muted-foreground text-pretty">
            {loading ? 'Loading models from blockchain...' : 
             error ? 'Error loading models. Using demo data.' :
             blockchainModels.length > 0 ? 'Real models from blockchain' :
             'Demo models - upload your own to see them here!'}
          </p>
          
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                Failed to load models from blockchain: {error}. Showing demo data instead.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Success Alert */}
          {!loading && !error && blockchainModels.length > 0 && (
            <Alert className="mt-4">
              <AlertDescription>
                ✅ Successfully loaded {blockchainModels.length} models from the blockchain!
              </AlertDescription>
            </Alert>
          )}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg p-6 mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            {/* Search - takes up remaining space */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card/90 border-border/50"
                />
              </div>
            </div>

            {/* Sort - fixed width */}
            <div className="w-40">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-card/90 border-border/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-border/50">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{filteredModels.length} models found</span>
              {(searchQuery || selectedType !== "all" || selectedTag !== "all") && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
                <Grid className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Models Grid/List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
          {paginatedModels.length > 0 ? (
            <div
              className={
                viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" : "space-y-4 mb-8"
              }
            >
              {paginatedModels.map((model, index) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => {
                    console.log("🎯 Setting selected model:", {
                      id: model.id,
                      name: model.name,
                      blobId: model.blobId,
                      hasBlobId: !!model.blobId,
                      objectId: model.objectId,
                      uploader: model.uploader,
                      fullModel: model
                    })
                    setSelectedModel(model)
                  }}
                  className="cursor-pointer"
                >
                  <ModelCard model={model} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No models found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center items-center space-x-2"
          >
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1
              if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="text-muted-foreground">
                    ...
                  </span>
                )
              }
              return null
            })}

            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </motion.div>
        )}
      </main>

      <Footer />

      {/* Model Modal */}
      {selectedModel && (
        <ModelModal model={selectedModel} isOpen={!!selectedModel} onClose={() => setSelectedModel(null)} />
      )}
    </div>
  )
}