"use client";

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  FileBarChart,
  Lightbulb,
  AlertTriangle,
  Send,
  Brain,
  Zap,
  Sparkles,
  Clock,
  User,
  Bot,
  ChevronDown,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Verified,
  Layers,
  RefreshCw,
  Upload,
  FileText,
  X,
  FileUp,
  Shield,
  Lock,
  Filter,
  Cpu,
  MapPin,
  Building,
  Calendar,
  Hash,
  TrendingUp,
  AlertOctagon,
  Target,
  PieChart,
  Network,
  LineChart,
  BarChart,
  PieChart as PieChartIcon,
  GitMerge,
  FishSymbol,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  sources?: Source[];
  entities?: Entity[];
  visualization?: VisualizationData;
  modelUsed?: string;
  confidence?: number;
  processingTime?: number;
  enhanced_metadata?: any;
  recommendations?: any[];
  advanced_reasoning?: any;
  retrieval_metadata?: any;
  security_level?: string;
  analysis_results?: AnalysisResult[];
}

interface Source {
  id: string;
  content: string;
  metadata: {
    source: string;
    category: string;
    classification?: string;
    date?: string;
    author?: string;
  };
  score: number;
  type?: string;
  relevance?: string;
}

interface Entity {
  id: string;
  name: string;
  type:
    | "person"
    | "organization"
    | "location"
    | "date"
    | "event"
    | "threat"
    | "technology"
    | "issue"
    | "trend";
  confidence: number;
  metadata?: {
    description?: string;
    relevance?: string;
    count?: number;
  };
}

interface VisualizationData {
  type:
    | "heatmap"
    | "timeline"
    | "network"
    | "chart"
    | "bar_chart"
    | "line_chart"
    | "pie_chart"
    | "quadrant"
    | "swot"
    | "fishbone"
    | "causality"
    | "threat_matrix";
  data: any;
  title: string;
  description?: string;
}

interface AnalysisResult {
  type: string;
  title: string;
  data: any;
  narrative?: string;
  insights?: string[];
  recommendations?: string[];
}

// AI Persona configurations
const AI_PERSONAS = {
  analyst: {
    name: "Analis Intelijen",
    description: "Ahli analisis ancaman dan pattern recognition",
    icon: Brain,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  technical: {
    name: "Analis Teknis",
    description: "Spesialis analisis teknis dan forensik",
    icon: Cpu,
    color: "bg-green-100 text-green-700 border-green-200",
  },
  innovator: {
    name: "Innovator",
    description: "Spesialis generasi ide dan solusi kreatif",
    icon: Lightbulb,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  risk: {
    name: "Risk Monitor",
    description: "Ahli monitoring dan analisis risiko",
    icon: AlertOctagon,
    color: "bg-red-100 text-red-700 border-red-200",
  },
  strategist: {
    name: "Strategist",
    description: "Ahli analisis strategis dan perencanaan",
    icon: Target,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

// Model configurations
const AVAILABLE_MODELS = {
  llama: {
    name: "Llama 3.1",
    description: "Model terbaru Meta dengan kemampuan reasoning yang baik",
    icon: Brain,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  mistral: {
    name: "Mistral 7B",
    description: "Model efisien dengan performa tinggi untuk ukuran 7B",
    icon: Zap,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

// Classification levels
const CLASSIFICATION_LEVELS = {
  Rahasia: {
    name: "Rahasia",
    description: "Informasi sangat rahasia",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: Lock,
  },
  Terbatas: {
    name: "Terbatas",
    description: "Informasi terbatas untuk kalangan tertentu",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: Shield,
  },
  Internal: {
    name: "Internal",
    description: "Informasi internal organisasi",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Filter,
  },
  Publik: {
    name: "Publik",
    description: "Informasi dapat diakses publik",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: Verified,
  },
};

// Query templates dengan fokus pada analisis visual
const QUERY_TEMPLATES = {
  qa: [
    "Apa pola serangan siber yang paling umum pada kuartal ini?",
    "Bagaimana tren ancaman terhadap infrastruktur kritis?",
    "Siapa aktor ancaman utama yang teridentifikasi?",
  ],
  summary: [
    "Buatkan ringkasan eksekutif laporan ancaman terkini",
    "Summarize temuan utama dari analisis intelijen bulan ini",
    "Buatkan poin-poin penting dari laporan keamanan siber",
  ],
  ide: [
    "Generate ide-ide inovatif untuk meningkatkan deteksi ancaman",
    "Brainstorm solusi kreatif untuk masalah keamanan cloud",
    "Sarankan pendekatan baru untuk security awareness training",
  ],
  risk: [
    "Monitor risiko keamanan siber terkini untuk organisasi kami",
    "Analisis tingkat risiko dari kerentanan yang baru ditemukan",
    "Identifikasi emerging threats yang perlu diprioritaskan",
  ],
  visual: [
    "Buat visualisasi jaringan hubungan antara aktor ancaman",
    "Analisis tren serangan siber 6 bulan terakhir dengan line chart",
    "Buat peta panas distribusi geografis serangan siber",
    "Visualisasi analisis SWOT untuk strategi keamanan kami",
    "Buat diagram fishbone untuk analisis root cause incident",
  ],
};

// Entity type configurations
const ENTITY_TYPES = {
  person: {
    icon: User,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    label: "Orang",
  },
  organization: {
    icon: Building,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    label: "Organisasi",
  },
  location: {
    icon: MapPin,
    color: "bg-green-100 text-green-700 border-green-200",
    label: "Lokasi",
  },
  date: {
    icon: Calendar,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    label: "Tanggal",
  },
  event: {
    icon: Calendar,
    color: "bg-red-100 text-red-700 border-red-200",
    label: "Event",
  },
  threat: {
    icon: AlertTriangle,
    color: "bg-red-100 text-red-700 border-red-200",
    label: "Ancaman",
  },
  technology: {
    icon: Cpu,
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    label: "Teknologi",
  },
  issue: {
    icon: AlertOctagon,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Isu",
  },
  trend: {
    icon: TrendingUp,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    label: "Tren",
  },
};

// Visualization type configurations
const VISUALIZATION_TYPES = {
  network: {
    icon: Network,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    label: "Network Analysis",
  },
  timeline: {
    icon: LineChart,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    label: "Timeline Analysis",
  },
  bar_chart: {
    icon: BarChart,
    color: "bg-green-100 text-green-700 border-green-200",
    label: "Comparative Analysis",
  },
  pie_chart: {
    icon: PieChartIcon,
    color: "bg-pink-100 text-pink-700 border-pink-200",
    label: "Distribution Analysis",
  },
  quadrant: {
    icon: GitMerge,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    label: "Quadrant Analysis",
  },
  swot: {
    icon: Target,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    label: "SWOT Analysis",
  },
  fishbone: {
    icon: FishSymbol,
    color: "bg-red-100 text-red-700 border-red-200",
    label: "Root Cause Analysis",
  },
  causality: {
    icon: Workflow,
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    label: "Causal Analysis",
  },
  threat_matrix: {
    icon: AlertOctagon,
    color: "bg-gray-100 text-gray-700 border-gray-200",
    label: "Threat Matrix",
  },
};

// Base URL configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

// Mode configurations
const MODE_CONFIG = {
  qa: {
    name: "Q&A",
    description: "Tanya jawab langsung dengan sistem",
    icon: MessageSquare,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    persona: "analyst" as keyof typeof AI_PERSONAS,
  },
  summary: {
    name: "Summary",
    description: "Ringkasan dan ekstraksi informasi",
    icon: FileText,
    color: "bg-green-100 text-green-700 border-green-200",
    persona: "analyst" as keyof typeof AI_PERSONAS,
  },
  ide: {
    name: "Ide Generator",
    description: "Generasi ide kreatif dan solusi inovatif",
    icon: Lightbulb,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    persona: "innovator" as keyof typeof AI_PERSONAS,
  },
  risk: {
    name: "Risk Monitoring",
    description: "Monitoring dan analisis risiko keamanan",
    icon: AlertOctagon,
    color: "bg-red-100 text-red-700 border-red-200",
    persona: "risk" as keyof typeof AI_PERSONAS,
  },
  visual: {
    name: "Visual Analysis",
    description: "Analisis visual dan data visualization",
    icon: PieChartIcon,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    persona: "strategist" as keyof typeof AI_PERSONAS,
  },
};

interface AIQueryInputProps {
  onProcessComplete?: (data: any) => void;
  initialMode?: string;
  initialPersona?: string;
  initialModel?: string;
  onModeChange?: (mode: string) => void;
  onPersonaChange?: (persona: string) => void;
  onModelChange?: (model: string) => void;
}

const AIQueryInput = forwardRef((props: AIQueryInputProps, ref) => {
  const [query, setQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState<keyof typeof MODE_CONFIG>(
    (props.initialMode as keyof typeof MODE_CONFIG) || "visual"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<
    keyof typeof AI_PERSONAS
  >((props.initialPersona as keyof typeof AI_PERSONAS) || "strategist");
  const [showChat, setShowChat] = useState(true);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState<
    "disconnected" | "connected" | "error"
  >("disconnected");
  const [selectedModel, setSelectedModel] = useState<string>(
    props.initialModel || "llama"
  );

  // State untuk tampilan tab
  const [activeTab, setActiveTab] = useState<
    "answer" | "sources" | "entities" | "visualization" | "analysis"
  >("answer");

  // Enhanced features automatically enabled
  const useEnhanced = true;
  const enableClassification = true;
  const enableToolCalling = true;
  const enableSecurityPolicies = true;

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadMetadata, setUploadMetadata] = useState({
    category: "cybersecurity",
    classification: "Internal" as keyof typeof CLASSIFICATION_LEVELS,
    tags: [] as string[],
  });
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper functions dengan error handling yang lebih baik
  const safeArray = <T,>(data: any): T[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data as T[];
    if (typeof data === "object") {
      try {
        return Object.values(data) as T[];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Fungsi untuk memvalidasi dan memperbaiki data analysis
  const validateAndFixAnalysisData = (data: any): any => {
    if (!data) return { items: [] };

    // Jika data sudah memiliki items yang merupakan array, return as is
    if (data.items && Array.isArray(data.items)) {
      return data;
    }

    // Jika data adalah array, wrap dalam object dengan items
    if (Array.isArray(data)) {
      return { items: data };
    }

    // Jika data adalah object tapi tidak memiliki items, coba ekstrak array dari properti yang ada
    if (typeof data === "object") {
      const arrayKeys = Object.keys(data).filter((key) =>
        Array.isArray(data[key])
      );

      if (arrayKeys.length > 0) {
        // Gunakan array pertama yang ditemukan
        return { items: data[arrayKeys[0]], originalData: data };
      }

      // Jika tidak ada array, coba konversi object ke array of values
      try {
        const values = Object.values(data);
        return { items: values, originalData: data };
      } catch {
        return { items: [], originalData: data };
      }
    }

    // Fallback: return empty items
    return { items: [] };
  };

  const transformEntities = (entities: any): Entity[] => {
    if (!entities) return [];
    try {
      const entitiesArray = safeArray<any>(entities);
      return entitiesArray.map((entity, index) => ({
        id: entity.id || `entity-${index}`,
        name: entity.name || entity.text || entity.label || `Entity ${index}`,
        type: (entity.type || "person") as Entity["type"],
        confidence:
          typeof entity.confidence === "number" ? entity.confidence : 0.8,
        metadata: {
          description: entity.description,
          relevance: entity.relevance,
          count: entity.count,
        },
      }));
    } catch (error) {
      console.error("Error transforming entities:", error);
      return [];
    }
  };

  const transformSources = (sources: any): Source[] => {
    if (!sources) return [];
    try {
      const sourcesArray = safeArray<any>(sources);
      return sourcesArray.map((source, index) => ({
        id: source.id || `source-${index}`,
        content:
          source.content ||
          source.data ||
          source.text ||
          "No content available",
        metadata: {
          source:
            source.metadata?.source ||
            source.source ||
            source.type ||
            "Unknown Source",
          category: source.metadata?.category || source.category || "General",
          classification:
            source.metadata?.classification ||
            source.classification ||
            "Publik",
          date: source.metadata?.date || source.date,
          author: source.metadata?.author || source.author,
        },
        score:
          typeof source.score === "number"
            ? source.score
            : typeof source.enhanced_score === "number"
            ? source.enhanced_score
            : 0.8,
        type: source.type,
        relevance: source.relevance_category || source.relevance,
      }));
    } catch (error) {
      console.error("Error transforming sources:", error);
      return [];
    }
  };

  // Effect untuk sync initial values dari props
  useEffect(() => {
    if (props.initialMode)
      setSelectedMode(props.initialMode as keyof typeof MODE_CONFIG);
    if (props.initialPersona)
      setSelectedPersona(props.initialPersona as keyof typeof AI_PERSONAS);
    if (props.initialModel) setSelectedModel(props.initialModel);
  }, [props.initialMode, props.initialPersona, props.initialModel]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    setMode: (mode: keyof typeof MODE_CONFIG) => {
      setSelectedMode(mode);
      const newPersona = MODE_CONFIG[mode].persona;
      setSelectedPersona(newPersona);
      props.onPersonaChange?.(newPersona);
    },
    setPersona: (persona: keyof typeof AI_PERSONAS) => {
      setSelectedPersona(persona);
    },
    setModel: (model: string) => {
      setSelectedModel(model);
    },
    setQuery: (newQuery: string) => {
      setQuery(newQuery);
    },
  }));

  // Handler untuk mode change
  const handleModeChange = (mode: keyof typeof MODE_CONFIG) => {
    setSelectedMode(mode);
    props.onModeChange?.(mode);
    const newPersona = MODE_CONFIG[mode].persona;
    setSelectedPersona(newPersona);
    props.onPersonaChange?.(newPersona);
  };

  const handlePersonaChange = (persona: keyof typeof AI_PERSONAS) => {
    setSelectedPersona(persona);
    props.onPersonaChange?.(persona);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    props.onModelChange?.(model);
  };

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken") || "";
    }
    return "";
  };

  // API Functions
  const testConnection = async () => {
    try {
      console.log(`Testing connection to: ${BASE_URL}`);
      const response = await fetch(`${BASE_URL}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Health check response:", data);
      return data.status === "healthy";
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  };

  const advancedQuery = async (
    question: string,
    options: {
      model?: string;
      enable_classification?: boolean;
      enable_tool_calling?: boolean;
      enable_pii_masking?: boolean;
      enable_security_scan?: boolean;
      enable_formatting?: boolean;
      persona?: string;
      user_role?: string;
    } = {}
  ) => {
    try {
      const enhancedOptions = {
        model: selectedModel,
        enable_classification: true,
        enable_tool_calling: true,
        enable_pii_masking: true,
        enable_security_scan: true,
        enable_formatting: true,
        persona: selectedPersona,
        user_role: "analyst",
        ...options,
      };

      console.log(`Sending enhanced query: "${question}" dengan fitur aktif`);

      const token = getToken();
      const response = await fetch(`${BASE_URL}/api/chat/advanced-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          ...enhancedOptions,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Enhanced query failed: ${response.status}`, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`Enhanced query successful`, data);
      return data;
    } catch (error) {
      console.error("Enhanced query error:", error);
      throw error;
    }
  };

  const visualAnalysisQuery = async (
    question: string,
    analysis_type: string = "auto"
  ) => {
    try {
      console.log(`Sending visual analysis query: "${question}"`);

      const token = getToken();
      const response = await fetch(`${BASE_URL}/api/chat/visual-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question,
          analysis_type,
          model: selectedModel,
          visualization_format: "chartjs",
          enable_narrative: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Visual analysis failed: ${response.status}`, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`Visual analysis successful`, data);
      return data;
    } catch (error) {
      console.error("Visual analysis error:", error);
      throw error;
    }
  };

  // Initialize dengan welcome message
  useEffect(() => {
    setChatHistory([
      {
        id: "1",
        content:
          "🚀 **Enhanced RAG System dengan Visual Analysis Ready!**\n\nSemua fitur analisis visual dan naratif telah diaktifkan. Pilih mode Visual Analysis untuk memulai!",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);

    testApiConnection();
  }, []);

  // Auto-scroll ke bawah chat
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, showChat]);

  const scrollToBottom = () => {
    if (messagesEndRef.current && showChat) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  };

  // Update textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  const testApiConnection = async () => {
    setIsProcessing(true);
    setError("");
    try {
      const isConnected = await testConnection();
      if (isConnected) {
        setApiStatus("connected");
        setChatHistory((prev) => [
          {
            id: "1",
            content:
              "✅ **Semua Sistem Berjalan Optimal!**\n\nEnhanced RAG dengan Visual Analysis siap digunakan!",
            role: "assistant",
            timestamp: new Date(),
          },
        ]);
        setError("");
      } else {
        setApiStatus("error");
        setError(
          `Tidak dapat terhubung ke backend di ${BASE_URL}. Pastikan server backend berjalan.`
        );
      }
    } catch (error) {
      setApiStatus("error");
      setError(
        `Koneksi gagal: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const processQuery = async (userQuery: string): Promise<ChatMessage> => {
    const startTime = Date.now();

    try {
      let result;
      if (selectedMode === "visual") {
        result = await visualAnalysisQuery(userQuery);
      } else {
        result = await advancedQuery(userQuery);
      }

      const processingTime = Date.now() - startTime;

      const transformedSources = transformSources(result.sources);
      const transformedEntities = transformEntities(result.entities);

      // Transform visualization data dengan error handling yang lebih baik
      let transformedVisualization: VisualizationData | undefined;
      let analysisResults: AnalysisResult[] = [];

      try {
        // Handle multiple analysis results
        if (result.analysis_results && Array.isArray(result.analysis_results)) {
          analysisResults = result.analysis_results.map(
            (analysis: any, index: number) => ({
              type: analysis.type || "chart",
              title: analysis.title || `Analysis ${index + 1}`,
              data: validateAndFixAnalysisData(analysis.data), // PERBAIKAN: gunakan fungsi validasi
              narrative: analysis.narrative,
              insights: safeArray<string>(analysis.insights),
              recommendations: safeArray<string>(analysis.recommendations),
            })
          );
        } else if (
          result.visualization &&
          typeof result.visualization === "object"
        ) {
          // Handle single visualization
          transformedVisualization = {
            type: result.visualization.type || "chart",
            data: validateAndFixAnalysisData(result.visualization.data), // PERBAIKAN: gunakan fungsi validasi
            title: result.visualization.title || "Visualization",
            description: result.visualization.description,
          };

          // Convert single visualization to analysis result format
          analysisResults = [
            {
              type: result.visualization.type || "chart",
              title: result.visualization.title || "Visual Analysis",
              data: validateAndFixAnalysisData(result.visualization.data), // PERBAIKAN: gunakan fungsi validasi
              narrative: result.visualization.description,
              insights: safeArray<string>(result.visualization.insights),
              recommendations: safeArray<string>(
                result.visualization.recommendations
              ),
            },
          ];
        }
      } catch (vizError) {
        console.error("Error transforming visualization:", vizError);
        // Handle error dengan type-safe way
        const errorMessage =
          vizError instanceof Error
            ? vizError.message
            : typeof vizError === "string"
            ? vizError
            : "Unknown visualization error";

        // Create fallback analysis result
        analysisResults = [
          {
            type: "error",
            title: "Analysis Error",
            data: { error: errorMessage },
            narrative: "Terjadi error dalam memproses analisis visual",
            insights: ["Data analysis mengalami masalah teknis"],
            recommendations: [
              "Coba query yang lebih sederhana",
              "Periksa koneksi API",
            ],
          },
        ];
      }

      const responseData: ChatMessage = {
        id: Date.now().toString(),
        content: result.answer || result.response || "No response generated",
        role: "assistant" as const,
        timestamp: new Date(),
        sources: transformedSources,
        entities: transformedEntities,
        visualization: transformedVisualization,
        modelUsed: result.model || selectedModel,
        confidence:
          typeof result.confidence === "number"
            ? result.confidence
            : result.enhanced_metadata?.confidence_score || 85,
        processingTime,
        enhanced_metadata: result.enhanced_metadata,
        recommendations: safeArray(result.recommendations),
        advanced_reasoning: result.advanced_reasoning,
        retrieval_metadata: result.retrieval_metadata,
        security_level: result.enhanced_metadata?.security_level,
        analysis_results: analysisResults,
      };

      if (props.onProcessComplete) {
        props.onProcessComplete(responseData);
      }

      return responseData;
    } catch (error) {
      console.error("Error processing query:", error);
      throw error;
    }
  };

  // Upload file functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType =
        file.type === "application/pdf" ||
        file.type === "text/plain" ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".pdf");
      const isValidSize = file.size <= 10 * 1024 * 1024;
      return isValidType && isValidSize;
    });
    setUploadedFiles((prev) => [...prev, ...validFiles]);
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadDocumentsToAPI = async () => {
    if (uploadedFiles.length === 0) {
      setUploadError("Pilih minimal satu file untuk diupload");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess("");
    setUploadProgress(0);

    try {
      const token = getToken();
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append(
        "metadata",
        JSON.stringify({
          category: uploadMetadata.category,
          classification: uploadMetadata.classification,
          tags: uploadMetadata.tags,
          language: "indonesian",
        })
      );

      const response = await fetch(`${BASE_URL}/api/rag/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      setUploadProgress(50);
      if (!response.ok) throw new Error(`Upload gagal: ${response.status}`);

      const result = await response.json();
      setUploadProgress(100);

      if (result.success) {
        setUploadSuccess(
          `✅ ${result.data.successful} file berhasil diupload!`
        );
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadedFiles([]);
          setUploadMetadata({
            category: "cybersecurity",
            classification: "Internal",
            tags: [],
          });
        }, 2000);
      } else {
        throw new Error(result.error || "Upload gagal");
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload gagal");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !uploadMetadata.tags.includes(tag)) {
      setUploadMetadata((prev) => ({
        ...prev,
        tags: [...prev.tags, tag.trim()],
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setUploadMetadata((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    return file.type === "application/pdf" ? (
      <FileText className="w-4 h-4 text-red-500" />
    ) : (
      <FileText className="w-4 h-4 text-blue-500" />
    );
  };

  const handleTemplateSelect = (template: string) => {
    setQuery(template);
    textareaRef.current?.focus();
  };

  const handleProcess = async () => {
    if (!query.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: query,
      role: "user",
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setError("");

    try {
      const aiResponse = await processQuery(query);
      setChatHistory((prev) => [...prev, aiResponse]);
      setActiveTab("answer");
    } catch (error) {
      console.error("Error calling backend API:", error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `Maaf, terjadi error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        role: "assistant",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
      setError(error instanceof Error ? error.message : "Unknown error");
      setApiStatus("error");
    } finally {
      setIsProcessing(false);
      setQuery("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleProcess();
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const clearChat = () => {
    setChatHistory([
      {
        id: "1",
        content:
          "Percakapan telah dibersihkan. Enhanced RAG System dengan Visual Analysis siap digunakan!",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
  };

  const copyConversation = () => {
    const conversationText = chatHistory
      .map((msg) => `${msg.role === "user" ? "USER" : "AI"}: ${msg.content}`)
      .join("\n\n");
    navigator.clipboard.writeText(conversationText);
  };

  const getStatusColor = () => {
    switch (apiStatus) {
      case "connected":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  const getStatusIcon = () => {
    switch (apiStatus) {
      case "connected":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case "connected":
        return "Visual Analysis System Ready";
      case "error":
        return "System Error";
      default:
        return "Connecting...";
    }
  };

  const getModelDisplayName = (model: string): string => {
    return (
      AVAILABLE_MODELS[model as keyof typeof AVAILABLE_MODELS]?.name || model
    );
  };

  const getModelColor = (model: string): string => {
    return (
      AVAILABLE_MODELS[model as keyof typeof AVAILABLE_MODELS]?.color ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  const getClassificationColor = (classification: string): string => {
    return (
      CLASSIFICATION_LEVELS[
        classification as keyof typeof CLASSIFICATION_LEVELS
      ]?.color || "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  const getClassificationIcon = (classification: string) => {
    const Icon =
      CLASSIFICATION_LEVELS[
        classification as keyof typeof CLASSIFICATION_LEVELS
      ]?.icon || Shield;
    return <Icon className="w-3 h-3" />;
  };

  const getEntityIcon = (type: string) => {
    const Icon = ENTITY_TYPES[type as keyof typeof ENTITY_TYPES]?.icon || Hash;
    return <Icon className="w-3 h-3" />;
  };

  const getEntityColor = (type: string) => {
    return (
      ENTITY_TYPES[type as keyof typeof ENTITY_TYPES]?.color ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  const getEntityLabel = (type: string) => {
    return ENTITY_TYPES[type as keyof typeof ENTITY_TYPES]?.label || type;
  };

  const getVisualizationIcon = (type: string) => {
    const Icon =
      VISUALIZATION_TYPES[type as keyof typeof VISUALIZATION_TYPES]?.icon ||
      FileBarChart;
    return <Icon className="w-4 h-4" />;
  };

  const getVisualizationColor = (type: string) => {
    return (
      VISUALIZATION_TYPES[type as keyof typeof VISUALIZATION_TYPES]?.color ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  const getVisualizationLabel = (type: string) => {
    return (
      VISUALIZATION_TYPES[type as keyof typeof VISUALIZATION_TYPES]?.label ||
      type
    );
  };

  // Get mode configuration
  const getModeConfig = (mode: string) => {
    return MODE_CONFIG[mode as keyof typeof MODE_CONFIG] || MODE_CONFIG.qa;
  };

  const getModeIcon = (mode: string) => {
    const Icon = getModeConfig(mode).icon;
    return <Icon className="w-3 h-3" />;
  };

  const getModeColor = (mode: string) => {
    return getModeConfig(mode).color;
  };

  // Komponen untuk menampilkan visual analysis dengan error handling yang lebih baik
  const VisualAnalysisContent = ({ message }: { message: ChatMessage }) => {
    const analyses =
      message.analysis_results ||
      (message.visualization ? [message.visualization] : []);

    if (!analyses || analyses.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <FileBarChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Tidak ada data analisis visual untuk ditampilkan</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {analyses.map((analysis: any, index: number) => {
          try {
            // Pastikan insights dan recommendations adalah array
            const insights = safeArray<string>(analysis.insights);
            const recommendations = safeArray<string>(analysis.recommendations);

            // Validasi data analysis
            const validatedData = validateAndFixAnalysisData(analysis.data);

            return (
              <div key={index} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  {getVisualizationIcon(analysis.type)}
                  <h4 className="font-semibold text-lg">
                    {analysis.title || getVisualizationLabel(analysis.type)}
                  </h4>
                  <Badge
                    variant="outline"
                    className={getVisualizationColor(analysis.type)}
                  >
                    {getVisualizationLabel(analysis.type)}
                  </Badge>
                </div>

                {analysis.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {analysis.description}
                  </p>
                )}

                {/* Visualization Placeholder dengan informasi data */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-dashed border-blue-200 min-h-[200px] flex items-center justify-center mb-4">
                  <div className="text-center">
                    {getVisualizationIcon(analysis.type)}
                    <p className="font-medium text-blue-800 mt-2">
                      {getVisualizationLabel(analysis.type)}
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      Visualisasi interaktif akan ditampilkan di sini
                    </p>
                    {validatedData.items && (
                      <p className="text-xs text-blue-500 mt-1">
                        Data items: {validatedData.items.length} entri
                      </p>
                    )}
                    {analysis.type && (
                      <p className="text-xs text-blue-500 mt-1">
                        Tipe: {analysis.type}
                      </p>
                    )}
                  </div>
                </div>

                {/* Analysis Details */}
                <div className="space-y-4">
                  {analysis.narrative && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <h5 className="font-medium text-yellow-800 mb-2">
                        Narasi Analisis
                      </h5>
                      <p className="text-sm text-yellow-700">
                        {analysis.narrative}
                      </p>
                    </div>
                  )}

                  {insights.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Key Insights</h5>
                      <ul className="space-y-1">
                        {insights.map((insight: string, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Sparkles className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Rekomendasi</h5>
                      <ul className="space-y-1">
                        {recommendations.map((rec: string, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Data preview yang aman */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                      Data Structure Preview
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(
                        {
                          type: analysis.type,
                          title: analysis.title,
                          data_structure: "validated",
                          items_count: validatedData.items
                            ? validatedData.items.length
                            : 0,
                          data_type: typeof analysis.data,
                          data_keys: analysis.data
                            ? Object.keys(analysis.data)
                            : [],
                          insights_count: insights.length,
                          recommendations_count: recommendations.length,
                          sample_data: validatedData.items
                            ? validatedData.items.slice(0, 3) // Hanya tampilkan 3 item pertama
                            : "No items data",
                        },
                        null,
                        2
                      )}
                    </pre>
                  </details>
                </div>
              </div>
            );
          } catch (error) {
            console.error(`Error rendering analysis ${index}:`, error);
            return (
              <div key={index} className="border rounded-lg p-4 bg-red-50">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <h4 className="font-semibold text-lg text-red-800">
                    Error Rendering Analysis
                  </h4>
                </div>
                <p className="text-sm text-red-700 mb-2">
                  Terjadi error saat menampilkan analisis:{" "}
                  {error instanceof Error ? error.message : "Unknown error"}
                </p>
                <details className="text-xs">
                  <summary className="cursor-pointer">View raw data</summary>
                  <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto">
                    {JSON.stringify(analysis, null, 2)}
                  </pre>
                </details>
              </div>
            );
          }
        })}
      </div>
    );
  };

  // Komponen untuk menampilkan tab content
  const AnswerContent = ({ message }: { message: ChatMessage }) => (
    <div className="space-y-4">
      <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
        {message.content}
      </div>

      {/* Enhanced Features */}
      {message.advanced_reasoning?.tools_employed && (
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-700">
              Tools Used:
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {safeArray<string>(message.advanced_reasoning.tools_employed).map(
              (tool: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-green-50 text-green-700"
                >
                  {tool}
                </Badge>
              )
            )}
          </div>
        </div>
      )}

      {message.security_level && (
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-700">
              Level Keamanan:{" "}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                message.security_level === "very_high"
                  ? "bg-red-100 text-red-700"
                  : message.security_level === "high"
                  ? "bg-orange-100 text-orange-700"
                  : message.security_level === "medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              )}
            >
              {message.security_level === "very_high"
                ? "Sangat Tinggi"
                : message.security_level === "high"
                ? "Tinggi"
                : message.security_level === "medium"
                ? "Sedang"
                : "Standar"}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );

  const SourcesContent = ({ sources }: { sources: Source[] }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-medium text-blue-700">
          Sumber Terkait ({sources.length})
        </span>
      </div>
      <div className="space-y-3">
        {sources.map((source, index) => (
          <div key={source.id} className="p-3 border rounded-lg bg-blue-50/50">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 hover:bg-green-100 text-xs"
                >
                  {Math.round(source.score * 100)}%
                </Badge>
                <span className="text-sm font-medium">
                  {source.metadata.source}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {getClassificationIcon(
                  source.metadata.classification || "Publik"
                )}
                <span className="text-xs text-muted-foreground">
                  ({source.metadata.classification || "Publik"})
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-2 line-clamp-3">
              {source.content}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Kategori: {source.metadata.category}</span>
              {source.metadata.date && (
                <span>Tanggal: {source.metadata.date}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const EntitiesContent = ({ entities }: { entities: Entity[] }) => {
    const groupedEntities = entities.reduce((acc, entity) => {
      const type = entity.type || "person";
      if (!acc[type]) acc[type] = [];
      acc[type].push(entity);
      return acc;
    }, {} as Record<string, Entity[]>);

    const entityTypes = Object.keys(groupedEntities);

    if (entityTypes.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Tidak ada entitas yang dikenali</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-700">
            Entitas Terkenali ({entities.length})
          </span>
        </div>

        {entityTypes.map((type) => (
          <div key={type} className="space-y-2">
            <div className="flex items-center gap-2">
              {getEntityIcon(type)}
              <span className="text-sm font-medium text-gray-700">
                {getEntityLabel(type)}
              </span>
              <Badge variant="outline" className="text-xs">
                {groupedEntities[type].length}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {groupedEntities[type].map((entity) => (
                <Badge
                  key={entity.id}
                  variant="outline"
                  className={cn(
                    "text-xs flex items-center gap-1",
                    getEntityColor(type)
                  )}
                  title={`Confidence: ${Math.round(entity.confidence * 100)}%`}
                >
                  {getEntityIcon(type)}
                  {entity.name}
                  <span className="text-xs opacity-70">
                    ({Math.round(entity.confidence * 100)}%)
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Komponen untuk menampilkan message dengan tabs
  const MessageWithTabs = ({ message }: { message: ChatMessage }) => {
    const hasSources = message.sources && message.sources.length > 0;
    const hasEntities = message.entities && message.entities.length > 0;
    const hasVisualization = message.analysis_results || message.visualization;
    const isVisualMode = selectedMode === "visual";

    const tabs = [
      {
        id: "answer" as const,
        label: "Jawaban",
        icon: MessageSquare,
        enabled: true,
      },
      {
        id: "sources" as const,
        label: "Sumber",
        icon: Search,
        enabled: hasSources,
      },
      {
        id: "entities" as const,
        label: "Entitas",
        icon: Layers,
        enabled: hasEntities,
      },
      {
        id: "visualization" as const,
        label: "Analisis Visual",
        icon: FileBarChart,
        enabled: hasVisualization || isVisualMode,
      },
    ].filter((tab) => tab.enabled);

    return (
      <div className="space-y-3">
        {/* Tab Navigation */}
        {tabs.length > 1 && (
          <div className="flex border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-700 bg-purple-50"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab Content */}
        <div className="min-h-[100px]">
          {activeTab === "answer" && <AnswerContent message={message} />}
          {activeTab === "sources" && hasSources && (
            <SourcesContent sources={message.sources!} />
          )}
          {activeTab === "entities" && hasEntities && (
            <EntitiesContent entities={message.entities!} />
          )}
          {activeTab === "visualization" && (
            <VisualAnalysisContent message={message} />
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-[800px]">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Query Input</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full border border-purple-200">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                Visual Analysis Mode
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1"
              disabled={isProcessing}
            >
              <FileUp className="w-4 h-4" />
              Upload Dokumen
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={testApiConnection}
              disabled={isProcessing}
              className="flex items-center gap-1"
            >
              <RefreshCw
                className={cn("w-4 h-4", isProcessing && "animate-spin")}
              />
              Test
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
              className="flex items-center gap-1"
            >
              {showChat ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4 rotate-180" />
              )}
              {showChat ? "Sembunyikan" : "Tampilkan"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
        {/* Enhanced Features Status Bar */}
        <div className="px-4 py-2 bg-purple-50 border-b border-purple-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="default"
                  className={cn("text-xs", getModelColor(selectedModel))}
                >
                  {getModelDisplayName(selectedModel)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {AI_PERSONAS[selectedPersona].name}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("text-xs", getModeColor(selectedMode))}
                >
                  {getModeIcon(selectedMode)}
                  {getModeConfig(selectedMode).name}
                </Badge>

                <div className="flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    <Filter className="w-3 h-3 mr-1" />
                    Classification
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    <Cpu className="w-3 h-3 mr-1" />
                    Tools
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Security
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{chatHistory.length} pesan</span>
            </div>
          </div>
          {error && (
            <div className="mt-1 p-1 bg-destructive/10 border border-destructive/20 rounded text-xs">
              <p className="text-destructive text-xs">{error}</p>
            </div>
          )}
        </div>

        {/* Connection Status Bar */}
        <div className="px-4 py-2 bg-muted/30 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={cn("text-sm font-medium", getStatusColor())}>
                {getStatusText()}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Mode Visual Analysis aktif - Semua fitur enhanced tersedia
            </div>
          </div>
        </div>

        {/* Chat History Section */}
        {showChat && (
          <div className="flex-1 overflow-hidden border-b">
            <div className="h-full overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="px-4 py-4 min-h-full">
                  <div className="space-y-6">
                    {chatHistory.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-3",
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1 border border-purple-200">
                            <Bot className="w-4 h-4 text-purple-600" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "rounded-lg p-4 space-y-3 max-w-[85%] min-w-[300px]",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-purple-50 border border-purple-200"
                          )}
                        >
                          <div className="flex items-center justify-between text-xs opacity-70">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {message.timestamp.toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {message.modelUsed && (
                                <>
                                  <span>•</span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-xs",
                                      getModelColor(message.modelUsed)
                                    )}
                                  >
                                    {getModelDisplayName(message.modelUsed)}
                                  </Badge>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {message.processingTime && (
                                <span className="text-xs">
                                  {message.processingTime}ms
                                </span>
                              )}
                              {message.role === "assistant" &&
                                message.confidence && (
                                  <span className="font-medium">
                                    {message.confidence}% confidence
                                  </span>
                                )}
                            </div>
                          </div>

                          {message.role === "assistant" ? (
                            <MessageWithTabs message={message} />
                          ) : (
                            <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                              {message.content}
                            </div>
                          )}
                        </div>
                        {message.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}

                    {isProcessing && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mt-1 border border-purple-200">
                          <Bot className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="rounded-lg p-4 border bg-purple-50 border-purple-200 max-w-[85%] min-w-[300px]">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex space-x-1.5">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                              {selectedMode === "visual"
                                ? "Memproses Visual Analysis..."
                                : "Memproses dengan Enhanced RAG..."}
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs ml-2",
                                  getModelColor(selectedModel)
                                )}
                              >
                                {getModelDisplayName(selectedModel)}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50 text-blue-700"
                              >
                                Classification
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50 text-green-700"
                              >
                                Tool Calling
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs bg-orange-50 text-orange-700"
                              >
                                Security
                              </Badge>
                              {selectedMode === "visual" && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-purple-50 text-purple-700"
                                >
                                  Visual Analysis
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="p-3 space-y-3 flex-shrink-0 border-t">
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              placeholder={
                selectedMode === "visual"
                  ? "Ketik pertanyaan untuk analisis visual (contoh: buat analisis SWOT, visualisasi tren, dll.)..."
                  : "Ketik pertanyaan Anda di sini..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[60px] resize-none text-sm"
              disabled={isProcessing}
            />

            {/* Template Queries */}
            <div className="grid grid-cols-2 gap-2">
              {QUERY_TEMPLATES[selectedMode]
                .slice(0, 2)
                .map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTemplateSelect(template)}
                    className="justify-start h-auto py-1.5 text-xs text-left"
                    disabled={isProcessing}
                  >
                    <span className="line-clamp-2 text-xs">{template}</span>
                  </Button>
                ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Select
                value={selectedMode}
                onValueChange={(value: keyof typeof MODE_CONFIG) =>
                  handleModeChange(value)
                }
                disabled={isProcessing}
              >
                <SelectTrigger className="w-28 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MODE_CONFIG).map(([key, mode]) => {
                    const Icon = mode.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-3 h-3" />
                          <span className="text-xs">{mode.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Select
                value={selectedPersona}
                onValueChange={(value: keyof typeof AI_PERSONAS) =>
                  handlePersonaChange(value)
                }
                disabled={isProcessing}
              >
                <SelectTrigger className="w-28 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AI_PERSONAS).map(([key, persona]) => {
                    const Icon = persona.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-3 h-3" />
                          <span className="text-xs">{persona.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Select
                value={selectedModel}
                onValueChange={(value: string) => handleModelChange(value)}
                disabled={isProcessing}
              >
                <SelectTrigger className="w-32 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AVAILABLE_MODELS).map(
                    ([modelKey, modelInfo]) => {
                      const Icon = modelInfo.icon;
                      return (
                        <SelectItem key={modelKey} value={modelKey}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-3 h-3" />
                            <span className="text-xs">{modelInfo.name}</span>
                          </div>
                        </SelectItem>
                      );
                    }
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyConversation}
                title="Salin percakapan"
                className="h-7 w-7 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                title="Bersihkan percakapan"
                className="h-7 w-7 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              <Button
                onClick={handleProcess}
                disabled={!query.trim() || isProcessing}
                className="bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1 h-7 px-3"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-current border-r-transparent rounded-full animate-spin" />
                    <span className="text-xs">Process</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span className="text-xs">Kirim</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Modal Upload Dokumen */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileUp className="w-5 h-5" />
                  Upload Dokumen ke Knowledge Base
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Progress Bar */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mengupload...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {uploadSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">{uploadSuccess}</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{uploadError}</span>
                  </div>
                </div>
              )}

              {/* File Upload Section */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Pilih File (PDF/TXT)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.txt,application/pdf,text/plain"
                    multiple
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-2"
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4" />
                    Pilih File
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maksimal 10MB per file, format PDF atau TXT
                  </p>
                </div>

                {/* Selected Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      File Terpilih ({uploadedFiles.length})
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getFileIcon(file)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            disabled={isUploading}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata Section */}
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategori</label>
                  <Select
                    value={uploadMetadata.category}
                    onValueChange={(value) =>
                      setUploadMetadata((prev) => ({
                        ...prev,
                        category: value,
                      }))
                    }
                    disabled={isUploading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cybersecurity">
                        Cybersecurity
                      </SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Klasifikasi</label>
                  <Select
                    value={uploadMetadata.classification}
                    onValueChange={(
                      value: keyof typeof CLASSIFICATION_LEVELS
                    ) =>
                      setUploadMetadata((prev) => ({
                        ...prev,
                        classification: value,
                      }))
                    }
                    disabled={isUploading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CLASSIFICATION_LEVELS).map(
                        ([key, level]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              {getClassificationIcon(key)}
                              <span>{level.name}</span>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {
                      CLASSIFICATION_LEVELS[uploadMetadata.classification]
                        ?.description
                    }
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {uploadMetadata.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive"
                          disabled={isUploading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tambahkan tag..."
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                      disabled={isUploading}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.querySelector(
                          'input[placeholder="Tambahkan tag..."]'
                        ) as HTMLInputElement;
                        if (input && input.value.trim()) {
                          addTag(input.value);
                          input.value = "";
                        }
                      }}
                      disabled={isUploading}
                    >
                      Tambah
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadedFiles([]);
                    setUploadError("");
                    setUploadSuccess("");
                  }}
                  disabled={isUploading}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={uploadDocumentsToAPI}
                  disabled={isUploading || uploadedFiles.length === 0}
                  className="flex-1 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <FileUp className="w-4 h-4" />
                      Upload {uploadedFiles.length} File
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
});

AIQueryInput.displayName = "AIQueryInput";

export { AIQueryInput };
