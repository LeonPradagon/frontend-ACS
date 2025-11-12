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
  GitGraph,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EnhancedOntologyContent } from "./ontology/ontology-visualizations";
import { UniversalD3Visualization } from "./visualisasi/universal-d3-visualization";

// Komponen untuk merender teks dengan markdown sederhana
const MarkdownText = ({ text }: { text: string }) => {
  if (!text) return null;

  const processText = (content: string) => {
    const lines = content.split("\n");
    const elements = [];
    let inList = false;
    let listItems = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // H3: ### Heading
      if (line.startsWith("### ")) {
        // Jika sebelumnya ada list, tutup dulu
        if (inList) {
          elements.push(
            <ul key={`list-${i}`} className="list-disc ml-6 mb-2">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-gray-700">
            {line.replace("### ", "")}
          </h3>
        );
      }
      // H2: ## Heading
      else if (line.startsWith("## ")) {
        if (inList) {
          elements.push(
            <ul key={`list-${i}`} className="list-disc ml-6 mb-2">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h2 key={i} className="text-xl font-bold mt-5 mb-3 text-gray-800">
            {line.replace("## ", "")}
          </h2>
        );
      }
      // H1: # Heading
      else if (line.startsWith("# ")) {
        if (inList) {
          elements.push(
            <ul key={`list-${i}`} className="list-disc ml-6 mb-2">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h1
            key={i}
            className="text-2xl font-bold mt-6 mb-4 text-gray-900 border-b pb-2"
          >
            {line.replace("# ", "")}
          </h1>
        );
      }
      // H4: #### Heading
      else if (line.startsWith("#### ")) {
        if (inList) {
          elements.push(
            <ul key={`list-${i}`} className="list-disc ml-6 mb-2">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <h4 key={i} className="text-md font-medium mt-3 mb-1 text-gray-600">
            {line.replace("#### ", "")}
          </h4>
        );
      }
      // List item: - item atau * item
      else if (line.startsWith("- ") || line.startsWith("* ")) {
        inList = true;
        listItems.push(
          <li key={`item-${i}`} className="mb-1">
            {line.substring(2).replace(/\*\*/g, "")}
          </li>
        );
      }
      // Garis horizontal: ---
      else if (line.trim() === "---") {
        if (inList) {
          elements.push(
            <ul key={`list-${i}`} className="list-disc ml-6 mb-2">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(<hr key={i} className="my-4 border-gray-300" />);
      }
      // Blockquotes: > text
      else if (line.startsWith("> ")) {
        if (inList) {
          elements.push(
            <ul key={`list-${i}`} className="list-disc ml-6 mb-2">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        elements.push(
          <blockquote
            key={i}
            className="border-l-4 border-blue-500 pl-4 my-2 text-gray-600 italic"
          >
            {line.replace("> ", "")}
          </blockquote>
        );
      }
      // Regular text
      else {
        // Jika line kosong dan sebelumnya ada list, tutup list
        if (line.trim() === "" && inList) {
          elements.push(
            <ul key={`list-${i}`} className="list-disc ml-6 mb-2">
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
          elements.push(<br key={i} />);
        }
        // Jika masih dalam list dan line tidak kosong, tambahkan sebagai list item
        else if (inList && line.trim() !== "") {
          listItems.push(
            <li key={`item-${i}`} className="mb-1">
              {line.replace(/\*\*/g, "")}
            </li>
          );
        }
        // Regular paragraph
        else if (line.trim() !== "") {
          if (inList) {
            elements.push(
              <ul key={`list-${i}`} className="list-disc ml-6 mb-2">
                {listItems}
              </ul>
            );
            listItems = [];
            inList = false;
          }
          elements.push(
            <p key={i} className="mb-2">
              {line.replace(/\*\*/g, "")}
            </p>
          );
        }
        // Empty line
        else {
          if (inList) {
            elements.push(
              <ul key={`list-${i}`} className="list-disc ml-6 mb-2">
                {listItems}
              </ul>
            );
            listItems = [];
            inList = false;
          }
          elements.push(<br key={i} />);
        }
      }
    }

    // Tutup list yang tersisa di akhir
    if (inList) {
      elements.push(
        <ul key="list-final" className="list-disc ml-6 mb-2">
          {listItems}
        </ul>
      );
    }

    return elements;
  };

  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
      {processText(text)}
    </div>
  );
};

const removeMarkdownBold = (text: string): string => {
  if (!text) return "";
  return text.replace(/\*\*/g, "").replace(/\*/g, "");
};

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
  ontology_data?: OntologyResponse;
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

// ==================== ONTOLOGY TYPES ====================
interface OntologyNode {
  id: string;
  label: string;
  type: string;
  confidence?: number;
  categories?: string[];
  metadata?: any;
  size?: number;
  color?: string;
}

interface OntologyEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: string;
  confidence?: number;
  width?: number;
  color?: string;
  metadata?: any;
}

interface OntologyGraph {
  nodes: OntologyNode[];
  edges: OntologyEdge[];
  metadata?: {
    total_nodes: number;
    total_edges: number;
    node_types: string[];
    edge_types: string[];
    density: number;
    generation_method?: string;
  };
}

interface OntologyExtractionResults {
  entities: any[];
  relations: any[];
  events: any[];
  metadata?: {
    extraction_method: string;
    total_entities: number;
    total_relations: number;
    total_events: number;
  };
}

interface OntologyResponse {
  success: boolean;
  question: string;
  mode: string;
  timestamp: string;
  metadata: {
    processing_time: number;
    user_role: string;
    model: string;
    output_format: string;
    analysis_depth: string;
  };
  analysis?: {
    narrative: string;
    rag_context?: any;
    ontology?: OntologyExtractionResults;
    visualization?: any;
    statistics?: any;
    graph?: OntologyGraph;
  };
  narrative?: string;
  key_findings?: any;
  graph_summary?: any;
  visualization?: any;
  graph_info?: any;
  insights?: any[];
  recommendations?: any[];
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
  description?: string;
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
  type:
    | "visual_analysis"
    | "text_response"
    | "swot_analysis"
    | "trend_analysis"
    | "advanced_visual_analysis"
    | "ontology_analysis";
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
  ontology_data?: OntologyResponse;
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
  ontologist: {
    name: "Ontology Expert",
    description: "Spesialis analisis hubungan dan knowledge graph",
    icon: GitGraph,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
};

// ==================== MODEL CONFIGURATIONS ====================
const AVAILABLE_MODELS = {
  "llama-3.3-70b-versatile": {
    name: "Llama 3.3 70B Versatile",
    description:
      "Model Groq terbaru dengan kecepatan tinggi dan reasoning yang excellent",
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

// ==================== VISUALIZATION TYPE CONFIGURATIONS ====================
const VISUALIZATION_TYPES = {
  network: {
    icon: Network,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    label: "Analisis Jaringan",
  },
  timeline: {
    icon: LineChartIcon,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    label: "Analisis Timeline",
  },
  bar_chart: {
    icon: BarChartIcon,
    color: "bg-green-100 text-green-700 border-green-200",
    label: "Analisis Perbandingan",
  },
  pie_chart: {
    icon: PieChartIcon,
    color: "bg-pink-100 text-pink-700 border-pink-200",
    label: "Analisis Distribusi",
  },
  area_chart: {
    icon: AreaChartIcon,
    color: "bg-teal-100 text-teal-700 border-teal-200",
    label: "Analisis Tren",
  },
  scatter_chart: {
    icon: ScatterChartIcon,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    label: "Analisis Korelasi",
  },
  radar_chart: {
    icon: RadarIcon,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    label: "Analisis Radar",
  },
  quadrant: {
    icon: GitMerge,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    label: "Analisis Kuadran",
  },
  swot: {
    icon: Target,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    label: "Analisis SWOT",
  },
  fishbone: {
    icon: FishSymbol,
    color: "bg-red-100 text-red-700 border-red-200",
    label: "Analisis Akar Masalah",
  },
  causality: {
    icon: Workflow,
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    label: "Analisis Sebab-Akibat",
  },
  threat_matrix: {
    icon: AlertOctagon,
    color: "bg-gray-100 text-gray-700 border-gray-200",
    label: "Matriks Ancaman",
  },
  knowledge_graph: {
    icon: GitGraph,
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    label: "Graf Pengetahuan",
  },
  entity_network: {
    icon: Network,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    label: "Jaringan Entitas",
  },
};

// ==================== BASE URL CONFIGURATION ====================
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ==================== MODE CONFIGURATIONS ====================
const MODE_CONFIG: {
  [key: string]: {
    name: string;
    description: string;
    icon: any;
    color: string;
    persona: keyof typeof AI_PERSONAS;
    endpoint?: string;
  };
} = {
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
  ontology: {
    name: "Ontology Analysis",
    description: "Analisis knowledge graph dan hubungan entitas",
    icon: GitGraph,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    persona: "ontologist",
    endpoint: "ontology",
  },
};

// ==================== ONTOLOGY MODE CONFIGURATIONS ====================
const ONTOLOGY_MODES = {
  auto: {
    name: "Deteksi Otomatis",
    description: "Sistem akan memilih mode terbaik secara otomatis",
    icon: Zap,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  extraction: {
    name: "Ekstraksi Entitas",
    description: "Mengidentifikasi entitas dan hubungannya",
    icon: Network,
    color: "bg-green-100 text-green-700 border-green-200",
  },
  knowledge_graph: {
    name: "Graf Pengetahuan",
    description: "Membuat visualisasi hubungan pengetahuan",
    icon: GitGraph,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  comprehensive: {
    name: "Analisis Menyeluruh",
    description: "Analisis lengkap dengan berbagai perspektif",
    icon: Brain,
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  quick: {
    name: "Analisis Cepat",
    description: "Analisis cepat untuk insight langsung",
    icon: Rocket,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
};

// ==================== API SERVICE FUNCTIONS ====================

const getToken = (): string => {
  if (typeof window === "undefined") {
    throw new Error("Window tidak tersedia");
  }

  const token = localStorage.getItem("accessToken");
  console.log(
    "🔐 Token retrieval:",
    token ? `✅ Ditemukan (${token.substring(0, 20)}...)` : "❌ Tidak ditemukan"
  );

  if (!token) {
    console.error("❌ Token akses tidak ditemukan di localStorage");
    throw new Error(
      "Token tidak ditemukan. Silakan refresh halaman atau coba lagi."
    );
  }

  if (!token.startsWith("eyJ") || token.length < 50) {
    console.error("❌ Format token tidak valid");
    localStorage.removeItem("accessToken");
    throw new Error("Token tidak valid. Silakan refresh halaman.");
  }

  return token;
};

/**
 * Ontology Analysis Request
 */
const ontologyRequest = async (
  question: string,
  options: any = {}
): Promise<OntologyResponse> => {
  try {
    const token = getToken();
    console.log(
      `🧠 Mengirim permintaan analisis hubungan ke: ${BASE_URL}/api/chat/ontology`
    );

    const response = await fetch(`${BASE_URL}/api/chat/ontology`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question,
        model: "llama-3.3-70b-versatile",
        mode: options.mode || "auto",
        enable_visualization: true,
        output_format: "complete",
        ...options,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Permintaan analisis hubungan gagal: ${response.status}`,
        errorText
      );
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Respons analisis hubungan:`, data);

    return data;
  } catch (error) {
    console.error("❌ Error permintaan analisis hubungan:", error);
    throw error;
  }
};

/**
 * Enhanced Visual Request dengan pencarian data real
 */
const enhancedVisualRequest = async (
  question: string,
  options = {}
): Promise<SmartQueryResponse> => {
  try {
    const token = getToken();
    console.log(
      `🤖 Mengirim permintaan analisis visual ke: ${BASE_URL}/api/chat/visual-analysis`
    );

    const response = await fetch(`${BASE_URL}/api/chat/universal-visual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
      console.error(
        `❌ Permintaan analisis visual gagal: ${response.status}`,
        errorText
      );
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Respons analisis visual:`, data);

    return transformEnhancedVisualResponse(data);
  } catch (error) {
    console.error("❌ Error permintaan analisis visual:", error);
    throw error;
  }
};

const transformEnhancedVisualResponse = (data: any): SmartQueryResponse => {
  console.log("🔄 Mengubah respons analisis visual:", data);

  const defaultVisualizationData: EnhancedVisualizationData = {
    type: "fallback",
    data: { items: [] },
    title: "Hasil Analisis",
    description: "Hasil analisis berhasil di-generate",
    narrative: data.answer || data.narrative || "Analisis berhasil di-generate",
    insights: ["Analisis selesai"],
    recommendations: ["Coba gunakan pertanyaan yang lebih spesifik"],
    metadata: {
      data_source: "fallback",
      is_real_data: false,
      generated_at: data.timestamp || new Date().toISOString(),
      real_data_sources: data.sources || [],
    },
  };

  let visualizationData: EnhancedVisualizationData = defaultVisualizationData;
  let analysisResults: AnalysisResult[] = [];

  if (data.visualization) {
    const fixedData = validateAndFixAnalysisData(data.visualization.data);

    visualizationData = {
      ...data.visualization,
      data: fixedData,
      description:
        data.visualization.description || data.narrative || "Analisis Visual",
      metadata: {
        data_source: data.data_source || "generated_data",
        is_real_data: data.is_real_data || false,
        generated_at: data.timestamp || new Date().toISOString(),
        real_data_sources: data.sources || [],
      },
    };

    analysisResults = [
      {
        type: data.visualization.type || "visual_analysis",
        title: data.visualization.title || "Analisis Visual",
        data: fixedData,
        description: data.visualization.description || data.narrative,
        narrative: data.narrative || data.visualization.narrative || "",
        insights: data.visualization.insights || [],
        recommendations: data.visualization.recommendations || [],
      },
    ];
  }

  if (data.answer && visualizationData === defaultVisualizationData) {
    visualizationData = {
      type: "text",
      data: { items: [] },
      title: "Analisis Teks",
      description: "Analisis teks berhasil dilakukan",
      narrative: data.answer,
      insights: ["Respons berhasil di-generate"],
      recommendations: [
        "Gunakan pertanyaan yang lebih spesifik untuk visualisasi",
      ],
      metadata: {
        data_source: "text_response",
        is_real_data: false,
        generated_at: data.timestamp || new Date().toISOString(),
        real_data_sources: [],
      },
    };

    analysisResults = [
      {
        type: "text_response",
        title: "Respons AI",
        data: { items: [] },
        narrative: data.answer,
        insights: ["Respons berhasil di-generate"],
        recommendations: [
          "Gunakan pertanyaan yang lebih spesifik untuk visualisasi",
        ],
      },
    ];
  }

  const response: SmartQueryResponse = {
    type: "visual_analysis",
    visualization: visualizationData,
    narrative: data.narrative || data.answer || "",
    data_summary: {
      data_points:
        data.enhanced_metadata?.data_points ||
        data.data_summary?.data_points ||
        0,
      data_type: visualizationData.type || "analysis",
      generated_data: !data.is_real_data,
      confidence:
        data.enhanced_metadata?.confidence_score ||
        data.data_summary?.confidence,
    },
    answer: data.answer,
    sources: data.sources,
    model: "llama-3.3-70b-versatile",
    data_source:
      data.data_source || (data.is_real_data ? "real_data" : "generated_data"),
    is_real_data: data.is_real_data || false,
    suggestions: data.suggestions || [
      "Gunakan pertanyaan yang lebih spesifik untuk hasil yang lebih akurat",
      "Coba mode analisis yang berbeda untuk perspektif lain",
    ],
    analysis_results: analysisResults,
    enhanced_metadata: data.enhanced_metadata,
    metadata: {
      question: data.question,
      visualization_type: visualizationData.type,
      data_source: data.data_source || "generated_data",
      generated_at: data.timestamp || new Date().toISOString(),
      model: "llama-3.3-70b-versatile",
      real_data_sources: data.sources || [],
    },
  };

  console.log("✅ Respons analisis visual berhasil diubah:", response);
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

    console.log(
      `📤 Mengirim pertanyaan ke: ${BASE_URL}/api/chat/advanced-query`
    );

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
      console.error(`Query lanjutan gagal: ${response.status}`, errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Query lanjutan berhasil`, data);
    return data;
  } catch (error) {
    console.error("Error query lanjutan:", error);
    throw error;
  }
};

// ==================== DATA VALIDATION & TRANSFORMATION ====================

const validateAndFixAnalysisData = (data: any): any => {
  console.log("🔧 Data asli untuk visualisasi:", data);

  if (!data) {
    console.warn("❌ Data kosong atau tidak terdefinisi");
    return { items: [] };
  }

  // SPECIAL CASE: Network data
  if (data.type === "network" || data.visualizationType === "network") {
    console.log("✅ Struktur data jaringan terdeteksi");

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
        metadata: data.metadata,
      };
    }
  }

  // Case 1: Data dari VisualAnalysisService (format baru)
  if (data.data && data.data.datasets) {
    console.log("✅ Format Chart.js terdeteksi");
    const items =
      data.data.labels?.map((label: string, index: number) => {
        const item: any = { name: label };
        data.data.datasets.forEach((dataset: any) => {
          if (dataset.data && Array.isArray(dataset.data)) {
            const value = dataset.data[index];
            item[dataset.label || "value"] =
              typeof value === "number" ? value : 1;
          }
        });
        return item;
      }) || [];
    return { items: items.filter(Boolean) };
  }

  // Case 2: Data sudah dalam format yang benar { items: [...] }
  if (data.items && Array.isArray(data.items)) {
    console.log("✅ Data sudah memiliki array items");
    return data;
  }

  // Case 3: Data adalah array langsung
  if (Array.isArray(data)) {
    console.log("✅ Data adalah array langsung, membungkus dalam items");
    return { items: data };
  }

  // Case 4: Data adalah object dengan properti array
  const arrayKeys = Object.keys(data).filter(
    (key) => Array.isArray(data[key]) && data[key].length > 0
  );

  if (arrayKeys.length > 0) {
    console.log(`✅ Kunci array ditemukan:`, arrayKeys);

    if (arrayKeys.includes("data")) {
      return { items: data.data };
    }

    const longestArrayKey = arrayKeys.reduce((longest, key) =>
      data[key].length > data[longest].length ? key : longest
    );
    return { items: data[longestArrayKey] };
  }

  // Case 5: Data dari quadrant analysis
  if (data.quadrants && typeof data.quadrants === "object") {
    console.log("✅ Data analisis kuadran terdeteksi");
    const items: any[] = [];
    Object.values(data.quadrants).forEach((quadrant: any) => {
      if (Array.isArray(quadrant.items)) {
        quadrant.items.forEach((item: any) => {
          items.push({
            name: item.label || `Item_${items.length}`,
            value: 1,
            quadrant: quadrant.label || "unknown",
            ...item,
          });
        });
      }
    });
    return { items };
  }

  // Case 6: Data dari SWOT analysis
  if (data.factors && typeof data.factors === "object") {
    console.log("✅ Data analisis SWOT terdeteksi");
    const items: any[] = [];
    Object.entries(data.factors).forEach(
      ([category, factors]: [string, any]) => {
        if (Array.isArray(factors)) {
          factors.forEach((factor: any, index: number) => {
            items.push({
              name:
                typeof factor === "string"
                  ? factor
                  : factor.name || `Faktor_${index}`,
              value: 1,
              category: category,
              ...(typeof factor === "object" ? factor : {}),
            });
          });
        }
      }
    );
    return { items };
  }

  // Case 7: Data adalah object biasa - convert ke array
  if (typeof data === "object") {
    console.log("✅ Mengubah object menjadi array");
    try {
      const values = Object.values(data);
      if (
        values.length > 0 &&
        values.every((item) => typeof item === "object" && item !== null)
      ) {
        return { items: values };
      }

      const items = Object.entries(data).map(([key, value]) => {
        const item: any = { name: key };

        if (typeof value === "number") {
          item.value = value;
        } else if (typeof value === "object" && value !== null) {
          Object.assign(item, value);
        } else {
          item.value = 1;
          item.rawValue = value;
        }

        return item;
      });
      return { items };
    } catch (error) {
      console.error("Error mengubah object:", error);
    }
  }

  // Case 8: Fallback - return empty array dengan sample data
  console.warn(
    "❌ Tidak ada struktur data yang valid ditemukan, menggunakan fallback"
  );
  return {
    items: [
      { name: "Contoh 1", value: 30, category: "A" },
      { name: "Contoh 2", value: 45, category: "B" },
      { name: "Contoh 3", value: 60, category: "C" },
    ],
    _fallback: true,
  };
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
    console.log("🎯 Data visualisasi diterima:", visualization);

    if (!visualization || !visualization.data) {
      console.warn("❌ Tidak ada data visualisasi yang tersedia");
      setChartData([]);
      return;
    }

    const processedData = validateAndFixAnalysisData(visualization.data);
    console.log("✅ Data chart yang diproses:", processedData);

    if (processedData.items && Array.isArray(processedData.items)) {
      setChartData(processedData.items);
    } else {
      console.warn(
        "❌ Tidak ada array items ditemukan dalam data yang diproses"
      );
      setChartData([]);
    }
  }, [visualization]);

  return (
    <UniversalD3Visualization
      data={chartData}
      type={visualization.type}
      title={visualization.title}
      description={visualization.description}
      narrative={visualization.narrative}
      insights={visualization.insights}
      recommendations={visualization.recommendations}
      className={className}
    />
  );
};

// ==================== ONTOLOGY OPTIONS MODAL COMPONENT ====================

const OntologyOptionsModal = ({
  isOpen,
  onClose,
  ontologyMode,
  setOntologyMode,
  ontologyOptions,
  setOntologyOptions,
}: {
  isOpen: boolean;
  onClose: () => void;
  ontologyMode: string;
  setOntologyMode: (mode: string) => void;
  ontologyOptions: any;
  setOntologyOptions: (options: any) => void;
}) => {
  const getOntologyModeIcon = (mode: string) => {
    const Icon =
      ONTOLOGY_MODES[mode as keyof typeof ONTOLOGY_MODES]?.icon || Zap;
    return <Icon className="w-4 h-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <GitGraph className="w-5 h-5" />
              Opsi Analisis Hubungan
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mode Analisis</label>
            <Select value={ontologyMode} onValueChange={setOntologyMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ONTOLOGY_MODES).map(([key, mode]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {getOntologyModeIcon(key)}
                      <span>{mode.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {
                ONTOLOGY_MODES[ontologyMode as keyof typeof ONTOLOGY_MODES]
                  ?.description
              }
            </p>
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Format Output</label>
            <Select
              value={ontologyOptions.output_format}
              onValueChange={(
                value: "complete" | "minimal" | "graph_only" | "analysis_only"
              ) =>
                setOntologyOptions((prev: any) => ({
                  ...prev,
                  output_format: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="complete">Analisis Lengkap</SelectItem>
                <SelectItem value="minimal">Output Minimal</SelectItem>
                <SelectItem value="graph_only">Hanya Graf</SelectItem>
                <SelectItem value="analysis_only">Hanya Analisis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Analysis Depth */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Kedalaman Analisis</label>
            <Select
              value={ontologyOptions.analysis_depth}
              onValueChange={(value: "quick" | "standard" | "comprehensive") =>
                setOntologyOptions((prev: any) => ({
                  ...prev,
                  analysis_depth: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quick">Analisis Cepat</SelectItem>
                <SelectItem value="standard">Analisis Standar</SelectItem>
                <SelectItem value="comprehensive">Analisis Mendalam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options Checkboxes */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Opsi</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enable-visualization"
                  checked={ontologyOptions.enable_visualization}
                  onChange={(e) =>
                    setOntologyOptions((prev: any) => ({
                      ...prev,
                      enable_visualization: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <label htmlFor="enable-visualization" className="text-sm">
                  Aktifkan Visualisasi
                </label>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preset Cepat</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOntologyMode("auto");
                  setOntologyOptions({
                    enable_visualization: true,
                    output_format: "complete",
                    analysis_depth: "standard",
                  });
                }}
                className="text-xs h-8"
              >
                Otomatis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOntologyMode("comprehensive");
                  setOntologyOptions({
                    enable_visualization: true,
                    output_format: "complete",
                    analysis_depth: "comprehensive",
                  });
                }}
                className="text-xs h-8"
              >
                Analisis Mendalam
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOntologyMode("quick");
                  setOntologyOptions({
                    enable_visualization: true,
                    output_format: "minimal",
                    analysis_depth: "quick",
                  });
                }}
                className="text-xs h-8"
              >
                Cepat
              </Button>
            </div>
          </div>

          {/* Current Settings Summary */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Pengaturan Saat Ini
            </h4>
            <div className="space-y-1 text-xs text-blue-700">
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className="font-medium">
                  {
                    ONTOLOGY_MODES[ontologyMode as keyof typeof ONTOLOGY_MODES]
                      ?.name
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>Output:</span>
                <span className="font-medium">
                  {ontologyOptions.output_format}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kedalaman:</span>
                <span className="font-medium">
                  {ontologyOptions.analysis_depth}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Visualisasi:</span>
                <span className="font-medium">
                  {ontologyOptions.enable_visualization ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Terapkan Pengaturan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
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

const AIQueryInput = forwardRef<AIQueryInputRef, AIQueryInputProps>(
  (props, ref) => {
    const [query, setQuery] = useState("");
    const [selectedMode, setSelectedMode] = useState<string>(
      props.initialMode || "qa"
    );
    const [isProcessing, setIsProcessing] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [selectedPersona, setSelectedPersona] = useState<string>(
      props.initialPersona || "analyst"
    );
    const [showChat, setShowChat] = useState(true);
    const [error, setError] = useState("");
    const [apiStatus, setApiStatus] = useState<
      "disconnected" | "connected" | "error"
    >("disconnected");
    const [selectedModel] = useState<string>("llama-3.3-70b-versatile");

    // Ontology specific state
    const [ontologyMode, setOntologyMode] = useState<string>("auto");
    const [ontologyOptions, setOntologyOptions] = useState({
      enable_visualization: true,
      output_format: "complete" as
        | "complete"
        | "minimal"
        | "graph_only"
        | "analysis_only",
      analysis_depth: "standard" as "quick" | "standard" | "comprehensive",
    });
    const [showOntologyModal, setShowOntologyModal] = useState(false);

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
    const [showUploadSuccess, setShowUploadSuccess] = useState(false);

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

    // Fungsi untuk mengekstrak keyword dari query
    const extractKeywords = (query: string): string[] => {
      const words = query.toLowerCase().split(/\s+/);
      const stopWords = new Set([
        "apa",
        "bagaimana",
        "mengapa",
        "kapan",
        "dimana",
        "siapa",
        "yang",
        "dengan",
        "untuk",
        "dari",
        "pada",
        "ke",
        "di",
        "dan",
        "atau",
        "tetapi",
        "jika",
        "maka",
        "karena",
        "sehingga",
        "adalah",
        "ialah",
        "itu",
        "ini",
        "saya",
        "kamu",
        "kami",
        "mereka",
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        "if",
        "then",
        "because",
        "so",
      ]);

      return words
        .filter((word) => word.length > 2 && !stopWords.has(word))
        .slice(0, 5); // Ambil maksimal 5 keyword
    };

    // Fungsi untuk membuat sumber referensi berdasarkan keyword
    const createKeywordSources = (query: string): Source[] => {
      const keywords = extractKeywords(query);

      if (keywords.length === 0) {
        return [
          {
            id: "general",
            content:
              "Analisis berdasarkan pengetahuan umum dan data training model",
            metadata: {
              source: "Knowledge Base",
              category: "General",
              classification: "Internal",
            },
            score: 0.8,
            type: "knowledge_base",
          },
        ];
      }

      return keywords.map((keyword, index) => ({
        id: `keyword-${index}`,
        content: `Informasi terkait "${keyword}" dari knowledge base sistem`,
        metadata: {
          source: `Keyword: ${
            keyword.charAt(0).toUpperCase() + keyword.slice(1)
          }`,
          category: "Keyword Analysis",
          classification: "Internal",
        },
        score: 0.7 + index * 0.05, // Score menurun untuk keyword berikutnya
        type: "keyword_based",
      }));
    };

    const transformSources = (sources: any): Source[] => {
      if (!sources || sources.length === 0) {
        return [];
      }

      try {
        const sourcesArray = safeArray<any>(sources);

        // Jika ada sumber dari API, gunakan itu
        if (sourcesArray.length > 0) {
          return sourcesArray.map((source, index) => ({
            id: source.id || `source-${index}`,
            content: removeMarkdownBold(
              source.content ||
                source.data ||
                source.text ||
                "Tidak ada konten yang tersedia"
            ),
            metadata: {
              source:
                source.metadata?.source ||
                source.source ||
                source.type ||
                "Sumber Tidak Dikenal",
              category: source.metadata?.category || source.category || "Umum",
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
        }

        return [];
      } catch (error) {
        console.error("Error mengubah sumber:", error);
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
          content:
            "Halo! Saya siap membantu Anda. Sistem Groq Llama 3.3 70B sudah aktif. Gunakan mode Analisis Visual untuk melihat data dalam bentuk grafik atau Analisis Hubungan untuk memahami koneksi antar informasi.",
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

    // Effect untuk menghilangkan notifikasi upload success setelah 3 detik
    useEffect(() => {
      if (showUploadSuccess) {
        const timer = setTimeout(() => {
          setShowUploadSuccess(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [showUploadSuccess]);

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
              content: "Halo! Ada yang bisa saya bantu hari ini?",
              role: "assistant",
              timestamp: new Date(),
            },
          ]);
          setError("");
        } else {
          setApiStatus("error");
          setError(
            `Maaf, tidak dapat terhubung ke server backend di ${BASE_URL}. Pastikan server backend sedang berjalan.`
          );
        }
      } catch (error) {
        setApiStatus("error");
        setError(
          `Koneksi gagal: ${
            error instanceof Error ? error.message : "Error tidak diketahui"
          }`
        );
      } finally {
        setIsProcessing(false);
      }
    };

    const testConnection = async (): Promise<boolean> => {
      try {
        console.log(`Mengecek koneksi ke: ${BASE_URL}`);
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
        console.log("Respons health check:", data);
        return data.status === "healthy";
      } catch (error) {
        console.error("Health check gagal:", error);
        return false;
      }
    };

    const processQuery = async (userQuery: string): Promise<ChatMessage> => {
      const startTime = Date.now();

      try {
        let result: SmartQueryResponse;

        // Pilih API berdasarkan mode
        if (selectedMode === "enhanced_visual") {
          result = await enhancedVisualRequest(userQuery);
        } else if (selectedMode === "ontology") {
          const ontologyResult = await ontologyRequest(userQuery, {
            mode: ontologyMode,
            ...ontologyOptions,
          });

          result = {
            type: "ontology_analysis",
            ontology_data: ontologyResult,
            narrative:
              ontologyResult.analysis?.narrative || ontologyResult.narrative,
            answer:
              ontologyResult.analysis?.narrative ||
              "Analisis hubungan berhasil diselesaikan",
            model: "llama-3.3-70b-versatile",
          };
        } else {
          const qaResult = await advancedQuery(
            userQuery,
            getAdvancedQueryOptions()
          );
          result = {
            type: "text_response",
            answer: qaResult.answer,
            sources: qaResult.sources,
            model: qaResult.model,
          } as SmartQueryResponse;
        }

        const processingTime = Date.now() - startTime;
        console.log("📊 Respons API Mentah:", result);

        // Gunakan sumber dari API jika ada, jika tidak buat berdasarkan keyword
        let transformedSources = transformSources(result.sources);
        if (transformedSources.length === 0) {
          transformedSources = createKeywordSources(userQuery);
        }

        let analysisResults: AnalysisResult[] = [];
        let transformedVisualization: EnhancedVisualizationData | undefined;

        if (result.type === "visual_analysis" && result.visualization) {
          const fixedData = validateAndFixAnalysisData(
            result.visualization.data || result.visualization
          );

          transformedVisualization = {
            ...result.visualization,
            data: fixedData,
            intent_analysis: result.intent_analysis,
            data_summary: result.data_summary,
            metadata: {
              data_source: result.data_source || "generated_data",
              is_real_data: result.is_real_data || false,
              generated_at:
                result.metadata?.generated_at || new Date().toISOString(),
              real_data_sources: result.metadata?.real_data_sources || [],
            },
            suggestions: result.suggestions || [],
          };

          analysisResults = [
            {
              type: result.visualization.type || "chart",
              title: result.visualization.title || "Analisis Visual",
              data: fixedData,
              narrative: removeMarkdownBold(
                result.narrative || result.visualization.narrative || ""
              ),
              insights: result.visualization.insights || [],
              recommendations: result.visualization.recommendations || [],
            },
          ];
        } else if (
          result.analysis_results &&
          result.analysis_results.length > 0
        ) {
          analysisResults = result.analysis_results.map((analysis: any) => ({
            type: analysis.type || "analysis",
            title: analysis.title || `Analisis ${analysis.type}`,
            data: validateAndFixAnalysisData(
              analysis.data || analysis.structure || analysis
            ),
            description: analysis.description || analysis.narrative,
            narrative: analysis.narrative || result.narrative,
            insights: analysis.insights || [],
            recommendations: analysis.recommendations || [],
            structure: analysis.structure,
            analysis: analysis.analysis,
            metadata: analysis.metadata,
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
              generated_at:
                result.metadata?.generated_at || new Date().toISOString(),
              real_data_sources: result.metadata?.real_data_sources || [],
            },
          };
        } else if (result.type === "text_response" && result.answer) {
          analysisResults = [
            {
              type: "text",
              title: "Respons AI",
              data: { items: [] },
              narrative: removeMarkdownBold(result.answer),
              insights: ["Respons berhasil di-generate"],
              recommendations: [
                "Gunakan pertanyaan yang lebih spesifik untuk visualisasi",
              ],
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
          confidence:
            result.intent_analysis?.confidence ||
            result.enhanced_metadata?.confidence_score ||
            75,
          processingTime,
          analysis_results: analysisResults,
          enhanced_metadata: {
            query_type: result.type,
            data_source: result.data_source || "generated_data",
            is_real_data: result.is_real_data || false,
            data_points:
              result.data_summary?.data_points ||
              result.enhanced_metadata?.data_points ||
              0,
            visualization_type: result.visualization?.type,
            data_generated: result.data_summary?.generated_data || false,
            real_data_confidence: result.data_summary?.confidence,
            suggestions: result.suggestions,
            analysis_type: result.enhanced_metadata?.analysis_type,
            processing_steps: result.enhanced_metadata?.processing_steps,
            total_processing_time:
              result.enhanced_metadata?.total_processing_time,
            confidence_score: result.enhanced_metadata?.confidence_score,
            visual_quality: result.enhanced_metadata?.visual_quality,
          },
          ontology_data: result.ontology_data,
        };

        console.log("✅ Data respons final:", responseData);

        if (props.onProcessComplete) {
          props.onProcessComplete(responseData);
        }

        return responseData;
      } catch (error) {
        console.error("❌ Error memproses pertanyaan:", error);
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
          const successMessage = `${result.data.successful} file berhasil diupload!`;
          setUploadSuccess(successMessage);
          setShowUploadSuccess(true);

          // Reset form setelah berhasil upload
          setTimeout(() => {
            setShowUploadModal(false);
            setUploadedFiles([]);
            setUploadMetadata({
              category: "cybersecurity",
              classification: "Internal",
              tags: [],
            });
            setUploadSuccess("");
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
          console.log("🔐 Token berhasil divalidasi");
        } catch (tokenError) {
          console.error("❌ Validasi token gagal:", tokenError);
          throw new Error(
            "Session tidak valid. Silakan refresh halaman untuk melanjutkan."
          );
        }

        const aiResponse = await processQuery(query);
        setChatHistory((prev) => [...prev, aiResponse]);
      } catch (error) {
        console.error("❌ Error dalam handleProcess:", error);

        let errorMessage = "Terjadi error yang tidak diketahui";

        if (error instanceof Error) {
          if (
            error.message.includes("Token tidak ditemukan") ||
            error.message.includes("Session tidak valid") ||
            error.message.includes("Token tidak valid") ||
            error.message.includes("Authorization header is required") ||
            error.message.includes("401") ||
            error.message.includes("Unauthorized")
          ) {
            errorMessage = "❌ Session tidak valid. Silakan refresh halaman.";

            // Hapus token yang tidak valid dari localStorage
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
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
          content: "Percakapan telah dibersihkan. Ada yang bisa saya bantu?",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    };

    const copyConversation = () => {
      const conversationText = chatHistory
        .map(
          (msg) => `${msg.role === "user" ? "ANDA" : "ASISTEN"}: ${msg.content}`
        )
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
          return "Conneting to Orchestrator";
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

    const getOntologyModeIcon = (mode: string) => {
      const Icon =
        ONTOLOGY_MODES[mode as keyof typeof ONTOLOGY_MODES]?.icon || Zap;
      return <Icon className="w-3 h-3" />;
    };

    const getOntologyModeColor = (mode: string) => {
      return (
        ONTOLOGY_MODES[mode as keyof typeof ONTOLOGY_MODES]?.color ||
        "bg-blue-100 text-blue-700 border-blue-200"
      );
    };

    // Komponen untuk menampilkan visual analysis dengan UniversalD3Visualization
    const VisualAnalysisContent = ({ message }: { message: ChatMessage }) => {
      const analyses =
        message.analysis_results ||
        (message.visualization ? [message.visualization] : []);
      const [selectedVizIndex, setSelectedVizIndex] = useState(0);

      if (!analyses || analyses.length === 0) {
        return (
          <div className="text-center py-8 text-muted-foreground">
            <FileBarChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Belum ada data analisis visual untuk ditampilkan</p>
          </div>
        );
      }

      const currentAnalysis = analyses[selectedVizIndex];
      const processedData = validateAndFixAnalysisData(currentAnalysis.data);
      const narrative = currentAnalysis.narrative;
      const description = currentAnalysis.description || narrative;
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
                  {analysis.title || `Visualisasi ${index + 1}`}
                </Button>
              ))}
            </div>
          )}

          {/* Gunakan UniversalD3Visualization langsung */}
          <UniversalD3Visualization
            data={processedData.items || []}
            type={currentAnalysis.type || "chart"}
            title={currentAnalysis.title || "Analisis Visual"}
            description={description}
            narrative={narrative}
            insights={insights}
            recommendations={recommendations}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {insights.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    Insight Utama
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {safeArray<string>(insights).map(
                      (insight: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Sparkles className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <MarkdownText text={insight} />
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {recommendations.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    Rekomendasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {safeArray<string>(recommendations).map(
                      (rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <MarkdownText text={rec} />
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      );
    };

    // Komponen untuk menampilkan ontology analysis - MENGGUNAKAN EnhancedOntologyContent
    const OntologyAnalysisContent = ({ message }: { message: ChatMessage }) => {
      if (!message.ontology_data) {
        return (
          <div className="text-center py-8 text-muted-foreground">
            <GitGraph className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Data analisis hubungan belum tersedia</p>
          </div>
        );
      }

      return <EnhancedOntologyContent data={message.ontology_data} />;
    };

    // Komponen untuk menampilkan konten berdasarkan mode
    const MessageContent = ({ message }: { message: ChatMessage }) => {
      const hasSources = message.sources && message.sources.length > 0;
      const hasVisualization =
        message.analysis_results || message.visualization;
      const hasOntology = message.ontology_data;
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
                title={`${source.metadata.source} - ${source.content.substring(
                  0,
                  100
                )}...`}
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
          <div>
            {/* Advanced Visual Metadata */}
            {message.enhanced_metadata.analysis_type ===
              "social_network_analysis" && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-800">
                    Analisis Jaringan Sosial
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Langkah Pemrosesan:</strong>
                    <ul className="text-xs mt-1 space-y-1">
                      {message.enhanced_metadata.processing_steps?.map(
                        (step: string, index: number) => (
                          <li key={index}>• {step}</li>
                        )
                      )}
                    </ul>
                  </div>
                  <div>
                    <strong>Metrik Analisis:</strong>
                    <div className="text-xs mt-1 space-y-1">
                      <div>
                        • Titik Data: {message.enhanced_metadata.data_points}
                      </div>
                      <div>
                        • Tingkat Keyakinan:{" "}
                        {message.enhanced_metadata.confidence_score}%
                      </div>
                      <div>
                        • Kualitas: {message.enhanced_metadata.visual_quality}
                      </div>
                      <div>
                        • Waktu Pemrosesan:{" "}
                        {message.enhanced_metadata.total_processing_time}ms
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {message.visualization?.intent_analysis && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <div className="font-medium text-yellow-800 mb-1">
                  Analisis AI:
                </div>
                <div className="text-yellow-700">
                  {message.visualization.intent_analysis.reasoning}
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Keyakinan:{" "}
                    {Math.round(
                      message.visualization.intent_analysis.confidence * 100
                    )}
                    %
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Tipe:{" "}
                    {message.visualization.intent_analysis.recommendedType}
                  </Badge>
                </div>
              </div>
            )}

            {message.enhanced_metadata.suggestions &&
              message.enhanced_metadata.suggestions.length > 0 && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <div className="font-medium text-blue-800 mb-1">Saran:</div>
                  <ul className="text-blue-700 space-y-1">
                    {message.enhanced_metadata.suggestions.map(
                      (suggestion: string, index: number) => (
                        <li key={index}>• {suggestion}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
          </div>
        );
      };

      // Prioritize ontology content
      if (hasOntology) {
        return (
          <div className="space-y-6">
            <OntologyAnalysisContent message={message} />
            <MetadataContent message={message} />
            {hasSources && (
              <div className="pt-4 border-t border-border/50">
                <SourcesContent sources={message.sources!} />
              </div>
            )}
          </div>
        );
      }

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
              <MarkdownText text={message.content} />
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
              <MarkdownText text={message.content} />
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
              Query Input - Mode {getModeConfig(selectedMode).name}
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full border border-purple-200">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Mode {getModeConfig(selectedMode).name}
                </span>
              </div>

              {/* Toggle Ontology Options Button - hanya tampil di mode ontology */}
              {selectedMode === "ontology" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOntologyModal(true)}
                  className="flex items-center gap-1"
                >
                  <GitGraph className="w-4 h-4" />
                  Opsi
                </Button>
              )}

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
                Test Koneksi
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
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {getModeConfig(selectedMode).description}
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
                                      {message.confidence}% keyakinan
                                    </span>
                                  )}
                              </div>
                            </div>

                            {message.role === "assistant" ? (
                              <MessageContent message={message} />
                            ) : (
                              <MarkdownText text={message.content} />
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
                                {selectedMode === "enhanced_visual"
                                  ? "Memproses Analisis Visual..."
                                  : selectedMode === "ontology"
                                  ? "Memproses Analisis Hubungan..."
                                  : "Memproses Jawaban..."}
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
                                  Klasifikasi
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
                                  Keamanan
                                </Badge>
                                {selectedMode === "enhanced_visual" && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-purple-50 text-purple-700"
                                  >
                                    Analisis Visual
                                  </Badge>
                                )}
                                {selectedMode === "ontology" && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-indigo-50 text-indigo-700"
                                  >
                                    Analisis Hubungan
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
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder={getModeConfig(selectedMode).description}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[60px] resize-none text-sm pr-10"
                  disabled={isProcessing}
                />
                {/* Upload Icon di pojok kanan textarea */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadModal(true)}
                  disabled={isProcessing}
                  className="absolute right-2 top-2 h-7 w-7 p-0"
                  title="Upload Dokumen"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedMode}
                  onValueChange={handleModeChange}
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
                  onValueChange={handlePersonaChange}
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
                      <span className="text-xs">Memproses</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span className="text-xs">send</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Ontology Options Modal */}
        <OntologyOptionsModal
          isOpen={showOntologyModal}
          onClose={() => setShowOntologyModal(false)}
          ontologyMode={ontologyMode}
          setOntologyMode={setOntologyMode}
          ontologyOptions={ontologyOptions}
          setOntologyOptions={setOntologyOptions}
        />

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

        {/* Upload Success Notification */}
        {showUploadSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Upload Berhasil!
                  </p>
                  <p className="text-xs text-green-700">{uploadSuccess}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  }
);

AIQueryInput.displayName = "AIQueryInput";

export { AIQueryInput };
