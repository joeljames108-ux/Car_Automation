// ============================================================================
// APEX AI PROMPT STUDIO — Conversational Vehicle Configuration
// ============================================================================
// A chat interface where you describe a vehicle in natural language and the AI
// automatically configures every tab and studio. Features:
//   - Message bubbles with markdown-like formatting
//   - Inline action cards with Apply/Reject per action
//   - Batch Apply All button
//   - Quick-reply chips for follow-up questions
//   - Quick prompt starters
//   - Live telemetry mini-dashboard
//   - Session conversation memory
// ============================================================================

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Bot, Send, Check, X, RotateCcw, Zap, Sparkles, Target,
  ChevronRight, Volume2, Undo2,
} from "lucide-react";
import { useDesign } from "../../state/DesignContext";
import { useGuidedEngineeringStore } from "../../state/guidedEngineeringStore";
import { generateAIResponse, parseUserIntent, type ParsedAction, type AIResponse } from "../../sim/ai/apexPromptEngine";
import { AI_PRESET_LIBRARY } from "./AIEngineeringPresets";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";
import { createV12Hybrid1000HpDesign, createBaseDesign } from "../../sim/vehiclePresets";
import { createGT3SpecRDesign } from "../../sim/gt3SpecRDesign";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  actions?: ParsedAction[];
  followUp?: string;
  timestamp: string;
  applied?: boolean;
  isQueryAnswer?: boolean;
}

const QUICK_PROMPTS = [
  { label: "🏎️ V8 Twin Turbo Track Monster", prompt: "Build me a V8 twin turbo AWD track car with 700hp, carbon tub, carbon ceramic brakes, slick tires" },
  { label: "⚡ 1000hp V12 Hybrid Valkyrie", prompt: "Load the Valkyrie V12 hybrid 1000hp preset" },
  { label: "👑 Luxury Electric Grand Tourer", prompt: "I want a luxury electric grand tourer with leather interior, quiet cabin, AWD" },
  { label: "💰 Budget Daily Under $30k", prompt: "Budget daily driver, I4 turbo, FWD, steel unibody, all-season tires, under $30k" },
  { label: "🌬️ High Downforce Monaco Spec", prompt: "Monaco high downforce setup, wing angle 20, ground effect, aggressive splitter" },
  { label: "🔧 What boost is safe?", prompt: "What boost pressure should I run for a reliable 700hp?" },
];

const QUICK_REPLIES: Record<string, string[]> = {
  "What aspiration type?": ["Turbo", "Twin-turbo", "Supercharger", "Naturally aspirated"],
  "What drivetrain?": ["AWD", "RWD", "FWD"],
  "What brakes?": ["Carbon ceramic", "Steel"],
  "Want to specify interior?": ["Carbon bucket seats", "Leather interior", "Skip interior for now"],
};

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function ApexAIPromptStudio() {
  const { design, sim, updateEngine, updateVehicle, updateAero, updateAeroResearch, updateExterior, updateInterior, setCarConcept, setDesign } = useDesign();
  const { markStageComplete, setActiveWorkflowStage } = useGuidedEngineeringStore();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "**Welcome to Apex AI Prompt Studio!** 🧠\n\nDescribe your dream vehicle and I'll configure every system automatically. I understand:\n\n• **Engine**: layout, aspiration, power, hybrid/EV\n• **Vehicle**: chassis, drivetrain, transmission, brakes\n• **Aero**: wing angle, diffuser, downforce packages\n• **Interior**: seats, materials, roll cage\n• **Exterior**: paint color, body kit, spoiler\n\nOr ask me engineering questions — I know every parameter in detail.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Apply a single action ---
  const applyAction = (action: ParsedAction) => {
    playHMIClickSound();
    const { changes, type } = action;

    // Handle presets specially
    if (type === "preset") {
      const presetId = changes.preset as string;
      const preset = AI_PRESET_LIBRARY.find((p) => p.id === presetId);
      if (preset) {
        setDesign(preset.generator());
        setCarConcept(preset.targetConcept);
      }
      return;
    }

    if (type === "concept") {
      setCarConcept(changes.concept as any);
      return;
    }

    switch (type) {
      case "engine":
        updateEngine(changes as any);
        break;
      case "vehicle":
        updateVehicle(changes as any);
        break;
      case "aero":
        updateAero(changes as any);
        break;
      case "aeroResearch":
        updateAeroResearch(changes as any);
        break;
      case "interior":
        updateInterior(changes as any);
        break;
      case "exterior":
        updateExterior(changes as any);
        break;
    }
  };

  // --- Apply all actions from a message ---
  const applyAll = (msg: ChatMessage) => {
    if (!msg.actions) return;
    msg.actions.forEach((a) => applyAction(a));
    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, applied: true } : m));
  };

  // --- Send a message ---
  const sendMessage = (text?: string) => {
    const query = text || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!text) setInput("");
    setIsThinking(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response: AIResponse = generateAIResponse(query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response.message,
        actions: response.actions.length > 0 ? response.actions : undefined,
        followUp: response.followUp,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isQueryAnswer: response.isQueryAnswer,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);

      // Auto-apply high-confidence actions
      if (response.actions.length > 0 && response.actions.every((a) => a.confidence >= 0.9)) {
        setTimeout(() => {
          applyAll(aiMsg);
        }, 1500);
      }
    }, 600);
  };

  // --- Undo last applied message ---
  const handleUndo = () => {
    // Find last applied message and reset
    const lastApplied = [...messages].reverse().find((m) => m.applied && m.actions);
    if (lastApplied && lastApplied.actions) {
      setMessages((prev) => prev.map((m) => m.id === lastApplied.id ? { ...m, applied: false } : m));
    }
  };

  // --- Live telemetry preview ---
  const liveStats = useMemo(() => ({
    hp: Math.round(sim.peakPower),
    weight: Math.round(sim.weight),
    drag: sim.dragCoeff.toFixed(3),
    zeroTo100: sim.accel0_100?.toFixed(1) || "—",
    downforce: Math.round(sim.downforce),
    cost: sim.totalCost,
    topSpeed: Math.round(sim.topSpeed),
  }), [sim]);

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[500px] rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 shadow-2xl overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0b0f19] via-[#111625] to-[#0b0f19] border-b border-amber-500/30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider uppercase text-slate-100">AI Prompt Studio</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> ONLINE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Describe → Configure → Build. Words become engineering.</p>
          </div>
        </div>

        {/* Live Stats Bar */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-amber-300">{liveStats.hp} HP</span>
          <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-cyan-300">{liveStats.weight} kg</span>
          <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-emerald-300">Cd {liveStats.drag}</span>
          <span className="px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-purple-300">0-100: {liveStats.zeroTo100}s</span>
          <button onClick={handleUndo} className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all cursor-pointer" title="Undo last change">
            <Undo2 size={13} />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            {/* Message bubble */}
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
              msg.sender === "user"
                ? "bg-amber-500 text-slate-950 font-medium rounded-br-md"
                : msg.isQueryAnswer
                ? "bg-slate-900 border border-cyan-500/30 text-slate-200 rounded-bl-md"
                : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-md"
            }`}>
              {/* Simple markdown rendering */}
              {msg.text.split("\n").map((line, i) => {
                if (line.startsWith("• ")) return <div key={i} className="ml-2">• {line.slice(2)}</div>;
                if (line.startsWith("**") && line.endsWith("**")) return <div key={i} className="font-bold mt-1">{line.replace(/\*\*/g, "")}</div>;
                if (line === "") return <div key={i} className="h-2" />;
                return <div key={i}>{line.replace(/\*\*(.*?)\*\*/g, (_, t) => t)}</div>;
              })}
            </div>
            <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">{msg.timestamp}</span>

            {/* Action cards */}
            {msg.actions && msg.actions.length > 0 && (
              <div className="mt-2 space-y-1.5 max-w-[85%]">
                {msg.actions.map((action, idx) => (
                  <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-mono transition-all ${
                    msg.applied
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : "bg-slate-900/80 border-slate-700 text-slate-300 hover:border-amber-500/40"
                  }`}>
                    <span>{action.icon}</span>
                    <span className="flex-1">{action.description}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${action.confidence >= 0.9 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {Math.round(action.confidence * 100)}%
                    </span>
                    {msg.applied ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <button
                        onClick={() => {
                          applyAction(action);
                          setMessages((prev) => prev.map((m) =>
                            m.id === msg.id ? { ...m, actions: m.actions?.map((a, i) => i === idx ? { ...a, confidence: 1 } : a) } : m
                          ));
                        }}
                        className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                ))}

                {/* Batch Apply */}
                {!msg.applied && msg.actions.length > 1 && (
                  <button
                    onClick={() => applyAll(msg)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[11px] font-black uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition-all shadow-md cursor-pointer"
                  >
                    <Check size={12} strokeWidth={3} />
                    Apply All ({msg.actions.length} changes)
                  </button>
                )}
              </div>
            )}

            {/* Follow-up chips */}
            {msg.followUp && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                <span className="text-[10px] text-slate-500 font-mono self-center mr-1">{msg.followUp}</span>
                {(QUICK_REPLIES[msg.followUp] || ["Yes", "No, skip"]).map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      playHMIClickSound();
                      sendMessage(chip);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[10px] font-mono text-slate-300 hover:border-amber-500/40 hover:text-amber-300 transition-all cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex items-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Prompt Chips ── */}
      <div className="px-4 py-2 border-t border-slate-800 overflow-x-auto flex gap-1.5 scrollbar-none">
        <span className="text-[9px] font-mono text-amber-400 font-bold uppercase shrink-0 self-center">PROMPTS:</span>
        {QUICK_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              playHMIClickSound();
              sendMessage(p.prompt);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/60 text-[10px] font-mono text-slate-400 hover:border-amber-500/40 hover:text-amber-300 whitespace-nowrap transition-all cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Input ── */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Describe your vehicle or ask an engineering question..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-mono"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isThinking}
            className="p-2.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
