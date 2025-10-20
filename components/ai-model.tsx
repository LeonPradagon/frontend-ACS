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
}

interface AnalysisResult {
  type: string;
  title: string;
  data: any;
  narrative?: string;
  insights?: string[];
  recommendations?: string[];
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

// ==================== MODEL CONFIGURATIONS ====================
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
    "Tampilkan perbandingan frekuensi serangan per region dengan bar chart",
    "Buat radar chart kemampuan security maturity",
    "Analisis scatter plot korelasi antara kerentanan dan serangan",
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
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

// ==================== MODE CONFIGURATIONS ====================
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

// ==================== CHART COLORS ====================
const CHART_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#8DD1E1",
  "#D084D0",
  "#FF7C7C",
  "#A4DE6C",
  "#D0ED57",
  "#FFC0CB",
  "#BA55D3",
  "#20B2AA",
];

// ==================== DATA VALIDATION AND PROCESSING ====================
const validateAndFixAnalysisData = (data: any): any => {
  console.log("🔧 Original data for visualization:", data);

  if (!data) {
    console.warn("❌ Data is null or undefined");
    return { items: [] };
  }

  // Case 1: Data sudah dalam format yang benar { items: [...] }
  if (data.items && Array.isArray(data.items)) {
    console.log("✅ Data already has items array");
    return data;
  }

  // Case 2: Data adalah array langsung
  if (Array.isArray(data)) {
    console.log("✅ Data is direct array, wrapping in items");
    return { items: data };
  }

  // Case 3: Data adalah object dengan datasets (Chart.js format)
  if (data.datasets && Array.isArray(data.datasets)) {
    console.log("✅ Data has Chart.js datasets structure");
    const items =
      data.labels?.map((label: string, index: number) => {
        const item: any = { name: label };
        data.datasets.forEach((dataset: any) => {
          if (dataset.data && Array.isArray(dataset.data)) {
            item[dataset.label || `dataset_${index}`] = dataset.data[index];
          }
        });
        return item;
      }) || [];
    return { items: items.filter(Boolean) };
  }

  // Case 4: Data adalah object dengan properti array
  const arrayKeys = Object.keys(data).filter(
    (key) => Array.isArray(data[key]) && data[key].length > 0
  );

  if (arrayKeys.length > 0) {
    console.log(`✅ Found array keys:`, arrayKeys);

    // Jika ada key 'data', gunakan itu
    if (arrayKeys.includes("data")) {
      return { items: data.data };
    }

    // Gunakan array terpanjang
    const longestArrayKey = arrayKeys.reduce((longest, key) =>
      data[key].length > data[longest].length ? key : longest
    );
    return { items: data[longestArrayKey] };
  }

  // Case 5: Data adalah object biasa - convert ke array
  if (typeof data === "object") {
    console.log("✅ Converting object to array");
    try {
      // Coba extract values
      const values = Object.values(data);
      if (values.length > 0) {
        // Jika values adalah array of objects, return langsung
        if (values.every((item) => typeof item === "object" && item !== null)) {
          return { items: values };
        }

        // Jika values adalah primitive, convert ke array of objects
        const items = Object.entries(data).map(([key, value]) => ({
          name: key,
          value: typeof value === "number" ? value : 1,
          label: key,
          ...(typeof value === "object" ? value : {}),
        }));
        return { items };
      }
    } catch (error) {
      console.error("Error converting object:", error);
    }
  }

  // Case 6: Fallback - return empty array dengan sample data
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
        key !== "description"
    );

    console.log("📊 Chart data:", chartData);
    console.log("🔑 Value keys:", valueKeys);

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
              {valueKeys.map((key, index) => (
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
              {valueKeys.map((key, index) => (
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
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
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
                {chartData.map((entry, index) => (
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
              {valueKeys.map((key, index) => (
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
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" name="X Axis" />
              <YAxis dataKey="y" type="number" name="Y Axis" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={chartData} fill={CHART_COLORS[0]} />
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
              {valueKeys.map((key, index) => (
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

      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={CHART_COLORS[0]} />
              <Line type="monotone" dataKey="value" stroke={CHART_COLORS[1]} />
            </ComposedChart>
          </ResponsiveContainer>
        );
    }
  };

  const renderNetworkGraph = () => (
    <div className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-200">
      <div className="text-center">
        <Network className="w-12 h-12 mx-auto mb-2 text-blue-500" />
        <p className="font-medium text-blue-800">Network Graph Visualization</p>
        <p className="text-sm text-blue-600 mt-1">
          {chartData.length} nodes akan ditampilkan di sini
        </p>
        <div className="mt-4 text-xs text-blue-500">
          <p>Nodes: {chartData.length}</p>
          <p>Connections: {Math.floor(chartData.length * 1.5)}</p>
        </div>
      </div>
    </div>
  );

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
            {visualization.type === "network" && renderNetworkGraph()}
            {visualization.type === "swot" && renderSWOTAnalysis()}
            {visualization.type === "quadrant" && renderQuadrantAnalysis()}
            {!["network", "swot", "quadrant"].includes(
              visualization.type as string
            ) && renderChart()}
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
        content:
          removeMarkdownBold(
            source.content ||
            source.data ||
            source.text ||
            "No content available"
          ),
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
      console.log(`🎨 Sending visual analysis query: "${question}"`);

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
          debug: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `❌ Visual analysis failed: ${response.status}`,
          errorText
        );
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ Visual analysis response:`, data);

      // Enhanced data validation and transformation
      if (data.analysis_results && Array.isArray(data.analysis_results)) {
        data.analysis_results = data.analysis_results.map((analysis: any) => ({
          ...analysis,
          data: validateAndFixAnalysisData(analysis.data),
        }));
      }

      if (data.visualization) {
        data.visualization.data = validateAndFixAnalysisData(
          data.visualization.data
        );
      }

      return data;
    } catch (error) {
      console.error("❌ Visual analysis error:", error);
      throw error;
    }
  };

  // Initialize dengan welcome message
  useEffect(() => {
    setChatHistory([
      {
        id: "1",
        content: "Enhanced RAG System dengan Visual Analysis Ready! Semua fitur analisis visual dan naratif telah diaktifkan. Pilih mode Visual Analysis untuk memulai!",
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
            content: "Semua Sistem Berjalan Optimal! Halo ada yang bisa saya bantu hari ini?",
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
      console.log("📊 Raw API Response:", result);

      const transformedSources = transformSources(result.sources);

      let transformedVisualization: VisualizationData | undefined;
      let analysisResults: AnalysisResult[] = [];

      try {
        // Enhanced analysis results processing
        if (result.analysis_results && Array.isArray(result.analysis_results)) {
          analysisResults = result.analysis_results.map(
            (analysis: any, index: number) => {
              console.log(`📈 Processing analysis ${index}:`, analysis);

              const fixedData = validateAndFixAnalysisData(analysis.data);
              console.log(`✅ Fixed data for analysis ${index}:`, fixedData);

              return {
                type: analysis.type || "chart",
                title: analysis.title || `Analysis ${index + 1}`,
                data: fixedData,
                narrative: removeMarkdownBold(analysis.narrative || ''),
                insights: safeArray<string>(analysis.insights).map(insight => removeMarkdownBold(insight)),
                recommendations: safeArray<string>(analysis.recommendations).map(rec => removeMarkdownBold(rec)),
              };
            }
          );
        }
        // Enhanced visualization processing
        else if (
          result.visualization &&
          typeof result.visualization === "object"
        ) {
          console.log(
            "🎨 Processing direct visualization:",
            result.visualization
          );

          const fixedData = validateAndFixAnalysisData(
            result.visualization.data
          );
          console.log("✅ Fixed visualization data:", fixedData);

          transformedVisualization = {
            type: result.visualization.type || "bar_chart",
            data: fixedData,
            title: result.visualization.title || "Visual Analysis",
            description: removeMarkdownBold(result.visualization.description || ''),
            narrative: removeMarkdownBold(result.visualization.narrative || ''),
            insights: safeArray<string>(result.visualization.insights).map(insight => removeMarkdownBold(insight)),
            recommendations: safeArray<string>(
              result.visualization.recommendations
            ).map(rec => removeMarkdownBold(rec)),
          };

          analysisResults = [
            {
              type: result.visualization.type || "chart",
              title: result.visualization.title || "Visual Analysis",
              data: fixedData,
              narrative: removeMarkdownBold(result.visualization.narrative || ''),
              insights: safeArray<string>(result.visualization.insights).map(insight => removeMarkdownBold(insight)),
              recommendations: safeArray<string>(
                result.visualization.recommendations
              ).map(rec => removeMarkdownBold(rec)),
            },
          ];
        }
        // Enhanced root level data processing
        else if (result.data || result.items) {
          console.log("🔍 Found data at root level:", {
            data: result.data,
            items: result.items,
          });

          const fixedData = validateAndFixAnalysisData(result.data || result);
          analysisResults = [
            {
              type: "chart",
              title: "Data Analysis",
              data: fixedData,
              narrative: removeMarkdownBold(result.answer || "Analisis data"),
              insights: [],
              recommendations: [],
            },
          ];
        }
      } catch (vizError) {
        console.error("❌ Error transforming visualization:", vizError);

        // Enhanced fallback analysis
        analysisResults = [
          {
            type: "bar_chart",
            title: "Sample Analysis",
            data: {
              items: [
                { name: "Data 1", value: 30, category: "A" },
                { name: "Data 2", value: 45, category: "B" },
                { name: "Data 3", value: 60, category: "C" },
                { name: "Data 4", value: 25, category: "A" },
                { name: "Data 5", value: 80, category: "B" },
              ],
            },
            narrative:
              "Menampilkan data sample karena terjadi error dalam pemrosesan data asli.",
            insights: ["Data sample digunakan untuk demonstrasi"],
            recommendations: ["Periksa koneksi API", "Validasi format data"],
          },
        ];
      }

      // Enhanced analysis results validation
      if (analysisResults.length === 0 && result.answer) {
        console.log("⚠️ No analysis results, creating from answer");
        analysisResults = [
          {
            type: "bar_chart",
            title: "Text Analysis",
            data: {
              items: [
                { name: "Response", value: 100, category: "AI" },
                { name: "Query", value: 80, category: "User" },
              ],
            },
            narrative: removeMarkdownBold(result.answer),
            insights: ["Response AI berhasil di-generate"],
            recommendations: [
              "Gunakan query yang lebih spesifik untuk visualisasi",
            ],
          },
        ];
      }

      const responseData: ChatMessage = {
        id: Date.now().toString(),
        content: removeMarkdownBold(
          result.answer ||
          result.response ||
          "Tidak ada respons yang dihasilkan."
        ),
        role: "assistant" as const,
        timestamp: new Date(),
        sources: transformedSources,
        visualization: transformedVisualization,
        modelUsed: result.model || selectedModel,
        confidence:
          typeof result.confidence === "number"
            ? result.confidence
            : result.enhanced_metadata?.confidence_score || 75,
        processingTime,
        enhanced_metadata: result.enhanced_metadata,
        recommendations: safeArray(result.recommendations),
        advanced_reasoning: result.advanced_reasoning,
        retrieval_metadata: result.retrieval_metadata,
        security_level: result.enhanced_metadata?.security_level,
        analysis_results: analysisResults,
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
          `${result.data.successful} file berhasil diupload!`
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
        content: "Percakapan telah dibersihkan. Enhanced RAG System dengan Visual Analysis siap digunakan!",
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
        return "Connecting to Orchestrator...";
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

  // Komponen untuk menampilkan visual analysis dengan visualisasi otomatis
  const VisualAnalysisContent = ({ message }: { message: ChatMessage }) => {
    const analyses =
      message.analysis_results ||
      (message.visualization ? [message.visualization] : []);
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

    // Safely extract properties from either VisualizationData or AnalysisResult
    const narrative = currentAnalysis.narrative;
    const insights = currentAnalysis.insights || [];
    const recommendations = currentAnalysis.recommendations || [];

    return (
      <div className="space-y-6">
        {/* Analysis Selector untuk multiple visualizations */}
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

        {/* Auto-generated Visualization */}
        <VisualizationRenderer
          visualization={{
            type: currentAnalysis.type || "chart",
            data: validateAndFixAnalysisData(currentAnalysis.data),
            title: currentAnalysis.title || "Visual Analysis",
            description: narrative,
          }}
        />

        {/* Insights and Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Insights */}
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
                  {safeArray<string>(insights).map(
                    (insight: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{removeMarkdownBold(insight)}</span>
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
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
                  {safeArray<string>(recommendations).map(
                    (rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{removeMarkdownBold(rec)}</span>
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

  // Komponen untuk menampilkan konten berdasarkan mode
  const MessageContent = ({ message }: { message: ChatMessage }) => {
    const hasSources = message.sources && message.sources.length > 0;
    const hasVisualization = message.analysis_results || message.visualization;

    // Sources Content yang ringkas
    const SourcesContent = ({ sources }: { sources: Source[] }) => (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Search className="w-3 h-3 text-blue-500" />
          <span className="text-xs font-medium text-blue-700">
            Keyword Sumber ({sources.length})
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

    // Tampilkan konten berdasarkan mode yang dipilih
    switch (selectedMode) {
      case "visual":
        return (
          <div className="space-y-6">
            {/* Visual Analysis */}
            {hasVisualization && <VisualAnalysisContent message={message} />}

            {/* Jawaban utama */}
            <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
              {removeMarkdownBold(message.content)}
            </div>

            {/* Sumber */}
            {hasSources && (
              <div className="pt-4 border-t border-border/50">
                <SourcesContent sources={message.sources!} />
              </div>
            )}

            {/* Enhanced Features */}
            {message.advanced_reasoning?.tools_employed && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    Tools Used:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {safeArray<string>(
                    message.advanced_reasoning.tools_employed
                  ).map((tool: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-green-50 text-green-700"
                    >
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {message.security_level && (
              <div className="pt-4 border-t border-border/50">
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

      case "qa":
      case "summary":
      case "ide":
      case "risk":
      default:
        return (
          <div className="space-y-6">
            {/* Jawaban utama */}
            <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
              {removeMarkdownBold(message.content)}
            </div>

            {/* Sumber */}
            {hasSources && (
              <div className="pt-4 border-t border-border/50">
                <SourcesContent sources={message.sources!} />
              </div>
            )}

            {/* Enhanced Features */}
            {message.advanced_reasoning?.tools_employed && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    Tools Used:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {safeArray<string>(
                    message.advanced_reasoning.tools_employed
                  ).map((tool: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-green-50 text-green-700"
                    >
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {message.security_level && (
              <div className="pt-4 border-t border-border/50">
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
              placeholder={getModeConfig(selectedMode).description}
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