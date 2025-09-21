import React, { useState, useEffect } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import WelcomeScreen from "./components/WelcomeScreen";
import SetDefaultBrandModal from "./components/SetDefaultBrandModal";
import ChatLogsPage from "./components/ChatLogsPage";
import SettingsPage from "./components/SettingsPage";
import HelpWidget from "./components/HelpWidget";
import AiSidebar from "./components/AiSidebar";
import { HelpCircleIcon } from "./components/icons";
import type {
  Brand,
  ActiveView,
  AIResponse,
  ConversationItem,
  DashboardData,
} from "./types";
import { getRealCampaignData } from "./data/realCampaignData";

// Import all report pages
import PaidMediaReport from "./components/reports/PaidMediaReport";
import OrganicSearchReport from "./components/reports/OrganicSearchReport";
import SocialMediaReport from "./components/reports/SocialMediaReport";
import EcommerceReport from "./components/reports/EcommerceReport";
import KOLReport from "./components/reports/KOLReport";
import PublishersReport from "./components/reports/PublishersReport";
import OfflineMediaReport from "./components/reports/OfflineMediaReport";
import CompetitorBenchmarkingReport from "./components/reports/CompetitorBenchmarkingReport";
import SocialListeningReport from "./components/reports/SocialListeningReport";

interface AppProps {
  onLogout: () => void;
  user: User;
}

const App: React.FC<AppProps> = ({ onLogout, user }) => {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [showSetDefaultModal, setShowSetDefaultModal] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // AI Sidebar State
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [aiConversation, setAiConversation] = useState<ConversationItem[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Real data state
  const [realBrandData, setRealBrandData] = useState<
    Record<Brand, DashboardData>
  >({} as Record<Brand, DashboardData>);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  // Function to load real campaign data for a brand (real-time, no caching)
  const loadBrandData = async (brand: Brand) => {
    console.log(`🚀 loadBrandData called for brand: ${brand}`);
    setIsDataLoading(true);
    setDataLoadError(null);

    try {
      console.log(`🔄 App.tsx: Loading real-time data for ${brand}...`);
      const data = await getRealCampaignData(brand);
      console.log(`📊 App.tsx: Data received for ${brand}:`, {
        executiveMetrics: data.executiveMetrics?.length || 0,
        secondaryMetrics: data.secondaryMetrics?.length || 0,
        topCampaigns: data.topCampaigns?.length || 0,
        alerts: data.alerts?.length || 0,
        recommendations: data.recommendations?.length || 0,
      });
      setRealBrandData((prev) => ({
        ...prev,
        [brand]: data,
      }));
      console.log(
        `✅ App.tsx: Successfully loaded and stored data for ${brand}`
      );
    } catch (error) {
      console.error(`❌ App.tsx: Failed to load data for ${brand}:`, error);
      setDataLoadError(`Failed to load data for ${brand}`);
    } finally {
      setIsDataLoading(false);
      console.log(
        `🏁 App.tsx: Loading completed for ${brand}, isDataLoading set to false`
      );
    }
  };

  // Function to refresh data for current brand
  const refreshCurrentBrandData = () => {
    if (selectedBrand) {
      console.log(`🔄 App.tsx: Refreshing data for ${selectedBrand}...`);
      loadBrandData(selectedBrand);
    }
  };

  useEffect(() => {
    console.log("🚀 App.tsx: Initial useEffect - checking for default brand");
    const defaultBrand = localStorage.getItem("defaultBrand") as Brand | null;
    console.log(`📂 App.tsx: Default brand from localStorage: ${defaultBrand}`);
    if (defaultBrand) {
      console.log(`🎯 App.tsx: Setting selected brand to: ${defaultBrand}`);
      setSelectedBrand(defaultBrand);
      // Don't call loadBrandData here - let the brand selection useEffect handle it
    } else {
      console.log(
        "❓ App.tsx: No default brand found, user will need to select one"
      );
    }
  }, []);

  // Load fresh data every time brand changes (real-time filtering)
  useEffect(() => {
    console.log(
      `🔄 App.tsx: Brand selection useEffect triggered, selectedBrand: ${selectedBrand}`
    );
    if (selectedBrand) {
      console.log(
        `🎯 App.tsx: Brand changed to ${selectedBrand} - fetching fresh data...`
      );
      console.log(
        `📊 App.tsx: Current brand data cache:`,
        Object.keys(realBrandData)
      );
      loadBrandData(selectedBrand);
    } else {
      console.log("❓ App.tsx: selectedBrand is null, skipping data load");
    }
  }, [selectedBrand]);

  const handleAiPrompt = async (prompt: string, brand: Brand) => {
    setIsAiLoading(true);

    const isFollowUp =
      isAiSidebarOpen && aiConversation.length > 0 && currentChatId;
    const userMessage: ConversationItem = {
      sender: "user",
      userPrompt: prompt,
    };
    const loadingMessage: ConversationItem = { sender: "ai", isLoading: true };

    const baseConversation = isFollowUp
      ? aiConversation.filter((item) => !item.error)
      : [];
    const newConversation = [...baseConversation, userMessage, loadingMessage];
    setAiConversation(newConversation);

    if (!isAiSidebarOpen) {
      setIsAiSidebarOpen(true);
    }

    let chatId = currentChatId;

    if (!isFollowUp) {
      // Create new chat log in Supabase
      const { data, error } = await supabase
        .from("chat_logs")
        .insert({
          user_id: user.id,
          title: prompt.substring(0, 50), // Use first 50 chars as title
          conversation: newConversation,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating chat log:", error);
      } else if (data) {
        chatId = data.id;
        setCurrentChatId(data.id);
      }
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      });
      const brandData = realBrandData[brand];

      // Check if brand data is available
      if (!brandData) {
        const errorConversation = [...newConversation];
        const lastIndex = errorConversation.length - 1;
        if (
          errorConversation[lastIndex] &&
          errorConversation[lastIndex].isLoading
        ) {
          errorConversation[lastIndex] = {
            sender: "ai",
            error: `Real-time data for ${brand} is still loading. Please wait a moment and try again.`,
          };
        }
        setAiConversation(errorConversation);
        setIsAiLoading(false);
        return;
      }

      // Enhanced context data with comprehensive real campaign metrics
      const contextData = {
        // Core performance metrics
        executiveMetrics: brandData.executiveMetrics,
        secondaryMetrics: brandData.secondaryMetrics,

        // Campaign performance
        topCampaigns: brandData.topCampaigns,
        revenueByChannelData: brandData.revenueByChannelData,
        channelEfficiencyData: brandData.channelEfficiencyData,

        // Real campaign insights from database
        campaignObjectiveData: brandData.campaignObjectiveData,
        monthlySpendData: brandData.monthlySpendData,
        productPerformanceData: brandData.productPerformanceData,
        funnelPerformanceData: brandData.funnelPerformanceData,

        // Social media performance
        socialMediaContentPerformanceMetrics:
          brandData.socialMediaContentPerformanceMetrics,
        socialMediaCompetitionMetrics: brandData.socialMediaCompetitionMetrics,
        socialMediaCompetitionChart: brandData.socialMediaCompetitionChart,

        // AI-generated insights
        alerts: brandData.alerts,
        recommendations: brandData.recommendations,

        // Additional context for better analysis
        organicSearchOverviewMetrics: brandData.organicSearchOverviewMetrics,
        socialListeningMetrics: brandData.socialListeningMetrics,
      };

      const systemInstruction = `You are an expert marketing analyst specializing in real-time campaign performance analysis for the luxury brand "${brand}". 

You have access to live campaign data from actual advertising platforms including spend amounts, lead generation, impressions, clicks, social media engagement, and competitor benchmarking. This is real campaign data, not mock data.

Your task is to analyze the provided real-time JSON data to answer the user's question with actionable insights. Provide:
1. A concise summary based on actual performance data
2. A single most important 'keyFinding' with real metrics (title, specific value, and its change/context)
3. Raw data that supports your analysis formatted as an array of arrays (first inner array MUST be table headers)
4. Two actionable recommendations based on real performance patterns
5. Three relevant follow-up questions for deeper analysis

Focus on real campaign performance, spend efficiency, lead generation effectiveness, and competitive positioning. Adhere strictly to the JSON schema for your response.`;

      const fullPrompt = `User question: "${prompt}"\n\nReal-time marketing data for ${brand}:\n${JSON.stringify(
        contextData,
        null,
        2
      )}`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A concise summary of the analysis based on the data.",
          },
          keyFinding: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "The title of the key finding.",
              },
              value: {
                type: Type.STRING,
                description: "The main value or metric of the finding.",
              },
              change: {
                type: Type.STRING,
                description:
                  "The change associated with the value (e.g., vs previous period).",
              },
            },
            required: ["title", "value", "change"],
          },
          data: {
            type: Type.ARRAY,
            description:
              "The subset of raw data that directly supports the summary and key finding, formatted as an array of arrays, where each inner array is a row. The first inner array MUST be the table headers.",
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["title", "description"],
            },
          },
          followUpQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          "summary",
          "keyFinding",
          "data",
          "recommendations",
          "followUpQuestions",
        ],
      };

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.2,
        },
      });

      const aiText = response.text.trim();
      const aiResponseData: AIResponse = JSON.parse(aiText);

      const finalConversation = [...newConversation];
      const lastIndex = finalConversation.length - 1;
      if (
        finalConversation[lastIndex] &&
        finalConversation[lastIndex].isLoading
      ) {
        finalConversation[lastIndex] = {
          sender: "ai",
          aiResponse: aiResponseData,
        };
      }

      setAiConversation(finalConversation);

      // Update the chat log with the final conversation
      if (chatId) {
        await supabase
          .from("chat_logs")
          .update({ conversation: finalConversation })
          .eq("id", chatId);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";

      const errorConversation = [...newConversation];
      const lastIndex = errorConversation.length - 1;
      if (
        errorConversation[lastIndex] &&
        errorConversation[lastIndex].isLoading
      ) {
        errorConversation[lastIndex] = {
          sender: "ai",
          error: `Sorry, I couldn't process that request. ${errorMessage}`,
        };
      }
      setAiConversation(errorConversation);

      if (chatId) {
        await supabase
          .from("chat_logs")
          .update({ conversation: errorConversation })
          .eq("id", chatId);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCloseAiSidebar = () => {
    setIsAiSidebarOpen(false);
    setAiConversation([]);
    setIsAiLoading(false);
    setCurrentChatId(null);
  };

  const handleBrandSelection = (brand: Brand) => {
    console.log(`🎯 App.tsx: handleBrandSelection called with brand: ${brand}`);
    const defaultBrandExists = !!localStorage.getItem("defaultBrand");
    console.log(`📂 App.tsx: Default brand exists: ${defaultBrandExists}`);

    console.log(`🔄 App.tsx: Setting selectedBrand to: ${brand}`);
    setSelectedBrand(brand);

    // Clear existing data to show loading state
    console.log(
      `🗑️ App.tsx: Clearing cached data for ${brand} to trigger fresh load`
    );
    setRealBrandData((prev) => {
      const newData = { ...prev };
      delete newData[brand]; // Remove cached data to trigger fresh load
      console.log(
        `📊 App.tsx: Data cache after clearing ${brand}:`,
        Object.keys(newData)
      );
      return newData;
    });

    if (!defaultBrandExists) {
      console.log(
        `📝 App.tsx: No default brand set, showing modal for ${brand}`
      );
      setShowSetDefaultModal(true);
    }
  };

  const handleSetDefaultConfirm = () => {
    if (selectedBrand) {
      localStorage.setItem("defaultBrand", selectedBrand);
    }
    setShowSetDefaultModal(false);
  };

  const handleSetDefaultClose = () => {
    setShowSetDefaultModal(false);
  };

  const renderMainContent = () => {
    const mainContentPadding = "p-4 sm:p-6 lg:p-8";

    if (activeView === "settings") {
      return <SettingsPage onLogout={onLogout} />;
    }

    if (activeView === "chatLogs") {
      return <ChatLogsPage />;
    }

    if (!selectedBrand) {
      const content = activeView.startsWith("report-") ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="bg-white p-12 rounded-2xl shadow-lg border border-gray-200/50">
            <h1 className="text-2xl font-bold text-gray-800">
              Select a Brand to View Report
            </h1>
            <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">
              Please select a brand from the dropdown menu in the header to view
              this report's data.
            </p>
          </div>
        </div>
      ) : (
        <WelcomeScreen />
      );
      return <div className={mainContentPadding}>{content}</div>;
    }

    const data = realBrandData[selectedBrand];
    const reportProps = { data, brandName: selectedBrand };

    let content;
    switch (activeView) {
      case "dashboard":
        content = (
          <Dashboard
            selectedBrand={selectedBrand}
            onAiPrompt={handleAiPrompt}
            isAiLoading={isAiLoading}
            aiConversation={aiConversation}
            data={realBrandData[selectedBrand]}
            isDataLoading={isDataLoading}
            onRefreshData={refreshCurrentBrandData}
          />
        );
        break;
      case "report-paid-media":
        content = <PaidMediaReport {...reportProps} />;
        break;
      case "report-organic-search":
        content = <OrganicSearchReport {...reportProps} />;
        break;
      case "report-social-media":
        content = <SocialMediaReport {...reportProps} />;
        break;
      case "report-ecommerce":
        content = <EcommerceReport {...reportProps} />;
        break;
      case "report-kol":
        content = <KOLReport {...reportProps} />;
        break;
      case "report-publishers":
        content = <PublishersReport {...reportProps} />;
        break;
      case "report-offline-media":
        content = <OfflineMediaReport {...reportProps} />;
        break;
      case "report-competitor-benchmarking":
        content = <CompetitorBenchmarkingReport {...reportProps} />;
        break;
      case "report-social-listening":
        content = <SocialListeningReport {...reportProps} />;
        break;
      default:
        content = (
          <Dashboard
            selectedBrand={selectedBrand}
            onAiPrompt={handleAiPrompt}
            isAiLoading={isAiLoading}
            aiConversation={aiConversation}
            data={realBrandData[selectedBrand]}
            isDataLoading={isDataLoading}
            onRefreshData={refreshCurrentBrandData}
          />
        );
    }

    return <div className={mainContentPadding}>{content}</div>;
  };

  return (
    <div className="flex h-screen bg-brand-bg font-sans text-gray-900">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
      />
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${
          isAiSidebarOpen ? "pr-[500px]" : "pr-0"
        }`}
      >
        {activeView !== "chatLogs" && activeView !== "settings" && (
          <Header
            onLogout={onLogout}
            selectedBrand={selectedBrand}
            onBrandSelect={handleBrandSelection}
          />
        )}
        <main className="flex-1 overflow-y-auto">{renderMainContent()}</main>
      </div>
      <AiSidebar
        isOpen={isAiSidebarOpen}
        onClose={handleCloseAiSidebar}
        conversation={aiConversation}
        onFollowUpSubmit={(prompt) => handleAiPrompt(prompt, selectedBrand!)}
        isLoading={isAiLoading}
      />
      {/* {!isHelpOpen && (
                 <button 
                    onClick={() => setIsHelpOpen(true)}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-30"
                    aria-label="Open help widget"
                >
                    <HelpCircleIcon className="w-8 h-8" />
                </button>
            )}
            <HelpWidget 
                isOpen={isHelpOpen} 
                onClose={() => setIsHelpOpen(false)} 
            /> */}
      {showSetDefaultModal && selectedBrand && (
        <SetDefaultBrandModal
          brandName={selectedBrand}
          onConfirm={handleSetDefaultConfirm}
          onClose={handleSetDefaultClose}
        />
      )}
    </div>
  );
};

export default App;
