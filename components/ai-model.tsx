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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
} from "recharts";
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
  RefreshCw,
  Upload,
  FileText,
  X,
  FileUp,
  Shield,
  Lock,
  Filter,
  Cpu,
  TrendingUp,
  AlertOctagon,
  Target,
  PieChart as PieChartIcon,
  Network,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  GitMerge,
  FishSymbol,
  Workflow,
  Radar as RadarIcon,
  ScatterChart as ScatterChartIcon,
  AreaChart as AreaChartIcon,
  Rocket,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ==================== HELPER FUNCTION ====================
const removeMarkdownBold = (text: string): string => {
  if (!text) return "";
  return text.replace(/\*\*/g, '');
};

// ==================== TYPE DEFINITIONS ====================
type VisualizationType =
  | "heatmap"
  | "timeline"
  | "network"
  | "chart"
  | "bar_chart"
  | "line_chart"
  | "pie_chart"
  | "area_chart"
  | "scatter_chart"
  | "radar_chart"
  | "quadrant"
  | "swot"
  | "fishbone"
  | "causality"
  | "threat_matrix"
  | string;

interface IntentAnalysis {
  recommendedType: string;
  suggestedTitle: string;
  needsComparison: boolean;
  metrics: string[];
  confidence: number;
  reasoning: string;
}

interface DataSummary {
  data_points: number;
  data_type: string;
  generated_data: boolean;
  confidence?: number;
}

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
  type: VisualizationType;
  data: any;
  title: string;
  description?: string;
  narrative?: string;
  insights?: string[];
  recommendations?: string[];
  intent_analysis?: IntentAnalysis;
  data_summary?: DataSummary;
  suggestions?: string[];
}

interface AdvancedVisualResponse {
  success: boolean;
  question: string;
  answer: string;
  analysis_results: AnalysisResult[];
  visualization: VisualizationData;
  visual_narrative: string;
  sources: Source[];
  query_analysis: any;
  retrieval_metadata: any;
  enhanced_metadata: {
    processing_steps: string[];
    total_processing_time: number;
    confidence_score: number;
    analysis_type: string;
    visualization_ready: boolean;
    data_points: number;
    visual_quality: string;
  };
  timestamp: string;
}

interface AnalysisResult {
  type: string;
  title: string;
  data: any;
  narrative?: string;
  insights?: string[];
  recommendations?: string[];
  structure?: {
    nodes: any[];
    links: any[];
    groups: any[];
  };
  analysis?: {
    centrality: any;
    density: number;
    diameter: number;
    key_players: any[];
  };
  metadata?: any;
}

interface EnhancedVisualizationData extends VisualizationData {
  intent_analysis?: IntentAnalysis;
  data_summary?: DataSummary;
  suggestions?: string[];
  metadata?: {
    data_source: string;
    is_real_data: boolean;
    generated_at: string;
    real_data_sources?: any[];
  };
}

interface SmartQueryResponse {
  type: "visual_analysis" | "text_response" | "swot_analysis" | "trend_analysis" | "advanced_visual_analysis";
  visualization?: EnhancedVisualizationData;
  narrative?: string;
  data_summary?: DataSummary;
  intent_analysis?: IntentAnalysis;
  answer?: string;
  sources?: Source[];
  model?: string;
  analysis?: any;
  data_source?: "real_data" | "generated_data";
  is_real_data?: boolean;
  suggestions?: string[];
  metadata?: {
    question: string;
    visualization_type: string;
    data_source: string;
    generated_at: string;
    model: string;
    real_data_sources?: any[];
  };
  analysis_results?: AnalysisResult[];
  enhanced_metadata?: any;
}

// ==================== AI PERSONA CONFIGURATIONS ====================
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
    description: "Spesialis generasi ide dan solusi inovatif",
    icon: Lightbulb,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  risk: {
    name: "Risk Monitor",
    description: "Ahli monitoring dan analisis risiko keamanan",
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

// ==================== MODEL CONFIGURATIONS ====================
const AVAILABLE_MODELS = {
  "llama-3.3-70b-versatile": {
    name: "Llama 3.3 70B Versatile",
    description: "Model Groq terbaru dengan kecepatan tinggi dan reasoning yang excellent",
    icon: Rocket,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

// ==================== CLASSIFICATION LEVELS ====================
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

// ==================== QUERY TEMPLATES ====================
const QUERY_TEMPLATES: { [key: string]: string[] } = {
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
  enhanced_visual: [
    "Buat grafik penjualan berdasarkan data real",
    "Analisis tren pengguna aktif dengan data aktual", 
    "Bandingkan performa produk menggunakan data real",
  ],
};

// ==================== VISUALIZATION TYPE CONFIGURATIONS ====================
const VISUALIZATION_TYPES = {
  network: {
    icon: Network,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    label: "Network Analysis",
  },
  timeline: {
    icon: LineChartIcon,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    label: "Timeline Analysis",
  },
  bar_chart: {
    icon: BarChartIcon,
    color: "bg-green-100 text-green-700 border-green-200",
    label: "Comparative Analysis",
  },
  pie_chart: {
    icon: PieChartIcon,
    color: "bg-pink-100 text-pink-700 border-pink-200",
    label: "Distribution Analysis",
  },
  area_chart: {
    icon: AreaChartIcon,
    color: "bg-teal-100 text-teal-700 border-teal-200",
    label: "Trend Analysis",
  },
  scatter_chart: {
    icon: ScatterChartIcon,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    label: "Correlation Analysis",
  },
  radar_chart: {
    icon: RadarIcon,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    label: "Radar Analysis",
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

// ==================== BASE URL CONFIGURATION ====================
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ==================== MODE CONFIGURATIONS ====================
const MODE_CONFIG: { [key: string]: {
  name: string;
  description: string;
  icon: any;
  color: string;
  persona: keyof typeof AI_PERSONAS;
  endpoint?: string;
} } = {
  qa: {
    name: "Q&A",
    description: "Tanya jawab langsung dengan sistem",
    icon: MessageSquare,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    persona: "analyst",
  },
  summary: {
    name: "Summary",
    description: "Ringkasan dan ekstraksi informasi",
    icon: FileText,
    color: "bg-green-100 text-green-700 border-green-200",
    persona: "analyst",
  },
  ide: {
    name: "Ide Generator",
    description: "Generasi ide kreatif dan solusi inovatif",
    icon: Lightbulb,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    persona: "innovator",
  },
  risk: {
    name: "Risk Monitoring",
    description: "Monitoring dan analisis risiko keamanan",
    icon: AlertOctagon,
    color: "bg-red-100 text-red-700 border-red-200",
    persona: "risk",
  },
  enhanced_visual: {
    name: "Enhanced Visual",
    description: "Visualisasi dengan pencarian data real terlebih dahulu",
    icon: Database,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    persona: "analyst",
    endpoint: "enhanced-visual-request",
  },
};

// ==================== CHART COLORS ====================
const CHART_COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", 
  "#82CA9D", "#FFC658", "#8DD1E1", "#D084D0", "#FF7C7C",
  "#A4DE6C", "#D0ED57", "#FFC0CB", "#BA55D3", "#20B2AA"
];

// ==================== API SERVICE FUNCTIONS ====================

const getToken = (): string => {
  if (typeof window === "undefined") {
    throw new Error("Window tidak tersedia");
  }
  
  const token = localStorage.getItem("accessToken");
  console.log("🔐 Token retrieval:", token ? `✅ Found (${token.substring(0, 20)}...)` : "❌ Missing");
  
  if (!token) {
    console.error("❌ No access token found in localStorage");
    throw new Error("Token tidak ditemukan. Silakan login terlebih dahulu.");
  }
  
  if (!token.startsWith("eyJ") || token.length < 50) {
    console.error("❌ Invalid token format");
    localStorage.removeItem("accessToken");
    throw new Error("Token tidak valid. Silakan login ulang.");
  }
  
  return token;
};

/**
 * Enhanced Visual Request dengan pencarian data real
 */
const enhancedVisualRequest = async (question: string, options = {}): Promise<SmartQueryResponse> => {
  try {
    const token = getToken();
    console.log(`🤖 Mengirim enhanced visual request ke: ${BASE_URL}/api/chat/advanced-visual-analysis`);

    const response = await fetch(`${BASE_URL}/api/chat/advanced-visual-analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        question,
        model: "llama-3.3-70b-versatile",
        enable_real_data: true,
        enable_visualization: true,
        ...options,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Enhanced visual request failed: ${response.status}`, errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Enhanced visual response:`, data);
    
    return transformEnhancedVisualResponse(data);
  } catch (error) {
    console.error("❌ Enhanced visual request error:", error);
    throw error;
  }
};

const transformEnhancedVisualResponse = (data: any): SmartQueryResponse => {
  console.log("🔄 Transforming enhanced visual response:", data);
  
  const defaultVisualizationData: EnhancedVisualizationData = {
    type: "fallback",
    data: { items: [] },
    title: "Analysis Result",
    description: "Hasil analisis",
    narrative: data.answer || data.narrative || "Analisis berhasil di-generate",
    insights: ["Analisis selesai"],
    recommendations: ["Gunakan query yang lebih spesifik"],
    metadata: {
      data_source: "fallback",
      is_real_data: false,
      generated_at: data.timestamp || new Date().toISOString(),
      real_data_sources: data.sources || []
    }
  };

  let visualizationData: EnhancedVisualizationData = defaultVisualizationData;
  let analysisResults: AnalysisResult[] = [];
  
  if (data.visualization) {
    visualizationData = {
      ...data.visualization,
      data: validateAndFixAnalysisData(data.visualization.data),
      metadata: {
        data_source: data.data_source || "generated_data",
        is_real_data: data.is_real_data || false,
        generated_at: data.timestamp || new Date().toISOString(),
        real_data_sources: data.sources || []
      }
    };
    
    analysisResults = [{
      type: data.visualization.type || "visual_analysis",
      title: data.visualization.title || "Visual Analysis",
      data: visualizationData.data,
      narrative: data.narrative || data.visualization.narrative || '',
      insights: data.visualization.insights || [],
      recommendations: data.visualization.recommendations || []
    }];
  }
  
  if (data.answer && visualizationData === defaultVisualizationData) {
    visualizationData = {
      type: "text",
      data: { items: [] },
      title: "Text Analysis",
      description: "Analisis teks",
      narrative: data.answer,
      insights: ["Response berhasil di-generate"],
      recommendations: ["Gunakan query yang lebih spesifik untuk visualisasi"],
      metadata: {
        data_source: "text_response",
        is_real_data: false,
        generated_at: data.timestamp || new Date().toISOString(),
        real_data_sources: []
      }
    };
    
    analysisResults = [{
      type: "text_response",
      title: "AI Response",
      data: { items: [] },
      narrative: data.answer,
      insights: ["Response berhasil di-generate"],
      recommendations: ["Gunakan query yang lebih spesifik untuk visualisasi"]
    }];
  }

  const response: SmartQueryResponse = {
    type: "visual_analysis",
    visualization: visualizationData,
    narrative: data.narrative || data.answer || '',
    data_summary: {
      data_points: data.enhanced_metadata?.data_points || data.data_summary?.data_points || 0,
      data_type: visualizationData.type || "analysis",
      generated_data: !data.is_real_data,
      confidence: data.enhanced_metadata?.confidence_score || data.data_summary?.confidence
    },
    answer: data.answer,
    sources: data.sources,
    model: "llama-3.3-70b-versatile",
    data_source: data.data_source || (data.is_real_data ? "real_data" : "generated_data"),
    is_real_data: data.is_real_data || false,
    suggestions: data.suggestions || [
      "Gunakan query yang lebih spesifik untuk hasil yang lebih akurat",
      "Coba mode analisis yang berbeda untuk perspektif lain"
    ],
    analysis_results: analysisResults,
    enhanced_metadata: data.enhanced_metadata,
    metadata: {
      question: data.question,
      visualization_type: visualizationData.type,
      data_source: data.data_source || "generated_data",
      generated_at: data.timestamp || new Date().toISOString(),
      model: "llama-3.3-70b-versatile",
      real_data_sources: data.sources || []
    }
  };
  
  console.log("✅ Transformed enhanced visual response:", response);
  return response;
};

/**
 * Advanced Query untuk analisis teks lanjutan
 */
const advancedQuery = async (question: string, options = {}): Promise<any> => {
  try {
    const token = getToken();
  
    const enhancedOptions = {
      model: "llama-3.3-70b-versatile",
      enable_classification: true,
      enable_tool_calling: true,
      enable_pii_masking: true,
      enable_security_scan: true,
      enable_formatting: true,
      persona: "analyst",
      user_role: "analyst",
      ...options,
    };
  
    console.log(`📤 Mengirim query ke: ${BASE_URL}/api/chat/advanced-query`);

    const response = await fetch(`${BASE_URL}/api/chat/advanced-query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
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

// ==================== DATA VALIDATION & TRANSFORMATION ====================

const validateAndFixAnalysisData = (data: any): any => {
  console.log("🔧 Original data for visualization:", data);

  if (!data) {
    console.warn("❌ Data is null or undefined");
    return { items: [] };
  }

  // SPECIAL CASE: Network data
  if (data.type === "network" || data.visualizationType === "network") {
    console.log("✅ Network data structure detected");
    
    if (data.items && data.links) {
      return data;
    } else if (data.nodes && data.links) {
      return { items: data.nodes, links: data.links };
    } else if (data.data && data.data.nodes) {
      return { items: data.data.nodes, links: data.data.links || [] };
    } else if (data.structure && data.structure.nodes) {
      return { 
        items: data.structure.nodes, 
        links: data.structure.links || [],
        metadata: data.metadata
      };
    }
  }

  // Case 1: Data dari VisualAnalysisService (format baru)
  if (data.data && data.data.datasets) {
    console.log("✅ Chart.js format detected");
    const items = data.data.labels?.map((label: string, index: number) => {
      const item: any = { name: label };
      data.data.datasets.forEach((dataset: any) => {
        if (dataset.data && Array.isArray(dataset.data)) {
          const value = dataset.data[index];
          item[dataset.label || 'value'] = typeof value === 'number' ? value : 1;
        }
      });
      return item;
    }) || [];
    return { items: items.filter(Boolean) };
  }

  // Case 2: Data sudah dalam format yang benar { items: [...] }
  if (data.items && Array.isArray(data.items)) {
    console.log("✅ Data already has items array");
    return data;
  }

  // Case 3: Data adalah array langsung
  if (Array.isArray(data)) {
    console.log("✅ Data is direct array, wrapping in items");
    return { items: data };
  }

  // Case 4: Data adalah object dengan properti array
  const arrayKeys = Object.keys(data).filter(
    (key) => Array.isArray(data[key]) && data[key].length > 0
  );

  if (arrayKeys.length > 0) {
    console.log(`✅ Found array keys:`, arrayKeys);
    
    if (arrayKeys.includes("data")) {
      return { items: data.data };
    }
    
    const longestArrayKey = arrayKeys.reduce((longest, key) => 
      data[key].length > data[longest].length ? key : longest
    );
    return { items: data[longestArrayKey] };
  }

  // Case 5: Data dari quadrant analysis
  if (data.quadrants && typeof data.quadrants === 'object') {
    console.log("✅ Quadrant analysis data detected");
    const items: any[] = [];
    Object.values(data.quadrants).forEach((quadrant: any) => {
      if (Array.isArray(quadrant.items)) {
        quadrant.items.forEach((item: any) => {
          items.push({
            name: item.label || `Item_${items.length}`,
            value: 1,
            quadrant: quadrant.label || 'unknown',
            ...item
          });
        });
      }
    });
    return { items };
  }

  // Case 6: Data dari SWOT analysis
  if (data.factors && typeof data.factors === 'object') {
    console.log("✅ SWOT analysis data detected");
    const items: any[] = [];
    Object.entries(data.factors).forEach(([category, factors]: [string, any]) => {
      if (Array.isArray(factors)) {
        factors.forEach((factor: any, index: number) => {
          items.push({
            name: typeof factor === 'string' ? factor : factor.name || `Factor_${index}`,
            value: 1,
            category: category,
            ...(typeof factor === 'object' ? factor : {})
          });
        });
      }
    });
    return { items };
  }

  // Case 7: Data adalah object biasa - convert ke array
  if (typeof data === "object") {
    console.log("✅ Converting object to array");
    try {
      const values = Object.values(data);
      if (values.length > 0 && values.every(item => typeof item === 'object' && item !== null)) {
        return { items: values };
      }

      const items = Object.entries(data).map(([key, value]) => {
        const item: any = { name: key };
        
        if (typeof value === 'number') {
          item.value = value;
        } else if (typeof value === 'object' && value !== null) {
          Object.assign(item, value);
        } else {
          item.value = 1;
          item.rawValue = value;
        }
        
        return item;
      });
      return { items };
    } catch (error) {
      console.error("Error converting object:", error);
    }
  }

  // Case 8: Fallback - return empty array dengan sample data
  console.warn("❌ No valid data structure found, using fallback");
  return {
    items: [
      { name: "Sample 1", value: 30, category: "A" },
      { name: "Sample 2", value: 45, category: "B" },
      { name: "Sample 3", value: 60, category: "C" },
    ],
    _fallback: true,
  };
};

// ==================== NETWORK VISUALIZATION COMPONENT ====================

/**
 * Komponen khusus untuk network visualization
 */
const NetworkVisualization = ({ data }: { data: any }) => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  console.log("🔍 NetworkVisualization received data:", data);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <Network className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Data tidak tersedia</p>
        </div>
      </div>
    );
  }

  let nodes = [];
  let links = [];

  if (data.items && Array.isArray(data.items)) {
    nodes = data.items;
    links = data.links || [];
  } else if (Array.isArray(data)) {
    nodes = data;
  } else if (data.nodes && Array.isArray(data.nodes)) {
    nodes = data.nodes;
    links = data.links || [];
  } else if (data.data && Array.isArray(data.data)) {
    nodes = data.data;
    links = data.links || data.relationships || [];
  }

  console.log("📊 Processed nodes:", nodes.length);
  console.log("🔗 Processed links:", links.length);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <Network className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Tidak ada nodes untuk divisualisasikan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Network Graph Visualization */}
      <div className="relative h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-200 overflow-hidden">
        {/* Simple Network Visualization */}
        <div className="absolute inset-0">
          {nodes.map((node: any, index: number) => {
            const angle = (index * 2 * Math.PI) / nodes.length;
            const radius = Math.min(120, 80 + nodes.length * 5);
            const x = 200 + radius * Math.cos(angle);
            const y = 180 + radius * Math.sin(angle);
            
            const nodeColor = getNodeColor(node.type || node.group || 'default');
            
            return (
              <div
                key={node.id || `node-${index}`}
                className="absolute w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform shadow-md border-2 border-white"
                style={{ 
                  left: x, 
                  top: y,
                  backgroundColor: nodeColor,
                  color: 'white'
                }}
                onClick={() => setSelectedNode(node)}
                title={`${node.name || node.label || node.id}\nType: ${node.type || 'unknown'}`}
              >
                {getNodeInitial(node.name || node.label || node.id)}
              </div>
            );
          })}

          {/* Render links/connections */}
          {links.map((link: any, index: number) => {
            const sourceNode = nodes.find((n: any) => n.id === link.source || n.id === link.source?.id);
            const targetNode = nodes.find((n: any) => n.id === link.target || n.id === link.target?.id);
            
            if (!sourceNode || !targetNode) return null;

            const sourceIndex = nodes.indexOf(sourceNode);
            const targetIndex = nodes.indexOf(targetNode);
            
            const sourceAngle = (sourceIndex * 2 * Math.PI) / nodes.length;
            const targetAngle = (targetIndex * 2 * Math.PI) / nodes.length;
            const radius = Math.min(120, 80 + nodes.length * 5);
            
            const sourceX = 200 + radius * Math.cos(sourceAngle);
            const sourceY = 180 + radius * Math.sin(sourceAngle);
            const targetX = 200 + radius * Math.cos(targetAngle);
            const targetY = 180 + radius * Math.sin(targetAngle);

            return (
              <svg key={`link-${index}`} className="absolute inset-0 pointer-events-none">
                <line
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={targetY}
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray={link.type === 'weak' ? "5,5" : "none"}
                />
              </svg>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 text-xs">
          <div className="font-medium mb-1">Legend:</div>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Person</span>
          </div>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Organization</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Location</span>
          </div>
        </div>
      </div>

      {/* Node Details */}
      {selectedNode && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Node Details</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <strong>Name:</strong> {selectedNode.name || selectedNode.label || selectedNode.id}
                </div>
                <div>
                  <strong>Type:</strong> {selectedNode.type || 'unknown'}
                </div>
                <div>
                  <strong>Value:</strong> {selectedNode.value || 'N/A'}
                </div>
                <div>
                  <strong>Group:</strong> {selectedNode.group || 'N/A'}
                </div>
              </div>
              {selectedNode.properties && (
                <div>
                  <strong>Properties:</strong>
                  <pre className="text-xs mt-1 p-2 bg-white rounded border max-h-32 overflow-auto">
                    {JSON.stringify(selectedNode.properties, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-blue-600">{nodes.length}</div>
            <div className="text-xs text-muted-foreground">Total Nodes</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-green-600">{links.length}</div>
            <div className="text-xs text-muted-foreground">Connections</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-purple-600">
              {nodes.filter((n: any) => n.type === 'person' || n.type === 'user').length}
            </div>
            <div className="text-xs text-muted-foreground">People</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-orange-600">
              {nodes.filter((n: any) => n.type === 'organization' || n.type === 'company').length}
            </div>
            <div className="text-xs text-muted-foreground">Organizations</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper functions untuk network visualization
const getNodeColor = (type: string): string => {
  const colorMap: { [key: string]: string } = {
    person: '#3b82f6',
    user: '#3b82f6',
    organization: '#10b981',
    company: '#10b981',
    location: '#8b5cf6',
    place: '#8b5cf6',
    document: '#f59e0b',
    file: '#f59e0b',
    concept: '#ef4444',
    default: '#6b7280'
  };
  return colorMap[type] || colorMap.default;
};

const getNodeInitial = (name: string): string => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

// ==================== VISUALIZATION RENDERER COMPONENT ====================
interface VisualizationRendererProps {
  visualization: VisualizationData;
  className?: string;
}

const VisualizationRenderer = ({
  visualization,
  className = "",
}: VisualizationRendererProps) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    console.log("🎯 Visualization data received:", visualization);

    if (!visualization || !visualization.data) {
      console.warn("❌ No visualization data available");
      setChartData([]);
      return;
    }

    const processedData = validateAndFixAnalysisData(visualization.data);
    console.log("✅ Processed chart data:", processedData);

    if (processedData.items && Array.isArray(processedData.items)) {
      setChartData(processedData.items);
    } else {
      console.warn("❌ No items array found in processed data");
      setChartData([]);
    }
  }, [visualization]);

  const renderChart = () => {
    if (!chartData.length) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <BarChartIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Tidak ada data untuk divisualisasikan</p>
            <p className="text-xs mt-2">Data points: 0</p>
          </div>
        </div>
      );
    }

    const firstItem = chartData[0];
    
    const valueKeys = Object.keys(firstItem).filter(
      (key) =>
        key !== "name" &&
        key !== "category" &&
        key !== "type" &&
        key !== "label" &&
        key !== "id" &&
        key !== "description" &&
        key !== "quadrant" &&
        key !== "timestamp" &&
        (typeof firstItem[key] === "number" || 
         (typeof firstItem[key] === "string" && !isNaN(Number(firstItem[key]))))
    );

    const finalValueKeys = valueKeys.length > 0 ? valueKeys : ['value'];

    console.log("📊 Chart data:", chartData);
    console.log("🔑 Value keys:", finalValueKeys);

    const vizType = visualization.type as string;

    switch (vizType) {
      case "bar_chart":
      case "chart":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {finalValueKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  name={key.replace(/_/g, " ").toUpperCase()}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "line_chart":
      case "timeline":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {finalValueKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  name={key.replace(/_/g, " ").toUpperCase()}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie_chart":
        const pieData = chartData.map((item, index) => ({
          name: item.name || `Item ${index + 1}`,
          value: item.value || item.count || 1,
          ...item
        }));

        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "area_chart":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {finalValueKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  fillOpacity={0.3}
                  name={key.replace(/_/g, " ").toUpperCase()}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "scatter_chart":
      case "quadrant":
        const scatterData = chartData.map(item => ({
          x: item.x || item.position?.x || item.value || Math.random() * 100,
          y: item.y || item.position?.y || (item.value ? item.value * 0.8 : Math.random() * 100),
          name: item.name || item.label,
          ...item
        }));

        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" name="X Axis" />
              <YAxis dataKey="y" type="number" name="Y Axis" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter 
                data={scatterData} 
                fill={CHART_COLORS[0]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "radar_chart":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              {finalValueKeys.map((key, index) => (
                <Radar
                  key={key}
                  dataKey={key}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  fillOpacity={0.6}
                  name={key.replace(/_/g, " ").toUpperCase()}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        );

      case "network":
        return <NetworkVisualization data={chartData} />;

      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={finalValueKeys[0] || "value"} fill={CHART_COLORS[0]} />
              <Line 
                type="monotone" 
                dataKey={finalValueKeys[0] || "value"} 
                stroke={CHART_COLORS[1]} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
    }
  };

  const renderSWOTAnalysis = () => {
    const strengths = chartData.filter(
      (d: any) => d.category === "strength" || d.type === "strength"
    );
    const weaknesses = chartData.filter(
      (d: any) => d.category === "weakness" || d.type === "weakness"
    );
    const opportunities = chartData.filter(
      (d: any) => d.category === "opportunity" || d.type === "opportunity"
    );
    const threats = chartData.filter(
      (d: any) => d.category === "threat" || d.type === "threat"
    );

    return (
      <div className="grid grid-cols-2 gap-4 min-h-64">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">
            Strengths ({strengths.length})
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            {strengths.slice(0, 5).map((item: any, index: number) => (
              <li key={index}>
                •{" "}
                {item.name ||
                  item.value ||
                  item.label ||
                  `Strength ${index + 1}`}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">
            Weaknesses ({weaknesses.length})
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            {weaknesses.slice(0, 5).map((item: any, index: number) => (
              <li key={index}>
                •{" "}
                {item.name ||
                  item.value ||
                  item.label ||
                  `Weakness ${index + 1}`}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">
            Opportunities ({opportunities.length})
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {opportunities.slice(0, 5).map((item: any, index: number) => (
              <li key={index}>
                •{" "}
                {item.name ||
                  item.value ||
                  item.label ||
                  `Opportunity ${index + 1}`}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 mb-2">
            Threats ({threats.length})
          </h4>
          <ul className="text-sm text-purple-700 space-y-1">
            {threats.slice(0, 5).map((item: any, index: number) => (
              <li key={index}>
                •{" "}
                {item.name || item.value || item.label || `Threat ${index + 1}`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderQuadrantAnalysis = () => (
    <div className="relative h-64 bg-gray-50 rounded-lg border">
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        <div className="border-r border-b p-4 bg-green-50">
          <h4 className="font-semibold text-sm text-green-800">
            High X / High Y
          </h4>
          <div className="text-xs text-green-600 mt-2">
            {chartData.filter((item: any) => item.quadrant === "q1").length}{" "}
            items
          </div>
        </div>
        <div className="border-b p-4 bg-blue-50">
          <h4 className="font-semibold text-sm text-blue-800">
            Low X / High Y
          </h4>
          <div className="text-xs text-blue-600 mt-2">
            {chartData.filter((item: any) => item.quadrant === "q2").length}{" "}
            items
          </div>
        </div>
        <div className="border-r p-4 bg-yellow-50">
          <h4 className="font-semibold text-sm text-yellow-800">
            Low X / Low Y
          </h4>
          <div className="text-xs text-yellow-600 mt-2">
            {chartData.filter((item: any) => item.quadrant === "q3").length}{" "}
            items
          </div>
        </div>
        <div className="p-4 bg-red-50">
          <h4 className="font-semibold text-sm text-red-800">High X / Low Y</h4>
          <div className="text-xs text-red-600 mt-2">
            {chartData.filter((item: any) => item.quadrant === "q4").length}{" "}
            items
          </div>
        </div>
      </div>
    </div>
  );

  const getVisualizationIcon = (type: string) => {
    switch (type) {
      case "network":
        return Network;
      case "timeline":
        return LineChartIcon;
      case "bar_chart":
        return BarChartIcon;
      case "pie_chart":
        return PieChartIcon;
      case "area_chart":
        return AreaChartIcon;
      case "scatter_chart":
        return ScatterChartIcon;
      case "radar_chart":
        return RadarIcon;
      case "quadrant":
        return GitMerge;
      case "swot":
        return Target;
      case "fishbone":
        return FishSymbol;
      case "causality":
        return Workflow;
      case "threat_matrix":
        return AlertOctagon;
      default:
        return BarChartIcon;
    }
  };

  const VisualizationIcon = getVisualizationIcon(visualization.type as string);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VisualizationIcon className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg">{visualization.title}</CardTitle>
          </div>
          <Badge variant="outline" className="bg-purple-100 text-purple-700">
            {(visualization.type as string).replace("_", " ").toUpperCase()}
          </Badge>
        </div>
        {visualization.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {removeMarkdownBold(visualization.description)}
          </p>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">
                Total Data Points: {chartData.length}
              </span>
              <Badge variant="outline">{visualization.type as string}</Badge>
            </div>
          </div>

          <div className="mt-4">
            {visualization.type === "swot" && renderSWOTAnalysis()}
            {visualization.type === "quadrant" && renderQuadrantAnalysis()}
            {!["swot", "quadrant"].includes(visualization.type as string) && renderChart()}
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                Data Insights
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • Data menunjukkan {chartData.length} entitas yang dianalisis
                </li>
                <li>• Visualisasi tipe: {visualization.type as string}</li>
                <li>
                  • Format data: {Array.isArray(chartData) ? "Array" : "Object"}
                </li>
              </ul>
            </div>
            {chartData.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  Data Summary
                </h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>
                    Nilai tertinggi:{" "}
                    {Math.max(...chartData.map((d: any) => d.value || 0))}
                  </p>
                  <p>
                    Nilai terendah:{" "}
                    {Math.min(...chartData.map((d: any) => d.value || 0))}
                  </p>
                  <p>
                    Rata-rata:{" "}
                    {(
                      chartData.reduce(
                        (acc: number, d: any) => acc + (d.value || 0),
                        0
                      ) / chartData.length
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ==================== MAIN AI QUERY INPUT COMPONENT ====================
interface AIQueryInputProps {
  onProcessComplete?: (data: any) => void;
  initialMode?: string;
  initialPersona?: string;
  initialModel?: string;
  onModeChange?: (mode: string) => void;
  onPersonaChange?: (persona: string) => void;
  onModelChange?: (model: string) => void;
}

interface AIQueryInputRef {
  setMode: (mode: string) => void;
  setPersona: (persona: string) => void;
  setModel: () => void;
  setQuery: (newQuery: string) => void;
}

const AIQueryInput = forwardRef<AIQueryInputRef, AIQueryInputProps>((props, ref) => {
  const [query, setQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState<string>(props.initialMode || "qa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string>(props.initialPersona || "analyst");
  const [showChat, setShowChat] = useState(true);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState<"disconnected" | "connected" | "error">("disconnected");
  const [selectedModel] = useState<string>("llama-3.3-70b-versatile");

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

  // Helper functions
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

  const transformSources = (sources: any): Source[] => {
    if (!sources) return [];
    try {
      const sourcesArray = safeArray<any>(sources);
      return sourcesArray.map((source, index) => ({
        id: source.id || `source-${index}`,
        content: removeMarkdownBold(source.content || source.data || source.text || "No content available"),
        metadata: {
          source: source.metadata?.source || source.source || source.type || "Unknown Source",
          category: source.metadata?.category || source.category || "General",
          classification: source.metadata?.classification || source.classification || "Publik",
          date: source.metadata?.date || source.date,
          author: source.metadata?.author || source.author,
        },
        score: typeof source.score === "number" ? source.score : typeof source.enhanced_score === "number" ? source.enhanced_score : 0.8,
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
    if (props.initialMode) setSelectedMode(props.initialMode);
    if (props.initialPersona) setSelectedPersona(props.initialPersona);
  }, [props.initialMode, props.initialPersona]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    setMode: (mode: string) => {
      setSelectedMode(mode);
      const newPersona = getModeConfig(mode).persona;
      setSelectedPersona(newPersona);
      props.onPersonaChange?.(newPersona);
    },
    setPersona: (persona: string) => {
      setSelectedPersona(persona);
    },
    setModel: () => {
      // Tidak melakukan apa-apa karena model tetap
    },
    setQuery: (newQuery: string) => {
      setQuery(newQuery);
    },
  }));

  // Handler untuk mode change
  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    props.onModeChange?.(mode);
    const newPersona = getModeConfig(mode).persona;
    setSelectedPersona(newPersona);
    props.onPersonaChange?.(newPersona);
  };

  const handlePersonaChange = (persona: string) => {
    setSelectedPersona(persona);
    props.onPersonaChange?.(persona);
  };

  // Get mode configuration
  const getModeConfig = (mode: string) => {
    return MODE_CONFIG[mode] || MODE_CONFIG.qa;
  };

  const getModeIcon = (mode: string) => {
    const Icon = getModeConfig(mode).icon;
    return <Icon className="w-3 h-3" />;
  };

  const getModeColor = (mode: string) => {
    return getModeConfig(mode).color;
  };

  // Initialize dengan welcome message
  useEffect(() => {
    setChatHistory([
      {
        id: "1",
        content: "Groq Llama 3.3 70B Versatile RAG System Ready! Gunakan mode Enhanced Visual untuk analisis visual dengan data real.",
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
            content: "Halo ada yang bisa saya bantu?",
            role: "assistant",
            timestamp: new Date(),
          },
        ]);
        setError("");
      } else {
        setApiStatus("error");
        setError(`Tidak dapat terhubung ke backend di ${BASE_URL}. Pastikan server backend berjalan.`);
      }
    } catch (error) {
      setApiStatus("error");
      setError(`Koneksi gagal: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      console.log(`Testing connection to: ${BASE_URL}`);
      const response = await fetch(`${BASE_URL}/api/chat/health`, {
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

  const processQuery = async (userQuery: string): Promise<ChatMessage> => {
    const startTime = Date.now();
  
    try {
      let result: SmartQueryResponse;
      
      // Gunakan enhanced visual untuk mode visual, lainnya advanced query
      if (selectedMode === "enhanced_visual") {
        result = await enhancedVisualRequest(userQuery);
      } else {
        const qaResult = await advancedQuery(userQuery, getAdvancedQueryOptions());
        result = {
          type: "text_response",
          answer: qaResult.answer,
          sources: qaResult.sources,
          model: qaResult.model,
        } as SmartQueryResponse;
      }
  
      const processingTime = Date.now() - startTime;
      console.log("📊 Raw API Response:", result);
  
      const transformedSources = transformSources(result.sources);
  
      let analysisResults: AnalysisResult[] = [];
      let transformedVisualization: EnhancedVisualizationData | undefined;
  
      if (result.type === "visual_analysis" && result.visualization) {
        const fixedData = validateAndFixAnalysisData(result.visualization.data || result.visualization);
        
        transformedVisualization = {
          ...result.visualization,
          data: fixedData,
          intent_analysis: result.intent_analysis,
          data_summary: result.data_summary,
          metadata: {
            data_source: result.data_source || "generated_data",
            is_real_data: result.is_real_data || false,
            generated_at: result.metadata?.generated_at || new Date().toISOString(),
            real_data_sources: result.metadata?.real_data_sources || [],
          },
          suggestions: result.suggestions || [],
        };
  
        analysisResults = [
          {
            type: result.visualization.type || "chart",
            title: result.visualization.title || "Visual Analysis",
            data: fixedData,
            narrative: removeMarkdownBold(result.narrative || result.visualization.narrative || ''),
            insights: result.visualization.insights || [],
            recommendations: result.visualization.recommendations || [],
          },
        ];
      } else if (result.analysis_results && result.analysis_results.length > 0) {
        analysisResults = result.analysis_results.map((analysis: any) => ({
          type: analysis.type || "analysis",
          title: analysis.title || `Analysis ${analysis.type}`,
          data: validateAndFixAnalysisData(analysis.data || analysis.structure || analysis),
          narrative: analysis.narrative || result.narrative,
          insights: analysis.insights || [],
          recommendations: analysis.recommendations || [],
          structure: analysis.structure,
          analysis: analysis.analysis,
          metadata: analysis.metadata
        }));
        
        const firstAnalysis = analysisResults[0];
        transformedVisualization = {
          type: firstAnalysis.type,
          data: firstAnalysis.data,
          title: firstAnalysis.title,
          description: firstAnalysis.narrative,
          narrative: firstAnalysis.narrative,
          insights: firstAnalysis.insights,
          recommendations: firstAnalysis.recommendations,
          metadata: {
            data_source: result.data_source || "real_data",
            is_real_data: result.is_real_data || true,
            generated_at: result.metadata?.generated_at || new Date().toISOString(),
            real_data_sources: result.metadata?.real_data_sources || [],
          }
        };
      } else if (result.type === "text_response" && result.answer) {
        analysisResults = [
          {
            type: "text",
            title: "AI Response",
            data: { items: [] },
            narrative: removeMarkdownBold(result.answer),
            insights: ["Response berhasil di-generate"],
            recommendations: ["Gunakan query yang lebih spesifik untuk visualisasi"],
          },
        ];
      }
  
      const responseData: ChatMessage = {
        id: Date.now().toString(),
        content: removeMarkdownBold(
          result.answer ||
          result.narrative ||
          result.visualization?.narrative ||
          "Analisis berhasil di-generate."
        ),
        role: "assistant",
        timestamp: new Date(),
        sources: transformedSources,
        visualization: transformedVisualization,
        modelUsed: result.model || "llama-3.3-70b-versatile",
        confidence: result.intent_analysis?.confidence || result.enhanced_metadata?.confidence_score || 75,
        processingTime,
        analysis_results: analysisResults,
        enhanced_metadata: {
          query_type: result.type,
          data_source: result.data_source || "generated_data",
          is_real_data: result.is_real_data || false,
          data_points: result.data_summary?.data_points || result.enhanced_metadata?.data_points || 0,
          visualization_type: result.visualization?.type,
          data_generated: result.data_summary?.generated_data || false,
          real_data_confidence: result.data_summary?.confidence,
          suggestions: result.suggestions,
          analysis_type: result.enhanced_metadata?.analysis_type,
          processing_steps: result.enhanced_metadata?.processing_steps,
          total_processing_time: result.enhanced_metadata?.total_processing_time,
          confidence_score: result.enhanced_metadata?.confidence_score,
          visual_quality: result.enhanced_metadata?.visual_quality,
        },
      };
  
      console.log("✅ Final response data:", responseData);
  
      if (props.onProcessComplete) {
        props.onProcessComplete(responseData);
      }
  
      return responseData;
    } catch (error) {
      console.error("❌ Error processing query:", error);
      throw error;
    }
  };

  const getAdvancedQueryOptions = () => {
    switch (selectedMode) {
      case "summary":
        return { enable_summarization: true };
      case "ide":
        return { enable_ideation: true };
      case "risk":
        return { enable_risk_analysis: true };
      default:
        return {};
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
        setUploadSuccess(`${result.data.successful} file berhasil diupload!`);
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
      let token;
      try {
        token = getToken();
        console.log("🔐 Token validated successfully");
      } catch (tokenError) {
        console.error("❌ Token validation failed:", tokenError);
        throw new Error("Anda perlu login terlebih dahulu. Silakan login untuk menggunakan fitur ini.");
      }
  
      const aiResponse = await processQuery(query);
      setChatHistory((prev) => [...prev, aiResponse]);
      
    } catch (error) {
      console.error("❌ Error in handleProcess:", error);
      
      let errorMessage = "Terjadi error yang tidak diketahui";
      let shouldRedirectToLogin = false;
  
      if (error instanceof Error) {
        if (error.message.includes("Token tidak ditemukan") || 
            error.message.includes("Anda perlu login") ||
            error.message.includes("Authorization header is required") ||
            error.message.includes("401") ||
            error.message.includes("Unauthorized")) {
          
          errorMessage = "❌ Session telah berakhir. Silakan login ulang.";
          shouldRedirectToLogin = true;
          
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          
        } else {
          errorMessage = `❌ ${error.message}`;
        }
      }
  
      const errorMessageObj: ChatMessage = {
        id: Date.now().toString(),
        content: errorMessage,
        role: "assistant",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessageObj]);
      setError(errorMessage);
      setApiStatus("error");
  
      if (shouldRedirectToLogin) {
        setTimeout(() => {
          console.log("🔄 Redirecting to login page...");
          window.location.href = "/login";
        }, 3000);
      }
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
        content: "Percakapan telah dibersihkan. Groq Llama 3.3 70B Versatile RAG System siap digunakan!",
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
        return "Orchestrator System Ready";
      case "error":
        return "Orchestrator System Error";
      default:
        return "Connecting to Orchestrator";
    }
  };

  const getModelDisplayName = (model: string): string => {
    return AVAILABLE_MODELS[model as keyof typeof AVAILABLE_MODELS]?.name || model;
  };

  const getModelColor = (model: string): string => {
    return AVAILABLE_MODELS[model as keyof typeof AVAILABLE_MODELS]?.color || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getClassificationColor = (classification: string): string => {
    return CLASSIFICATION_LEVELS[classification as keyof typeof CLASSIFICATION_LEVELS]?.color || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getClassificationIcon = (classification: string) => {
    const Icon = CLASSIFICATION_LEVELS[classification as keyof typeof CLASSIFICATION_LEVELS]?.icon || Shield;
    return <Icon className="w-3 h-3" />;
  };

  const getVisualizationIcon = (type: string) => {
    const Icon = VISUALIZATION_TYPES[type as keyof typeof VISUALIZATION_TYPES]?.icon || FileBarChart;
    return <Icon className="w-4 h-4" />;
  };

  const getVisualizationColor = (type: string) => {
    return VISUALIZATION_TYPES[type as keyof typeof VISUALIZATION_TYPES]?.color || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getVisualizationLabel = (type: string) => {
    return VISUALIZATION_TYPES[type as keyof typeof VISUALIZATION_TYPES]?.label || type;
  };

  // Komponen untuk menampilkan visual analysis dengan visualisasi otomatis
  const VisualAnalysisContent = ({ message }: { message: ChatMessage }) => {
    const analyses = message.analysis_results || (message.visualization ? [message.visualization] : []);
    const [selectedVizIndex, setSelectedVizIndex] = useState(0);

    if (!analyses || analyses.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <FileBarChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Tidak ada data analisis visual untuk ditampilkan</p>
        </div>
      );
    }

    const currentAnalysis = analyses[selectedVizIndex];
    const narrative = currentAnalysis.narrative;
    const insights = currentAnalysis.insights || [];
    const recommendations = currentAnalysis.recommendations || [];

    return (
      <div className="space-y-6">
        {analyses.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {analyses.map((analysis: any, index: number) => (
              <Button
                key={index}
                variant={selectedVizIndex === index ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedVizIndex(index)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                {getVisualizationIcon(analysis.type)}
                {analysis.title || `Visualization ${index + 1}`}
              </Button>
            ))}
          </div>
        )}

        <VisualizationRenderer
          visualization={{
            type: currentAnalysis.type || "chart",
            data: validateAndFixAnalysisData(currentAnalysis.data),
            title: currentAnalysis.title || "Visual Analysis",
            description: narrative,
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {insights.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {safeArray<string>(insights).map((insight: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{removeMarkdownBold(insight)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {recommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {safeArray<string>(recommendations).map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{removeMarkdownBold(rec)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  // Komponen untuk menampilkan konten berdasarkan mode
  const MessageContent = ({ message }: { message: ChatMessage }) => {
    const hasSources = message.sources && message.sources.length > 0;
    const hasVisualization = message.analysis_results || message.visualization;
    const queryType = message.enhanced_metadata?.query_type;
  
    const SourcesContent = ({ sources }: { sources: Source[] }) => (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Search className="w-3 h-3 text-blue-500" />
          <span className="text-xs font-medium text-blue-700">
            Sumber Referensi ({sources.length})
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {sources.map((source, index) => (
            <Badge
              key={source.id}
              variant="secondary"
              className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer"
              title={`${source.metadata.source} - ${source.content.substring(0, 100)}...`}
            >
              {source.metadata.source}
              {source.score && (
                <span className="text-xs opacity-70 ml-1">
                  ({Math.round(source.score * 100)}%)
                </span>
              )}
            </Badge>
          ))}
        </div>
      </div>
    );
  
    const MetadataContent = ({ message }: { message: ChatMessage }) => {
      if (!message.enhanced_metadata) return null;
    
      return (
        <div className="pt-4 border-t border-border/50 space-y-3">
          {/* Advanced Visual Metadata */}
          {message.enhanced_metadata.analysis_type === "social_network_analysis" && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Network className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-800">Social Network Analysis</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Processing Steps:</strong>
                  <ul className="text-xs mt-1 space-y-1">
                    {message.enhanced_metadata.processing_steps?.map((step: string, index: number) => (
                      <li key={index}>• {step}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Analysis Metrics:</strong>
                  <div className="text-xs mt-1 space-y-1">
                    <div>• Data Points: {message.enhanced_metadata.data_points}</div>
                    <div>• Confidence: {message.enhanced_metadata.confidence_score}%</div>
                    <div>• Quality: {message.enhanced_metadata.visual_quality}</div>
                    <div>• Processing Time: {message.enhanced_metadata.total_processing_time}ms</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {message.enhanced_metadata.data_source === "real_data" ? (
              <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                <Database className="w-3 h-3 mr-1" />
                Real Data
                {message.enhanced_metadata.real_data_confidence && (
                  <span className="ml-1">({Math.round(message.enhanced_metadata.real_data_confidence * 100)}%)</span>
                )}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Generated Data
              </Badge>
            )}
            
            {message.enhanced_metadata.data_points && (
              <Badge variant="outline" className="text-xs">
                📊 {message.enhanced_metadata.data_points} data points
              </Badge>
            )}
          </div>
    
          {message.enhanced_metadata.query_type && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                Type: {message.enhanced_metadata.query_type}
              </Badge>
            </div>
          )}
    
          {message.visualization?.intent_analysis && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <div className="font-medium text-yellow-800 mb-1">AI Analysis:</div>
              <div className="text-yellow-700">
                {message.visualization.intent_analysis.reasoning}
              </div>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  Confidence: {Math.round(message.visualization.intent_analysis.confidence * 100)}%
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Type: {message.visualization.intent_analysis.recommendedType}
                </Badge>
              </div>
            </div>
          )}
    
          {message.enhanced_metadata.suggestions && message.enhanced_metadata.suggestions.length > 0 && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <div className="font-medium text-blue-800 mb-1">Suggestions:</div>
              <ul className="text-blue-700 space-y-1">
                {message.enhanced_metadata.suggestions.map((suggestion: string, index: number) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    };
  
    switch (queryType) {
      case "visual_analysis":
        return (
          <div className="space-y-6">
            {hasVisualization && <VisualAnalysisContent message={message} />}
            <MetadataContent message={message} />
            {hasSources && (
              <div className="pt-4 border-t border-border/50">
                <SourcesContent sources={message.sources!} />
              </div>
            )}
          </div>
        );
  
      case "text_response":
        return (
          <div className="space-y-6">
            <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
              {removeMarkdownBold(message.content)}
            </div>
            <MetadataContent message={message} />
            {hasSources && (
              <div className="pt-4 border-t border-border/50">
                <SourcesContent sources={message.sources!} />
              </div>
            )}
          </div>
        );
  
      default:
        return (
          <div className="space-y-6">
            {hasVisualization && <VisualAnalysisContent message={message} />}
            <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
              {removeMarkdownBold(message.content)}
            </div>
            <MetadataContent message={message} />
            {hasSources && (
              <div className="pt-4 border-t border-border/50">
                <SourcesContent sources={message.sources!} />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Card className="flex flex-col h-[800px]">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Query Input - {getModeConfig(selectedMode).name} Mode
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full border border-purple-200">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                {getModeConfig(selectedMode).name} Mode
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
              <RefreshCw className={cn("w-4 h-4", isProcessing && "animate-spin")} />
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
                <Badge variant="default" className={cn("text-xs", getModelColor(selectedModel))}>
                  {getModelDisplayName(selectedModel)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {AI_PERSONAS[selectedPersona as keyof typeof AI_PERSONAS]?.name || "Analyst"}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", getModeColor(selectedMode))}>
                  {getModeIcon(selectedMode)}
                  {getModeConfig(selectedMode).name}
                </Badge>

                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <Filter className="w-3 h-3 mr-1" />
                    Classification
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <Cpu className="w-3 h-3 mr-1" />
                    Tools
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
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
              {getModeConfig(selectedMode).description}
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
                          message.role === "user" ? "justify-end" : "justify-start"
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
                                  <Badge variant="outline" className={cn("text-xs", getModelColor(message.modelUsed))}>
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
                              {message.role === "assistant" && message.confidence && (
                                <span className="font-medium">
                                  {message.confidence}% confidence
                                </span>
                              )}
                            </div>
                          </div>

                          {message.role === "assistant" ? (
                            <MessageContent message={message} />
                          ) : (
                            <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                              {removeMarkdownBold(message.content)}
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
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                              </div>
                              {selectedMode === "enhanced_visual" ? "Memproses Enhanced Visual Analysis..." : "Memproses Jawaban..."}
                              <Badge variant="outline" className={cn("text-xs ml-2", getModelColor(selectedModel))}>
                                {getModelDisplayName(selectedModel)}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                Classification
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                Tool Calling
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                                Security
                              </Badge>
                              {selectedMode === "enhanced_visual" && (
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                  Enhanced Visual Analysis
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
              placeholder={getModeConfig(selectedMode).description}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[60px] resize-none text-sm"
              disabled={isProcessing}
            />

            {/* Template Queries */}
            <div className="grid grid-cols-2 gap-2">
              {(QUERY_TEMPLATES[selectedMode] || [])
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
              <Select value={selectedMode} onValueChange={handleModeChange} disabled={isProcessing}>
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

              <Select value={selectedPersona} onValueChange={handlePersonaChange} disabled={isProcessing}>
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

              {/* Model Selector - Hanya menampilkan satu model */}
              <div className="flex items-center gap-2 px-2 py-1 border rounded-md bg-purple-50 text-purple-700 border-purple-200">
                <Rocket className="w-3 h-3" />
                <span className="text-xs font-medium">Llama 3.3 70B</span>
              </div>
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
                    <span className="text-xs">Send</span>
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
                      <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
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
                    onValueChange={(value: keyof typeof CLASSIFICATION_LEVELS) =>
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
                      {Object.entries(CLASSIFICATION_LEVELS).map(([key, level]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {getClassificationIcon(key)}
                            <span>{level.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {CLASSIFICATION_LEVELS[uploadMetadata.classification]?.description}
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
                        const input = document.querySelector('input[placeholder="Tambahkan tag..."]') as HTMLInputElement;
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