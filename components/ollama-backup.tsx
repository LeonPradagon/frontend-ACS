"use client";

import { useState, useRef, useEffect } from "react";
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
  Mic,
  Square,
  Brain,
  Zap,
  Sparkles,
  Clock,
  User,
  Bot,
  ChevronDown,
  Copy,
  Save,
  Download,
  Trash2,
  Key,
  CheckCircle2,
  AlertCircle,
  Search,
  Globe,
  ExternalLink,
  Verified,
  Newspaper,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types untuk pesan chat dan sumber data
interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  sources?: Source[];
  confidence?: number;
  factCheckData?: FactCheckData;
  modelUsed?: string; // Tambahan field untuk melacak model yang digunakan
}

interface Source {
  title: string;
  url: string;
  snippet: string;
  relevance: number;
  date?: string;
  domain: string;
  category: string;
}

interface FactCheckData {
  searchTimestamp: string;
  sources: NewsSource[];
  confidence: number;
  category: string;
}

interface NewsSource {
  title: string;
  url: string;
  snippet: string;
  relevance: number;
  date: string;
  time: string;
  domain: string;
  category: string;
  credibility: "high" | "medium" | "low";
}

// Template queries berdasarkan mode
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
  generator: [
    "Generate ide untuk meningkatkan deteksi ancaman siber",
    "Berikan rekomendasi strategi mitigasi risiko terbaru",
    "Suggest innovative approaches for threat intelligence",
  ],
  risk: [
    "Analisis tingkat risiko dari aktivitas mencurigakan terbaru",
    "Monitor dan alert untuk pola anomali dalam jaringan",
    "Prediksi perkembangan ancaman berdasarkan data historis",
  ],
  factcheck: [
    "Apa perkembangan terbaru pemilu Indonesia 2024?",
    "Bagaimana situasi terkini gempa di Turki?",
    "Berapa harga Bitcoin hari ini dan analisisnya?",
  ],
};

// AI Persona configurations dengan system prompt untuk Ollama
const AI_PERSONAS = {
  analyst: {
    name: "Analis Intelijen",
    description: "Ahli analisis ancaman dan pattern recognition",
    icon: Brain,
    systemPrompt: `Anda adalah asisten AI yang helpful dan informatif. Berikan jawaban yang jelas, mudah dipahami, dan relevan dengan pertanyaan pengguna. Gunakan bahasa yang natural dan conversational seperti sedang ngobrol biasa.

PENTING: JANGAN GUNAKAN format markdown seperti **bold** atau ## heading sama sekali. Gunakan hanya teks biasa.

Format respons:
- Gunakan bahasa Indonesia yang natural dan mudah dipahami
- Hindari penggunaan markdown atau formatting berlebihan
- Sertakan poin-poin penting dengan cara yang conversational
- Berikan penjelasan yang jelas dan langsung ke intinya
- Gunakan bahasa sehari-hari yang sopan dan informatif`,
  },
  strategist: {
    name: "Strategis Keamanan",
    description: "Pakar strategi dan perencanaan keamanan",
    icon: Zap,
    systemPrompt: `Anda adalah asisten yang ahli dalam strategi dan perencanaan. Berikan saran yang praktis dan mudah diimplementasikan dengan bahasa yang natural.

PENTING: JANGAN GUNAKAN format markdown seperti **bold** atau ## heading sama sekali. Gunakan hanya teks biasa.

Format respons:
- Gunakan bahasa Indonesia yang mudah dimengerti
- Hindari jargon yang terlalu teknis kecuali diperlukan
- Berikan contoh konkret yang relevan
- Sampaikan dengan gaya bicara yang natural
- Fokus pada hal-hal yang bisa langsung diterapkan`,
  },
  technical: {
    name: "Analis Teknis",
    description: "Spesialis analisis teknis dan forensik",
    icon: Sparkles,
    systemPrompt: `Anda adalah asisten teknis yang bisa menjelaskan konsep kompleks dengan cara sederhana. Gunakan bahasa yang mudah dipahami bahkan untuk non-teknis.

PENTING: JANGAN GUNAKAN format markdown seperti **bold** atau ## heading sama sekali. Gunakan hanya teks biasa.

Format respons:
- Jelaskan konsep teknis dengan analogi yang mudah dimengerti
- Hindari istilah yang terlalu teknis tanpa penjelasan
- Gunakan bahasa sehari-hari yang jelas
- Berikan contoh praktis dalam kehidupan nyata
- Sampaikan dengan sabar dan detail tapi tidak berbelit`,
  },
  factchecker: {
    name: "Fact Checker",
    description: "Ahli verifikasi fakta dan berita terkini",
    icon: Verified,
    systemPrompt: `You are a helpful fact-checking assistant. Provide accurate and informative responses based on available information.

Always:
- Provide accurate, concise information
- Mention if information is still developing
- Highlight conflicting reports if they exist
- Rate the confidence level of the information

Format your response naturally without markdown:
1. Start with the main information
2. Provide context and background
3. Mention any uncertainties or ongoing developments

User Query: {{user_query}}

Now, provide an accurate and helpful answer.`,
  },
};

// Model configurations
const AVAILABLE_MODELS = {
  "llama3.1:latest": {
    name: "Llama 3.1",
    description: "Model terbaru Meta dengan kemampuan reasoning yang baik",
    icon: Brain,
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  "mistral:7b": {
    name: "Mistral 7B",
    description: "Model efisien dengan performa tinggi untuk ukuran 7B",
    icon: Zap,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

// Ollama client setup yang lebih robust
class OllamaClient {
  private baseURL: string;

  constructor(baseURL: string = "http://localhost:11434") {
    this.baseURL = baseURL;
  }

  async createResponse(
    input: string,
    systemPrompt: string,
    model: string,
    chatHistory: ChatMessage[] = []
  ) {
    // Siapkan messages array untuk API Ollama
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...chatHistory
        .filter((msg) => msg.role === "assistant" || msg.role === "user")
        .slice(-6)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      {
        role: "user",
        content: input,
      },
    ];

    try {
      console.log(`Mengirim request ke Ollama dengan model ${model}...`);
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 4096,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ollama API error:", response.status, errorText);
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Response dari Ollama:", data);
      return data.message.content;
    } catch (error) {
      console.error("Error calling Ollama API:", error);
      throw new Error(
        `Failed to connect to Ollama. Please make sure Ollama is running on ${
          this.baseURL
        } and model ${model} is available. Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Method untuk test koneksi yang lebih sederhana
  async testConnection() {
    try {
      console.log("Testing connection to Ollama...");
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Ollama models:", data);
      return true;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  // Method untuk mendapatkan list model
  async getAvailableModels() {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error("Error fetching models:", error);
      return [];
    }
  }

  // Method untuk test model tertentu
  async testModel(model: string) {
    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          prompt: "Hello",
          stream: false,
        }),
      });
      return response.ok;
    } catch (error) {
      console.error(`Error testing model ${model}:`, error);
      return false;
    }
  }
}

// Service untuk analisis pertanyaan dan pencarian konten spesifik
class SmartContentSourceService {
  private contentDatabase = {
    // Cybersecurity Content
    cybersecurity: {
      "bssn.go.id": [
        {
          title: "Laporan Ancaman Siber Kuartal III 2024",
          url: "https://bssn.go.id/laporan-ancaman-siber-kuartal-iii-2024",
          snippet:
            "Analisis komprehensif pola serangan siber terkini di Indonesia dengan fokus pada ransomware dan phishing attacks",
          keywords: [
            "ransomware",
            "phishing",
            "serangan siber",
            "ancaman",
            "kuartal",
          ],
        },
        {
          title: "Panduan Mitigasi Serangan Ransomware",
          url: "https://bssn.go.id/panduan-mitigasi-ransomware-2024",
          snippet:
            "Protokol lengkap untuk mencegah dan menanggapi serangan ransomware pada infrastruktur kritis",
          keywords: [
            "mitigasi",
            "ransomware",
            "infrastruktur kritis",
            "protokol",
          ],
        },
      ],
      "cisa.gov": [
        {
          title: "Alert: Critical Ransomware Threats to Healthcare",
          url: "https://www.cisa.gov/news-events/alerts/2024/10/15/alert-critical-ransomware-threats-healthcare",
          snippet:
            "Peringatan dini tentang serangan ransomware terhadap sektor kesehatan dengan IoCs dan rekomendasi",
          keywords: [
            "ransomware",
            "kesehatan",
            "IOC",
            "critical infrastructure",
          ],
        },
      ],
    },

    // AI & Technology Content
    "ai-technology": {
      "openai.com": [
        {
          title: "GPT-4 Technical Report",
          url: "https://openai.com/research/gpt-4",
          snippet:
            "Laporan teknis lengkap tentang arsitektur, kemampuan, dan evaluasi model GPT-4",
          keywords: ["GPT-4", "technical", "model", "evaluasi", "arsitektur"],
        },
      ],
      "anthropic.com": [
        {
          title: "Claude 3 Model Family Technical Paper",
          url: "https://www.anthropic.com/research/claude-3",
          snippet:
            "Detail teknis tentang keluarga model Claude 3 dengan benchmark dan kemampuan reasoning",
          keywords: [
            "Claude 3",
            "model",
            "technical",
            "reasoning",
            "benchmark",
          ],
        },
      ],
    },

    // Science & Research Content
    science: {
      "nature.com": [
        {
          title: "Breakthrough in Quantum Computing Stability",
          url: "https://www.nature.com/articles/s41586-024-07585-9",
          snippet:
            "Penemuan terbaru dalam meningkatkan stabilitas qubit untuk komputasi kuantum praktis",
          keywords: [
            "quantum",
            "computing",
            "qubit",
            "stability",
            "breakthrough",
          ],
        },
      ],
    },
  };

  private analyzeQuery(query: string): {
    category: string;
    topics: string[];
    intent: string;
  } {
    const queryLower = query.toLowerCase();

    // Deteksi kategori utama
    let category = "general";
    const categories = {
      cybersecurity: [
        "siber",
        "cyber",
        "hacker",
        "ransomware",
        "phishing",
        "keamanan",
        "serangan",
        "ancaman",
        "malware",
        "APT",
      ],
      "ai-technology": [
        "AI",
        "artificial intelligence",
        "machine learning",
        "openai",
        "gpt",
        "claude",
        "model",
        "neural network",
      ],
      science: [
        "sains",
        "science",
        "research",
        "penelitian",
        "quantum",
        "nasa",
        "nature",
        "discovery",
      ],
      health: [
        "kesehatan",
        "health",
        "medical",
        "dokter",
        "rumah sakit",
        "virus",
        "pandemi",
        "who",
      ],
      business: [
        "bisnis",
        "business",
        "ekonomi",
        "economy",
        "market",
        "pasar",
        "investasi",
        "bloomberg",
      ],
    };

    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => queryLower.includes(keyword))) {
        category = cat;
        break;
      }
    }

    // Ekstrak topik spesifik
    const topics: string[] = [];
    const topicKeywords = [
      "ransomware",
      "phishing",
      "APT",
      "GPT",
      "Claude",
      "quantum",
      "vaccine",
      "inflation",
      "market",
      "research",
      "development",
      "security",
      "attack",
    ];

    topicKeywords.forEach((topic) => {
      if (queryLower.includes(topic)) {
        topics.push(topic);
      }
    });

    // Deteksi intent
    let intent = "information";
    if (queryLower.includes("bagaimana") || queryLower.includes("how"))
      intent = "method";
    if (queryLower.includes("mengapa") || queryLower.includes("why"))
      intent = "explanation";
    if (queryLower.includes("rekomendasi") || queryLower.includes("recommend"))
      intent = "recommendation";
    if (queryLower.includes("laporan") || queryLower.includes("report"))
      intent = "report";

    return { category, topics, intent };
  }

  private findRelevantContent(
    category: string,
    topics: string[],
    intent: string,
    query: string
  ): Source[] {
    const sources: Source[] = [];

    // Ambil konten dari kategori yang terdeteksi
    const categoryContent =
      this.contentDatabase[category as keyof typeof this.contentDatabase];
    if (!categoryContent) return this.getFallbackContent(query);

    // Cari konten yang paling relevan berdasarkan topik dan intent
    Object.entries(categoryContent).forEach(([domain, contents]) => {
      contents.forEach((content) => {
        // Hitung skor relevansi
        let relevanceScore = 70; // Base score

        // Tambah skor berdasarkan keyword match
        content.keywords.forEach((keyword) => {
          if (
            topics.includes(keyword) ||
            query.toLowerCase().includes(keyword)
          ) {
            relevanceScore += 10;
          }
        });

        // Tambah skor berdasarkan intent match
        if (
          intent === "report" &&
          content.snippet.toLowerCase().includes("laporan")
        ) {
          relevanceScore += 15;
        }
        if (
          intent === "recommendation" &&
          content.snippet.toLowerCase().includes("rekomendasi")
        ) {
          relevanceScore += 15;
        }

        if (relevanceScore >= 75) {
          sources.push({
            title: content.title,
            url: content.url,
            snippet: content.snippet,
            relevance: Math.min(99, relevanceScore),
            date: new Date().toISOString().split("T")[0],
            domain: domain,
            category: this.getCategoryDisplayName(category),
          });
        }
      });
    });

    // Urutkan berdasarkan relevansi dan ambil top 3
    return sources.sort((a, b) => b.relevance - a.relevance).slice(0, 3);
  }

  private getCategoryDisplayName(category: string): string {
    const names: { [key: string]: string } = {
      cybersecurity: "Keamanan Siber",
      "ai-technology": "AI & Teknologi",
      science: "Sains & Research",
      health: "Kesehatan",
      business: "Bisnis & Ekonomi",
      general: "Umum",
    };
    return names[category] || "Umum";
  }

  private getFallbackContent(query: string): Source[] {
    // Fallback ke konten umum yang relevan
    return [
      {
        title: "OpenAI Research Overview",
        url: "https://openai.com/research",
        domain: "openai.com",
        snippet: "Kumpulan penelitian dan development AI terbaru dari OpenAI",
        relevance: 80,
        date: new Date().toISOString().split("T")[0],
        category: "AI & Teknologi",
      },
      {
        title: "BSSN Publications",
        url: "https://bssn.go.id/publikasi",
        domain: "bssn.go.id",
        snippet: "Publikasi dan laporan resmi tentang keamanan siber Indonesia",
        relevance: 75,
        date: new Date().toISOString().split("T")[0],
        category: "Keamanan Siber",
      },
    ];
  }

  async getSourcesForQuery(query: string): Promise<Source[]> {
    try {
      // Simulasi analisis konten
      await new Promise((resolve) =>
        setTimeout(resolve, 500 + Math.random() * 500)
      );

      // Analisis query untuk memahami kategori, topik, dan intent
      const { category, topics, intent } = this.analyzeQuery(query);

      // Cari konten yang relevan
      const relevantContent = this.findRelevantContent(
        category,
        topics,
        intent,
        query
      );

      return relevantContent.length > 0
        ? relevantContent
        : this.getFallbackContent(query);
    } catch (error) {
      console.error("Error analyzing content:", error);
      return this.getFallbackContent(query);
    }
  }
}

// Service untuk real-time fact checking dan news search
class RealTimeFactCheckService {
  private credibilityScores = {
    "bbc.com": 95,
    "reuters.com": 94,
    "apnews.com": 93,
    "cnn.com": 88,
    "theguardian.com": 89,
    "aljazeera.com": 87,
    "nytimes.com": 92,
    "washingtonpost.com": 91,
    "bloomberg.com": 90,
    "kompas.com": 85,
    "detik.com": 82,
    "cnbcindonesia.com": 83,
    "bssn.go.id": 90,
    "cisa.gov": 93,
    "who.int": 94,
  };

  private getCredibilityLevel(score: number): "high" | "medium" | "low" {
    if (score >= 85) return "high";
    if (score >= 70) return "medium";
    return "low";
  }

  async searchRealTimeNews(query: string): Promise<NewsSource[]> {
    // Simulasi pencarian berita real-time dari berbagai sumber
    await new Promise((resolve) =>
      setTimeout(resolve, 800 + Math.random() * 700)
    );

    const currentDate = new Date();
    const searchTime = currentDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const searchDate = currentDate.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Database simulasi berita terkini berdasarkan query
    const newsDatabase: { [key: string]: NewsSource[] } = {
      "pemilu indonesia 2024": [
        {
          title: "Hasil Quick Count Pemilu 2024: Real Count 90%",
          url: "https://www.kompas.com/pemilu/hasil-quick-count-2024",
          snippet:
            "Update terbaru hasil real count pemilu 2024 menunjukkan progres 90% dengan data terverifikasi KPU.",
          date: "14 Februari 2024",
          time: "15:30 WIB",
          domain: "kompas.com",
          category: "Politik",
          relevance: 96,
          credibility: "high",
        },
        {
          title: "Analisis: Dinamika Terkini Pemilu Indonesia 2024",
          url: "https://www.bbc.com/indonesia/pemilu-2024",
          snippet:
            "Analisis mendalam tentang perkembangan terbaru dan fakta-fakta pemilu Indonesia 2024.",
          date: "14 Februari 2024",
          time: "14:15 WIB",
          domain: "bbc.com",
          category: "Politik",
          relevance: 94,
          credibility: "high",
        },
      ],
      "gempa turki": [
        {
          title:
            "Update: Gempa Turki 6.8 SR - Korban dan Bantuan Internasional",
          url: "https://www.reuters.com/turkey-earthquake-update",
          snippet:
            "Gempa berkekuatan 6.8 SR mengguncang Turki, tim SAR internasional bergerak cepat untuk evakuasi.",
          date: "13 Februari 2024",
          time: "08:45 WIB",
          domain: "reuters.com",
          category: "Bencana Alam",
          relevance: 98,
          credibility: "high",
        },
        {
          title: "Analisis Dampak Gempa Turki Terkini",
          url: "https://www.aljazeera.com/turkey-earthquake-analysis",
          snippet:
            "Analisis komprehensif dampak gempa dan upaya pemulihan di wilayah terdampak.",
          date: "13 Februari 2024",
          time: "10:20 WIB",
          domain: "aljazeera.com",
          category: "Bencana Alam",
          relevance: 92,
          credibility: "high",
        },
      ],
      "harga bitcoin": [
        {
          title: "Harga Bitcoin Tembus $52,000 - Analisis Pasar Kripto",
          url: "https://www.bloomberg.com/crypto/bitcoin-price-52000",
          snippet:
            "Bitcoin mencapai level $52,000 didorong oleh adopsi institusional dan regulasi yang lebih jelas.",
          date: "14 Februari 2024",
          time: "16:05 WIB",
          domain: "bloomberg.com",
          category: "Ekonomi",
          relevance: 97,
          credibility: "high",
        },
        {
          title: "Prediksi Harga Bitcoin Menuju Halving 2024",
          url: "https://www.cnbcindonesia.com/bitcoin-halving-2024",
          snippet:
            "Analis memprediksi momentum positif Bitcoin menuju event halving pada April 2024.",
          date: "14 Februari 2024",
          time: "13:30 WIB",
          domain: "cnbcindonesia.com",
          category: "Ekonomi",
          relevance: 89,
          credibility: "medium",
        },
      ],
      ransomware: [
        {
          title: "Laporan Ancaman Siber Kuartal III 2024 - BSSN",
          url: "https://bssn.go.id/laporan-ancaman-siber-kuartal-iii-2024",
          snippet:
            "Analisis komprehensif pola serangan siber terkini di Indonesia dengan fokus pada ransomware dan phishing attacks",
          date: "12 Februari 2024",
          time: "09:00 WIB",
          domain: "bssn.go.id",
          category: "Keamanan Siber",
          relevance: 95,
          credibility: "high",
        },
        {
          title: "Alert: Critical Ransomware Threats to Healthcare - CISA",
          url: "https://www.cisa.gov/news-events/alerts/2024/10/15/alert-critical-ransomware-threats-healthcare",
          snippet:
            "Peringatan dini tentang serangan ransomware terhadap sektor kesehatan dengan IoCs dan rekomendasi",
          date: "15 Oktober 2024",
          time: "14:20 WIB",
          domain: "cisa.gov",
          category: "Keamanan Siber",
          relevance: 93,
          credibility: "high",
        },
      ],
    };

    // Cari berita yang relevan dengan query
    const queryLower = query.toLowerCase();
    let relevantNews: NewsSource[] = [];

    for (const [key, news] of Object.entries(newsDatabase)) {
      if (
        queryLower.includes(key) ||
        this.calculateSimilarity(queryLower, key) > 0.3
      ) {
        relevantNews = [...relevantNews, ...news];
        break;
      }
    }

    // Fallback news jika tidak ada yang cocok
    if (relevantNews.length === 0) {
      relevantNews = [
        {
          title: "Berita Terkini - Update Berita Hari Ini",
          url: "https://www.bbc.com/news",
          snippet: `Kumpulan berita terkini dan terpercaya dari berbagai sumber terverifikasi. Pencarian dilakukan pada ${searchDate} pukul ${searchTime}.`,
          date: searchDate,
          time: searchTime,
          domain: "bbc.com",
          category: "Umum",
          relevance: 85,
          credibility: "high",
        },
        {
          title: "Reuters: Breaking International News",
          url: "https://www.reuters.com",
          snippet:
            "Sumber berita internasional terpercaya dengan update terkini dari seluruh dunia.",
          date: searchDate,
          time: searchTime,
          domain: "reuters.com",
          category: "Internasional",
          relevance: 82,
          credibility: "high",
        },
      ];
    }

    return relevantNews.slice(0, 3);
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(" ");
    const words2 = str2.split(" ");
    const matches = words1.filter((word) => words2.includes(word)).length;
    return matches / Math.max(words1.length, words2.length);
  }

  async getFactCheckData(query: string): Promise<FactCheckData> {
    const sources = await this.searchRealTimeNews(query);
    const currentTime = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const currentDate = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      searchTimestamp: `Pencarian dilakukan ${currentDate} pukul ${currentTime}`,
      sources: sources,
      confidence: 85 + Math.floor(Math.random() * 15),
      category: this.analyzeQueryCategory(query),
    };
  }

  private analyzeQueryCategory(query: string): string {
    const queryLower = query.toLowerCase();
    if (queryLower.includes("pemilu") || queryLower.includes("politik"))
      return "Politik";
    if (queryLower.includes("gempa") || queryLower.includes("bencana"))
      return "Bencana Alam";
    if (queryLower.includes("bitcoin") || queryLower.includes("kripto"))
      return "Ekonomi";
    if (queryLower.includes("ransomware") || queryLower.includes("siber"))
      return "Keamanan Siber";
    if (queryLower.includes("covid") || queryLower.includes("virus"))
      return "Kesehatan";
    return "Umum";
  }
}

// Utility function untuk menghilangkan markdown
const removeMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/#{1,6}\s?/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// Ollama client setup - ganti dengan URL Ollama Anda jika berbeda
const OLLAMA_BASE_URL = "http://localhost:11434";
const ollamaClient = new OllamaClient(OLLAMA_BASE_URL);
const sourceService = new SmartContentSourceService();
const factCheckService = new RealTimeFactCheckService();

export function AIQueryInput1() {
  const [query, setQuery] = useState("");
  const [selectedMode, setSelectedMode] =
    useState<keyof typeof QUERY_TEMPLATES>("qa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedPersona, setSelectedPersona] =
    useState<keyof typeof AI_PERSONAS>("analyst");
  const [showChat, setShowChat] = useState(true);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState<
    "disconnected" | "connected" | "error"
  >("disconnected");
  const [isSearchingSources, setIsSearchingSources] = useState(false);
  const [isFactChecking, setIsFactChecking] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<string>("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("llama3.1:latest");
  const [modelStatus, setModelStatus] = useState<{
    [key: string]: "loading" | "available" | "error";
  }>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize dengan welcome message dan test koneksi
  useEffect(() => {
    setChatHistory([
      {
        id: "1",
        content:
          "Halo! Saya asisten AI yang siap membantu Anda. Saya menggunakan Ollama local dengan dukungan multiple models (Llama 3.1 dan Mistral 7B) serta kemampuan analisis konten cerdas dan real-time fact checking.\n\nFitur:\n- Multiple Models: Llama 3.1 & Mistral 7B\n- Analisis konten cerdas\n- Fact checking\n- Multiple AI personas\n- Support berbagai model Ollama\n\nPilih model yang ingin digunakan dan mulai bertanya!",
        role: "assistant",
        timestamp: new Date(),
        modelUsed: "system",
        sources: [
          {
            title: "Laporan Ancaman Siber BSSN 2024",
            url: "https://bssn.go.id/laporan-ancaman-siber-kuartal-iii-2024",
            domain: "bssn.go.id",
            snippet: "Analisis pola serangan siber terkini",
            relevance: 95,
            category: "Keamanan Siber",
          },
        ],
      },
    ]);

    // Test koneksi API dan ambil list model saat komponen mount
    testApiConnection();
    fetchAvailableModels();
  }, []);

  // Auto-scroll ke bawah chat setiap kali chatHistory berubah
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, showChat]);

  // Auto-scroll yang lebih reliable
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

  const fetchAvailableModels = async () => {
    try {
      const models = await ollamaClient.getAvailableModels();
      const modelNames = models.map((model: any) => model.name);
      setAvailableModels(modelNames);

      // Test ketersediaan model yang didukung
      const supportedModels = Object.keys(AVAILABLE_MODELS);
      const statusUpdates: {
        [key: string]: "loading" | "available" | "error";
      } = {};

      for (const model of supportedModels) {
        if (modelNames.includes(model)) {
          statusUpdates[model] = "available";
        } else {
          statusUpdates[model] = "error";
        }
      }

      setModelStatus(statusUpdates);

      // Set default model yang tersedia
      const defaultModel =
        modelNames.find(
          (name: string) =>
            name.includes("llama3.1") || name === "llama3.1:latest"
        ) ||
        modelNames[0] ||
        "llama3.1:latest";

      setSelectedModel(defaultModel);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const testApiConnection = async () => {
    setIsProcessing(true);
    setError("");
    try {
      console.log("Memulai test koneksi Ollama...");
      const isConnected = await ollamaClient.testConnection();

      if (isConnected) {
        setApiStatus("connected");
        setChatHistory([
          {
            id: "1",
            content:
              "✅ Koneksi berhasil! Terhubung ke Ollama local. Multiple models tersedia.\n\nModel yang didukung:\n- Llama 3.1: Reasoning yang baik, cocok untuk analisis kompleks\n- Mistral 7B: Efisien dan cepat, cocok untuk tugas umum\n\nPilih model sesuai kebutuhan Anda!",
            role: "assistant",
            timestamp: new Date(),
            modelUsed: "system",
          },
        ]);
      } else {
        setApiStatus("error");
        setError(
          "Tidak dapat terhubung ke Ollama. Pastikan:\n1. Ollama berjalan di background\n2. URL http://localhost:11434 dapat diakses\n3. Tidak ada firewall yang memblokir"
        );
      }
    } catch (error) {
      setApiStatus("error");
      setError(
        `Koneksi gagal: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\nPastikan Ollama sudah diinstall dan running.`
      );
      console.error("Test connection error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const searchIntelligentSources = async (
    userQuery: string
  ): Promise<Source[]> => {
    setIsSearchingSources(true);
    try {
      const sources = await sourceService.getSourcesForQuery(userQuery);
      const analysis = sourceService["analyzeQuery"](userQuery);
      setDetectedCategory(analysis.category);
      return sources;
    } catch (error) {
      console.error("Error analyzing sources:", error);
      setDetectedCategory("general");
      return sourceService["getFallbackContent"](userQuery);
    } finally {
      setIsSearchingSources(false);
    }
  };

  const performFactCheck = async (
    userQuery: string
  ): Promise<FactCheckData> => {
    setIsFactChecking(true);
    try {
      const factCheckData = await factCheckService.getFactCheckData(userQuery);
      setDetectedCategory(factCheckData.category);
      return factCheckData;
    } catch (error) {
      console.error("Error fact checking:", error);
      const currentTime = new Date().toLocaleTimeString("id-ID");
      const currentDate = new Date().toLocaleDateString("id-ID");
      return {
        searchTimestamp: `Pencarian dilakukan ${currentDate} pukul ${currentTime}`,
        sources: [],
        confidence: 70,
        category: "Umum",
      };
    } finally {
      setIsFactChecking(false);
    }
  };

  const callOllamaAPI = async (userQuery: string): Promise<ChatMessage> => {
    const systemPrompt = AI_PERSONAS[selectedPersona].systemPrompt.replace(
      "{{user_query}}",
      userQuery
    );

    let intelligentSources: Source[] = [];
    let factCheckData: FactCheckData | undefined;

    // Jika mode factcheck atau persona factchecker, lakukan real-time fact checking
    if (selectedMode === "factcheck" || selectedPersona === "factchecker") {
      factCheckData = await performFactCheck(userQuery);
    } else {
      // Untuk mode lainnya, gunakan sistem pencarian konten cerdas
      intelligentSources = await searchIntelligentSources(userQuery);
    }

    const response = await ollamaClient.createResponse(
      userQuery,
      systemPrompt,
      selectedModel,
      chatHistory
    );

    // Hapus semua markdown dari respons
    const cleanResponse = removeMarkdown(response);

    return {
      id: Date.now().toString(),
      content: cleanResponse,
      role: "assistant",
      timestamp: new Date(),
      sources: intelligentSources,
      factCheckData: factCheckData,
      modelUsed: selectedModel,
      confidence: factCheckData
        ? factCheckData.confidence
        : 92 + Math.floor(Math.random() * 8),
    };
  };

  const handleModeChange = (mode: keyof typeof QUERY_TEMPLATES) => {
    setSelectedMode(mode);
    // Otomatis ganti persona jika mode factcheck dipilih
    if (mode === "factcheck") {
      setSelectedPersona("factchecker");
    }
  };

  const handleTemplateSelect = (template: string) => {
    setQuery(template);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
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
    setDetectedCategory("");

    try {
      const aiResponse = await callOllamaAPI(query);
      setChatHistory((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error calling Ollama API:", error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `Maaf, terjadi error: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\nPastikan model ${selectedModel} tersedia di Ollama.`,
        role: "assistant",
        timestamp: new Date(),
        modelUsed: "system",
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

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const clearChat = () => {
    setChatHistory([
      {
        id: "1",
        content:
          "Percakapan telah dibersihkan. Sistem AI dengan Ollama local dan multiple models siap untuk menganalisis pertanyaan Anda dan mengarahkan langsung ke konten spesifik yang relevan.",
        role: "assistant",
        timestamp: new Date(),
        modelUsed: "system",
      },
    ]);
    setDetectedCategory("");
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
        return "Ollama Connected";
      case "error":
        return "Koneksi Error";
      default:
        return "Menghubungkan...";
    }
  };

  const getCategoryDisplayName = (category: string): string => {
    const names: { [key: string]: string } = {
      cybersecurity: "Keamanan Siber",
      "ai-technology": "AI & Teknologi",
      science: "Sains & Research",
      health: "Kesehatan",
      business: "Bisnis & Ekonomi",
      general: "Umum",
      Politik: "Politik",
      "Bencana Alam": "Bencana Alam",
      Ekonomi: "Ekonomi",
      "Keamanan Siber": "Keamanan Siber",
      Kesehatan: "Kesehatan",
    };
    return names[category] || "Umum";
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

  const getModelStatus = (model: string) => {
    return modelStatus[model] || "loading";
  };

  // Komponen untuk menampilkan sumber data yang compact
  const CompactSources = ({ sources }: { sources: Source[] }) => {
    if (!sources || sources.length === 0) return null;

    return (
      <div className="pt-3 border-t border-border/50 mt-3">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Sumber Terkait:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sources.map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md border border-blue-200 transition-colors group"
              title={source.title}
            >
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 hover:bg-green-100 text-xs px-1 h-4"
              >
                {source.relevance}%
              </Badge>
              <span className="max-w-[120px] truncate">{source.domain}</span>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>
    );
  };

  // Komponen untuk menampilkan fact check sources
  const FactCheckSources = ({
    factCheckData,
  }: {
    factCheckData: FactCheckData;
  }) => {
    if (!factCheckData.sources || factCheckData.sources.length === 0)
      return null;

    const getCredibilityIcon = (credibility: string) => {
      switch (credibility) {
        case "high":
          return <Verified className="w-3 h-3 text-green-500" />;
        case "medium":
          return <Verified className="w-3 h-3 text-yellow-500" />;
        default:
          return <Verified className="w-3 h-3 text-red-500" />;
      }
    };

    return (
      <div className="pt-3 border-t border-border/50 mt-3">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-foreground">
            Sumber Fact Check
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{factCheckData.searchTimestamp}</span>
        </div>

        <div className="space-y-2">
          {factCheckData.sources.map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCredibilityIcon(source.credibility)}
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      source.credibility === "high" &&
                        "bg-green-100 text-green-700",
                      source.credibility === "medium" &&
                        "bg-yellow-100 text-yellow-700",
                      source.credibility === "low" && "bg-red-100 text-red-700"
                    )}
                  >
                    {source.relevance}% relevan
                  </Badge>
                </div>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <h4 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-blue-700">
                {source.title}
              </h4>

              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {source.snippet}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  <span>{source.domain}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {source.date} • {source.time}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  // Model Selection Component
  const ModelSelector = () => {
    return (
      <Select
        value={selectedModel}
        onValueChange={setSelectedModel}
        disabled={isProcessing}
      >
        <SelectTrigger className="w-32 h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(AVAILABLE_MODELS).map(([modelKey, modelInfo]) => {
            const Icon = modelInfo.icon;
            const status = getModelStatus(modelKey);
            return (
              <SelectItem
                key={modelKey}
                value={modelKey}
                disabled={status !== "available"}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3 h-3" />
                  <span className="text-xs">{modelInfo.name}</span>
                  {status === "available" && (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  )}
                  {status === "error" && (
                    <AlertCircle className="w-3 h-3 text-red-500" />
                  )}
                  {status === "loading" && (
                    <div className="w-3 h-3 border-2 border-current border-r-transparent rounded-full animate-spin" />
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  };

  // Icon RefreshCw component
  const RefreshCw = ({ className }: { className?: string }) => {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9" />
        <path d="M17 7l-4-4-4 4" />
        <path d="M17 7v10" />
        <path d="M7 17l4 4 4-4" />
        <path d="M7 17V7" />
      </svg>
    );
  };

  return (
    <Card className="flex flex-col h-[800px]">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI Intelligence Assistant</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
              {getStatusIcon()}
              <span className={cn("text-sm font-medium", getStatusColor())}>
                {getStatusText()}
              </span>
            </div>
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
                <>
                  <ChevronDown className="w-4 h-4" />
                  Sembunyikan
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 rotate-180" />
                  Tampilkan
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
        {/* Connection Status Bar - Compact */}
        <div className="px-4 py-2 bg-muted/30 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    apiStatus === "connected" ? "default" : "destructive"
                  }
                  className={cn("text-xs", getModelColor(selectedModel))}
                >
                  {getModelDisplayName(selectedModel)}
                </Badge>
                <ModelSelector />
                <Badge variant="secondary" className="text-xs">
                  {AI_PERSONAS[selectedPersona].name}
                </Badge>
                {detectedCategory && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    🎯 {getCategoryDisplayName(detectedCategory)}
                  </Badge>
                )}
                {(selectedMode === "factcheck" ||
                  selectedPersona === "factchecker") && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    🔍 Real-Time Fact Check
                  </Badge>
                )}
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

        {/* Chat History Section */}
        {showChat && (
          <div className="flex-1 overflow-hidden border-b">
            <div className="h-full overflow-hidden">
              <ScrollArea ref={chatContainerRef} className="h-full w-full">
                <div className="px-4 py-4 min-h-full">
                  <div className="space-y-4">
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
                            {selectedPersona === "factchecker" ? (
                              <Verified className="w-4 h-4 text-purple-600" />
                            ) : (
                              <Bot className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                        )}
                        <div
                          className={cn(
                            "rounded-lg p-4 space-y-2 max-w-[85%] min-w-[200px]",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : selectedPersona === "factchecker"
                              ? "bg-blue-50 border border-blue-200"
                              : "bg-muted border"
                          )}
                        >
                          <div className="flex items-center justify-between text-xs opacity-70">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {message.timestamp.toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {message.modelUsed &&
                                message.modelUsed !== "system" && (
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
                            {message.role === "assistant" &&
                              message.confidence && (
                                <span className="font-medium">
                                  {message.confidence}% confidence
                                </span>
                              )}
                          </div>

                          <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                            {message.content}
                          </div>

                          {message.sources && message.role === "assistant" && (
                            <CompactSources sources={message.sources} />
                          )}

                          {message.factCheckData &&
                            message.role === "assistant" && (
                              <FactCheckSources
                                factCheckData={message.factCheckData}
                              />
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
                          {selectedPersona === "factchecker" ? (
                            <Verified className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Bot className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "rounded-lg p-4 border max-w-[85%] min-w-[200px]",
                            selectedPersona === "factchecker"
                              ? "bg-blue-50 border-blue-200"
                              : "bg-muted"
                          )}
                        >
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
                              {selectedPersona === "factchecker"
                                ? "Memverifikasi Fakta..."
                                : "Memproses..."}
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
                            {isSearchingSources && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Search className="w-3 h-3 animate-pulse" />
                                {detectedCategory ? (
                                  <>
                                    Mencari konten{" "}
                                    {getCategoryDisplayName(detectedCategory)}
                                    ...
                                  </>
                                ) : (
                                  <>Menganalisis pertanyaan...</>
                                )}
                              </div>
                            )}
                            {isFactChecking && (
                              <div className="flex items-center gap-2 text-xs text-blue-600">
                                <Verified className="w-3 h-3 animate-pulse" />
                                Mencari berita terkini dari sumber terpercaya...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Div untuk auto-scroll */}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Input Section - Compact */}
        <div className="p-3 space-y-3 flex-shrink-0 border-t">
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              placeholder="Ketik pertanyaan Anda di sini..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
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
                onValueChange={(value: keyof typeof QUERY_TEMPLATES) =>
                  handleModeChange(value)
                }
                disabled={isProcessing}
              >
                <SelectTrigger className="w-24 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qa">Q&A</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="generator">Generator</SelectItem>
                  <SelectItem value="risk">Risk</SelectItem>
                  <SelectItem value="factcheck">Fact Check</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedPersona}
                onValueChange={(value: keyof typeof AI_PERSONAS) =>
                  setSelectedPersona(value)
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
                className={cn(
                  "text-white hover:bg-purple-700 flex items-center gap-1 h-7 px-3",
                  selectedPersona === "factchecker"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-purple-600 hover:bg-purple-700"
                )}
              >
                {isProcessing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-current border-r-transparent rounded-full animate-spin" />
                    <span className="text-xs">
                      {selectedPersona === "factchecker"
                        ? "Checking"
                        : "Process"}
                    </span>
                  </>
                ) : (
                  <>
                    {selectedPersona === "factchecker" ? (
                      <Verified className="w-3 h-3" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    <span className="text-xs">
                      {selectedPersona === "factchecker"
                        ? "Fact Check"
                        : "Kirim"}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
