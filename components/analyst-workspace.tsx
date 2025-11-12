"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FileText,
  MessageSquare,
  FileBarChart,
  Lightbulb,
  Filter,
  History,
  ChevronDown,
  ChevronRight,
  Download,
  Copy,
  Save,
  User,
  Calendar,
  Search,
  AlertTriangle,
  Bell,
  Settings,
  LogOut,
  Shield,
  Users,
  TrendingUp,
  Activity,
  Target,
} from "lucide-react";
import { AIQueryInput } from "./ai-model";

// Types untuk data workspace
interface WorkspaceData {
  mainAnalysis: {
    title: string;
    content: string;
    findings: string[];
  };
  autoReport: {
    title: string;
    description: string;
    pages: number;
    classification: string;
    status: string;
  };
  autoSummary: string[];
  repeatedEntities: {
    organizations: Array<{ name: string; count: number }>;
    locations: Array<{ name: string; count: number }>;
    technologies: Array<{ name: string; count: number }>;
  };
  topicHeatmap: Array<{ topic: string; intensity: number; color: string }>;
  riskNotifications: Array<{
    level: string;
    title: string;
    description: string;
    time: string;
    icon: string;
  }>;
  metadata: {
    keywords: string[];
    confidenceScores: Array<{ label: string; score: number }>;
  };
}

interface HistoryItem {
  id: string;
  query: string;
  response: string;
  mode: string;
  persona: string;
  model: string;
  timestamp: Date;
  sources?: any[];
  entities?: any[];
}

// Filter types
interface FilterState {
  classification: string;
  dateRange: string;
  category: string;
  tags: string[];
}

// Constants untuk cooldown
const TOKEN_CHECK_COOLDOWN = 60000; // 60 detik
const MAX_TOKEN_CHECKS_PER_MINUTE = 3;

export function AnalystWorkspace() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedMode, setSelectedMode] =
    useState<keyof typeof MODE_CONFIG>("qa");
  const [selectedPersona, setSelectedPersona] =
    useState<keyof typeof AI_PERSONAS>("analyst");
  const [selectedModel, setSelectedModel] = useState<string>("llama");
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedCards, setExpandedCards] = useState({
    analisis: true,
    laporan: true,
    ringkasan: true,
    entitas: true,
    heatmap: true,
    risiko: true,
  });
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [metadataExpanded, setMetadataExpanded] = useState(true);
  const [notificationCount] = useState(3);

  // State untuk filters
  const [filters, setFilters] = useState<FilterState>({
    classification: "all",
    dateRange: "30days",
    category: "all",
    tags: [],
  });

  // State untuk history
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Ref untuk AIQueryInput
  const aiQueryInputRef = useRef<any>(null);

  // Ref untuk cooldown management
  const lastTokenCheckRef = useRef<number>(0);
  const tokenCheckCountRef = useRef<number>(0);
  const tokenCheckResetTimeoutRef = useRef<NodeJS.Timeout>();

  // State untuk data workspace yang akan di-update berdasarkan AI responses
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>({
    mainAnalysis: {
      title: "Analisis Ancaman Siber Q4 2024",
      content:
        "Berdasarkan data intelijen terkini, terdapat peningkatan signifikan aktivitas siber yang menargetkan infrastruktur kritis nasional. Analisis menunjukkan pola serangan yang terkoordinasi dengan menggunakan teknik advanced persistent threat (APT).",
      findings: [
        "Peningkatan 45% serangan terhadap sektor energi",
        "Identifikasi 12 kelompok APT baru dengan taktik yang berkembang",
        "Korelasi dengan aktivitas geopolitik regional",
      ],
    },
    autoReport: {
      title: "Executive Summary",
      description:
        "Laporan briefing komprehensif mengenai situasi ancaman siber terkini dan rekomendasi tindakan strategis.",
      pages: 12,
      classification: "Terbatas",
      status: "Siap Export",
    },
    autoSummary: [
      "Peningkatan aktivitas APT dengan target infrastruktur energi nasional",
      "Identifikasi 12 kelompok baru menggunakan teknik lateral movement canggih",
      "Korelasi temporal dengan eskalasi ketegangan geopolitik regional",
      "Rekomendasi penguatan monitoring real-time dan koordinasi antar lembaga",
    ],
    repeatedEntities: {
      organizations: [
        { name: "APT29", count: 47 },
        { name: "Lazarus Group", count: 32 },
        { name: "Equation Group", count: 18 },
      ],
      locations: [
        { name: "Jakarta", count: 89 },
        { name: "Surabaya", count: 34 },
        { name: "Medan", count: 21 },
      ],
      technologies: [
        { name: "SCADA", count: 56 },
        { name: "ICS", count: 43 },
        { name: "IoT", count: 29 },
      ],
    },
    topicHeatmap: [
      { topic: "Siber", intensity: 95, color: "bg-destructive" },
      { topic: "APT", intensity: 87, color: "bg-accent" },
      { topic: "Infrastruktur", intensity: 76, color: "bg-primary" },
      { topic: "Energi", intensity: 68, color: "bg-chart-4" },
      { topic: "Malware", intensity: 54, color: "bg-muted" },
      { topic: "Forensik", intensity: 43, color: "bg-muted" },
      { topic: "Monitoring", intensity: 32, color: "bg-muted" },
      { topic: "Koordinasi", intensity: 28, color: "bg-muted" },
    ],
    riskNotifications: [
      {
        level: "kritis",
        title: "Anomali Kritis Terdeteksi",
        description:
          "Pola akses tidak normal pada sistem SCADA sektor energi - memerlukan investigasi segera",
        time: "Real-time",
        icon: "AlertTriangle",
      },
      {
        level: "tinggi",
        title: "Peningkatan Aktivitas Mencurigakan",
        description:
          "Volume traffic anomali pada infrastruktur telekomunikasi - monitoring diperlukan",
        time: "2 jam lalu",
        icon: "Activity",
      },
    ],
    metadata: {
      keywords: [
        "siber",
        "ancaman",
        "infrastruktur",
        "APT",
        "malware",
        "forensik",
      ],
      confidenceScores: [
        { label: "Akurasi Analisis", score: 85 },
        { label: "Relevansi Sumber", score: 92 },
        { label: "Kredibilitas Data", score: 78 },
      ],
    },
  });

  // Fungsi untuk check token dengan cooldown
  const checkTokenWithCooldown = (): boolean => {
    const now = Date.now();
    const timeSinceLastCheck = now - lastTokenCheckRef.current;

    // Reset counter setiap menit
    if (!tokenCheckResetTimeoutRef.current) {
      tokenCheckResetTimeoutRef.current = setTimeout(() => {
        tokenCheckCountRef.current = 0;
        tokenCheckResetTimeoutRef.current = undefined;
      }, 60000);
    }

    // Cek apakah sudah melebihi batas maksimal
    if (tokenCheckCountRef.current >= MAX_TOKEN_CHECKS_PER_MINUTE) {
      console.log(
        "⏳ Batas maksimal pengecekan token tercapai, tunggu 1 menit"
      );
      return true; // Return true untuk mencegah redirect, anggap token valid sementara
    }

    // Cek cooldown
    if (timeSinceLastCheck < TOKEN_CHECK_COOLDOWN) {
      console.log("⏳ Cooldown token check, skip pengecekan");
      return true; // Return true untuk mencegah redirect, anggap token valid sementara
    }

    // Update last check time dan counter
    lastTokenCheckRef.current = now;
    tokenCheckCountRef.current++;

    return performTokenValidation();
  };

  // Fungsi untuk validasi token yang sebenarnya
  const performTokenValidation = (): boolean => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.log("❌ Token tidak ditemukan, redirect ke login");
        redirectToLogin();
        return false;
      }

      // Validasi format token dasar
      if (!token.startsWith("eyJ") || token.length < 50) {
        console.log("❌ Format token tidak valid, redirect ke login");
        clearTokensAndRedirect();
        return false;
      }

      // Optional: Check token expiration (jika ada informasi expiry di token)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiry = payload.exp * 1000; // Convert to milliseconds
        if (Date.now() > expiry) {
          console.log("❌ Token expired, redirect ke login");
          clearTokensAndRedirect();
          return false;
        }
      } catch (e) {
        console.log("⚠️ Tidak bisa memeriksa expiry token, lanjutkan");
      }

      console.log("✅ Token valid, user dapat melanjutkan");
      return true;
    } catch (error) {
      console.error("❌ Error checking token:", error);
      clearTokensAndRedirect();
      return false;
    }
  };

  // Effect untuk check token dan redirect jika tidak valid
  useEffect(() => {
    const checkTokenAndRedirect = () => {
      checkTokenWithCooldown();
    };

    // Check token saat komponen mount
    checkTokenAndRedirect();

    // Juga check token ketika window mendapatkan focus (tab diaktifkan kembali)
    const handleFocus = () => {
      checkTokenAndRedirect();
    };

    window.addEventListener("focus", handleFocus);

    // Cleanup function
    return () => {
      window.removeEventListener("focus", handleFocus);
      if (tokenCheckResetTimeoutRef.current) {
        clearTimeout(tokenCheckResetTimeoutRef.current);
      }
    };
  }, []);

  // Fungsi untuk clear tokens dan redirect ke login
  const clearTokensAndRedirect = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    redirectToLogin();
  };

  // Fungsi untuk redirect ke login
  const redirectToLogin = () => {
    console.log("🔄 Mengarahkan ke halaman login...");
    router.push("/login");
  };

  // Mode configurations - sync dengan AIQueryInput
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
      icon: AlertTriangle,
      color: "bg-red-100 text-red-700 border-red-200",
      persona: "risk" as keyof typeof AI_PERSONAS,
    },
    visual: {
      name: "Visualization",
      description: "Generasi visualisasi data dan chart",
      icon: FileBarChart,
      color: "bg-purple-100 text-purple-700 border-purple-200",
      persona: "technical" as keyof typeof AI_PERSONAS,
    },
  };

  // AI Persona configurations - sync dengan AIQueryInput
  const AI_PERSONAS = {
    analyst: {
      name: "Analis Intelijen",
      description: "Ahli analisis ancaman dan pattern recognition",
      icon: Target,
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    technical: {
      name: "Analis Teknis",
      description: "Spesialis analisis teknis dan forensik",
      icon: Activity,
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
      icon: AlertTriangle,
      color: "bg-red-100 text-red-700 border-red-200",
    },
  };

  // Handle logout function
  const handleLogout = () => {
    // Clear all stored authentication data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Clear cooldown timers
    if (tokenCheckResetTimeoutRef.current) {
      clearTimeout(tokenCheckResetTimeoutRef.current);
    }

    console.log("🚪 User logged out successfully");

    // Redirect to login page
    router.push("/login");
  };

  // Fungsi untuk update AIQueryInput ketika mode/persona berubah di sidebar
  const handleModeChange = (mode: keyof typeof MODE_CONFIG) => {
    setSelectedMode(mode);
    const newPersona = MODE_CONFIG[mode].persona;
    setSelectedPersona(newPersona);

    // Update AIQueryInput jika ref tersedia
    if (aiQueryInputRef.current) {
      aiQueryInputRef.current.setMode(mode);
      aiQueryInputRef.current.setPersona(newPersona);
    }
  };

  // Fungsi untuk handle persona change
  const handlePersonaChange = (persona: keyof typeof AI_PERSONAS) => {
    setSelectedPersona(persona);

    // Update AIQueryInput jika ref tersedia
    if (aiQueryInputRef.current) {
      aiQueryInputRef.current.setPersona(persona);
    }
  };

  // Fungsi untuk handle model change
  const handleModelChange = (model: string) => {
    setSelectedModel(model);

    // Update AIQueryInput jika ref tersedia
    if (aiQueryInputRef.current) {
      aiQueryInputRef.current.setModel(model);
    }
  };

  // Fungsi untuk update workspace data berdasarkan AI response
  const updateWorkspaceData = (aiResponse: any) => {
    if (!aiResponse) return;

    // Tambahkan ke history
    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      query: aiResponse.userQuery || "Unknown query",
      response: aiResponse.content,
      mode: selectedMode,
      persona: selectedPersona,
      model: selectedModel,
      timestamp: new Date(),
      sources: aiResponse.sources,
      entities: aiResponse.entities,
    };

    setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]); // Keep last 10 items

    // Update main analysis berdasarkan content AI
    if (aiResponse.content) {
      setWorkspaceData((prev) => ({
        ...prev,
        mainAnalysis: {
          title: `Analisis ${MODE_CONFIG[selectedMode].name}`,
          content: aiResponse.content,
          findings: [
            "Analisis real-time berdasarkan data terkini",
            "Identifikasi pola dan tren otomatis",
            "Rekomendasi aksi berdasarkan prioritas risiko",
          ],
        },
      }));
    }

    // Update entities jika ada
    if (aiResponse.entities && aiResponse.entities.length > 0) {
      const organizations = aiResponse.entities
        .filter((e: any) => e.type === "organization")
        .slice(0, 3)
        .map((org: any) => ({
          name: org.name,
          count: Math.floor(Math.random() * 50) + 10,
        }));

      const locations = aiResponse.entities
        .filter((e: any) => e.type === "location")
        .slice(0, 3)
        .map((loc: any) => ({
          name: loc.name,
          count: Math.floor(Math.random() * 100) + 20,
        }));

      const technologies = aiResponse.entities
        .filter((e: any) => e.type === "technology")
        .slice(0, 3)
        .map((tech: any) => ({
          name: tech.name,
          count: Math.floor(Math.random() * 60) + 15,
        }));

      setWorkspaceData((prev) => ({
        ...prev,
        repeatedEntities: {
          organizations:
            organizations.length > 0
              ? organizations
              : prev.repeatedEntities.organizations,
          locations:
            locations.length > 0 ? locations : prev.repeatedEntities.locations,
          technologies:
            technologies.length > 0
              ? technologies
              : prev.repeatedEntities.technologies,
        },
      }));
    }

    // Update summary dari AI response
    if (aiResponse.content) {
      const sentences = aiResponse.content
        .split(". ")
        .filter((s: string) => s.length > 10);
      const summary = sentences.slice(0, 4).map((s: string) => s.trim());

      setWorkspaceData((prev) => ({
        ...prev,
        autoSummary: summary.length > 0 ? summary : prev.autoSummary,
      }));
    }

    // Update confidence scores berdasarkan AI confidence
    if (aiResponse.confidence) {
      setWorkspaceData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          confidenceScores: [
            { label: "Akurasi Analisis", score: aiResponse.confidence },
            {
              label: "Relevansi Sumber",
              score: Math.min(95, aiResponse.confidence + 7),
            },
            {
              label: "Kredibilitas Data",
              score: Math.min(85, aiResponse.confidence - 5),
            },
          ],
        },
      }));
    }

    // Update keywords dari entities dan content
    if (aiResponse.entities || aiResponse.content) {
      const newKeywords = Array.from(
        new Set([
          ...(aiResponse.entities?.map((e: any) => e.name.toLowerCase()) || []),
          ...(aiResponse.content?.toLowerCase().match(/\b(\w+)\b/g) || []),
        ])
      ).slice(0, 6) as string[];

      if (newKeywords.length > 0) {
        setWorkspaceData((prev) => ({
          ...prev,
          metadata: {
            ...prev.metadata,
            keywords: newKeywords,
          },
        }));
      }
    }
  };

  // Fungsi untuk handle history item click
  const handleHistoryItemClick = (item: HistoryItem) => {
    // Set mode, persona, dan model sesuai history
    setSelectedMode(item.mode as keyof typeof MODE_CONFIG);
    setSelectedPersona(item.persona as keyof typeof AI_PERSONAS);
    setSelectedModel(item.model);

    // Update AIQueryInput
    if (aiQueryInputRef.current) {
      aiQueryInputRef.current.setMode(item.mode);
      aiQueryInputRef.current.setPersona(item.persona);
      aiQueryInputRef.current.setModel(item.model);
      aiQueryInputRef.current.setQuery(item.query);
    }
  };

  // Fungsi untuk handle filter changes
  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));

    // Apply filters ke AIQueryInput jika tersedia
    if (aiQueryInputRef.current && filterType === "classification") {
      // Bisa ditambahkan logika untuk apply filters ke AI query
      console.log("Applying filter:", filterType, value);
    }
  };

  // Fungsi untuk handle export laporan
  const handleExportReport = () => {
    setIsProcessing(true);
    // Simulate export process
    setTimeout(() => {
      alert("Laporan berhasil diexport sebagai PDF!");
      setIsProcessing(false);
    }, 1500);
  };

  // Fungsi untuk copy content
  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    alert("Content berhasil disalin!");
  };

  // Fungsi untuk save analysis
  const handleSaveAnalysis = () => {
    setIsProcessing(true);
    // Simulate save process
    setTimeout(() => {
      alert("Analisis berhasil disimpan!");
      setIsProcessing(false);
    }, 1000);
  };

  const toggleCard = (cardName: keyof typeof expandedCards) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardName]: !prev[cardName],
    }));
  };

  const currentTime = new Date().toLocaleString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={"/images/Asisgo.png"}
                  className="w-12 h-12 object-contain"
                  alt="ASISGO Logo"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-3xl font-extrabold text-foreground">
                  ACS
                </span>
                <span className="text-sm font-medium text-muted-foreground tracking-wide">
                  ASISGO CORE-SOVEREIGN
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{currentTime}</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* User Profile Dropdown */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content - Full width tanpa sidebar */}
        <main className="flex-1 p-6 space-y-6">
          {/* Query Input Panel dengan integrasi update workspace */}
          <AIQueryInput
            ref={aiQueryInputRef}
            onProcessComplete={updateWorkspaceData}
            initialMode={selectedMode}
            initialPersona={selectedPersona}
            initialModel={selectedModel}
          />

          <div className="grid gap-6">
            {/* Analisis Utama Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Analisis Utama - {MODE_CONFIG[selectedMode].name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyContent(workspaceData.mainAnalysis.content)
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveAnalysis}
                      disabled={isProcessing}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCard("analisis")}
                    >
                      {expandedCards.analisis ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <Collapsible open={expandedCards.analisis}>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="prose prose-sm max-w-none">
                        <h4 className="text-base font-semibold mb-2">
                          {workspaceData.mainAnalysis.title}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {workspaceData.mainAnalysis.content}
                        </p>
                        <h5 className="text-sm font-medium mt-4 mb-2">
                          Temuan Utama:
                        </h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {workspaceData.mainAnalysis.findings.map(
                            (finding, index) => (
                              <li key={index}>• {finding}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Laporan Otomatis Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Laporan Otomatis
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-accent hover:text-accent"
                      onClick={handleExportReport}
                      disabled={isProcessing}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export PDF
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCard("laporan")}
                    >
                      {expandedCards.laporan ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <Collapsible open={expandedCards.laporan}>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h5 className="text-sm font-medium mb-2">
                          {workspaceData.autoReport.title}
                        </h5>
                        <p className="text-xs text-muted-foreground mb-3">
                          {workspaceData.autoReport.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {workspaceData.autoReport.pages} halaman
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {workspaceData.autoReport.classification}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {workspaceData.autoReport.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Ringkasan Otomatis Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileBarChart className="w-5 h-5" />
                    Ringkasan Otomatis
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopyContent(workspaceData.autoSummary.join("\n"))
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCard("ringkasan")}
                    >
                      {expandedCards.ringkasan ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <Collapsible open={expandedCards.ringkasan}>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-3">
                      {workspaceData.autoSummary.map((summary, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              index === 0
                                ? "bg-destructive"
                                : index === 1
                                ? "bg-accent"
                                : index === 2
                                ? "bg-primary"
                                : "bg-accent"
                            }`}
                          ></div>
                          <p className="text-sm">{summary}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
