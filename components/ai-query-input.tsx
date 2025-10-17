import { AIQueryInput } from "@/components/ai-model";

export default function Home() {
  const handleProcessComplete = (data: any) => {
    console.log("Analysis completed:", data);
  };

  return (
    <div className="container mx-auto p-6">
      <AIQueryInput
        onProcessComplete={handleProcessComplete}
        initialMode="visual"
        initialPersona="strategist"
        initialModel="llama"
      />
    </div>
  );
}
