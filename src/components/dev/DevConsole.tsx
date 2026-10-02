import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Terminal,
  X,
  Trash2,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
} from "lucide-react";
import {
  useDevConsoleStore,
  getCommandRegistry,
  type ConsoleEntry,
} from "../../state/devConsoleStore";

export const DevConsole: React.FC = () => {
  const { isOpen, close, output, executeCommand, clearOutput, navigateHistory } =
    useDevConsoleStore();

  const [inputVal, setInputVal] = useState("");
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Available command names for autocomplete
  const allCommands = useMemo(() => {
    return Array.from(getCommandRegistry().values()).map((cmd) => ({
      name: cmd.name,
      description: cmd.description,
      usage: cmd.usage,
    }));
  }, []);

  // Filtered suggestions based on current input prefix
  const suggestions = useMemo(() => {
    const trimmed = inputVal.trimStart();
    if (!trimmed) return [];
    const prefix = trimmed.split(/\s+/)[0].toLowerCase();
    return allCommands.filter((c) => c.name.toLowerCase().startsWith(prefix)).slice(0, 6);
  }, [inputVal, allCommands]);

  // Focus input automatically when console opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Auto-scroll output container on new entries
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [output, isOpen]);

  // Reset selected suggestion when list changes
  useEffect(() => {
    setSelectedSuggestionIndex(0);
  }, [suggestions.length]);

  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape or F9 to close console
    if (e.key === "Escape" || e.key === "F9") {
      e.preventDefault();
      close();
      return;
    }

    // Up Arrow for history or suggestions
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length > 0 && e.altKey) {
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      } else {
        const prevCmd = navigateHistory("up");
        if (prevCmd !== undefined) {
          setInputVal(prevCmd);
        }
      }
      return;
    }

    // Down Arrow for history or suggestions
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length > 0 && e.altKey) {
        setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      } else {
        const nextCmd = navigateHistory("down");
        setInputVal(nextCmd);
      }
      return;
    }

    // Tab for autocomplete
    if (e.key === "Tab") {
      e.preventDefault();
      if (suggestions.length > 0) {
        const target = suggestions[selectedSuggestionIndex] || suggestions[0];
        // If args were already typed, preserve them or fill command
        const parts = inputVal.split(/\s+/);
        if (parts.length > 1) {
          setInputVal(`${target.name} ${parts.slice(1).join(" ")}`);
        } else {
          setInputVal(`${target.name} `);
        }
      }
      return;
    }

    // Enter to submit
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = inputVal.trim();
      if (trimmed) {
        executeCommand(trimmed);
        setInputVal("");
      }
    }
  };

  const applySuggestion = (cmdName: string) => {
    setInputVal(`${cmdName} `);
    inputRef.current?.focus();
  };

  const renderEntry = (entry: ConsoleEntry) => {
    const timeStr = new Date(entry.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    switch (entry.type) {
      case "input":
        return (
          <div key={entry.id} className="flex items-start gap-2 py-0.5 text-amber-300 font-mono text-xs">
            <span className="text-slate-600 select-none text-[10px] pt-0.5">{timeStr}</span>
            <span className="text-amber-500 font-bold select-none">&gt;</span>
            <span className="font-semibold text-amber-200">{entry.message}</span>
          </div>
        );
      case "success":
        return (
          <div key={entry.id} className="flex items-start gap-2 py-0.5 text-emerald-400 font-mono text-xs">
            <span className="text-slate-600 select-none text-[10px] pt-0.5">{timeStr}</span>
            <span className="text-emerald-500 select-none">✓</span>
            <span className="whitespace-pre-wrap leading-relaxed">{entry.message}</span>
          </div>
        );
      case "error":
        return (
          <div key={entry.id} className="flex items-start gap-2 py-1 text-rose-300 font-mono text-xs bg-rose-950/30 px-2 rounded border border-rose-500/20 my-0.5">
            <span className="text-rose-500 select-none text-[10px] pt-0.5">{timeStr}</span>
            <span className="text-rose-400 font-bold select-none">✕</span>
            <span className="whitespace-pre-wrap leading-relaxed">{entry.message}</span>
          </div>
        );
      case "warn":
        return (
          <div key={entry.id} className="flex items-start gap-2 py-0.5 text-amber-300 font-mono text-xs">
            <span className="text-slate-600 select-none text-[10px] pt-0.5">{timeStr}</span>
            <span className="text-amber-400 font-bold select-none">⚠</span>
            <span className="whitespace-pre-wrap leading-relaxed">{entry.message}</span>
          </div>
        );
      case "system":
        return (
          <div key={entry.id} className="flex items-start gap-2 py-0.5 text-cyan-300/90 font-mono text-xs font-medium">
            <span className="text-slate-600 select-none text-[10px] pt-0.5">{timeStr}</span>
            <span className="whitespace-pre-wrap leading-relaxed">{entry.message}</span>
          </div>
        );
      default:
        return (
          <div key={entry.id} className="flex items-start gap-2 py-0.5 text-slate-300 font-mono text-xs">
            <span className="text-slate-600 select-none text-[10px] pt-0.5">{timeStr}</span>
            <span className="whitespace-pre-wrap leading-relaxed text-slate-300">{entry.message}</span>
          </div>
        );
    }
  };

  return (
    <aside
      aria-label="Developer Command Console"
      className="fixed bottom-0 left-0 right-0 h-[420px] max-h-[50vh] z-[10000] bg-[#090d16]/95 backdrop-blur-2xl border-t border-amber-500/40 shadow-2xl flex flex-col font-mono text-xs text-slate-200 select-text animate-in slide-in-from-bottom duration-200"
    >
      {/* Console Title Bar */}
      <div className="h-9 px-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-b border-white/10 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-amber-400" />
          <span className="font-bold text-slate-100 tracking-wider text-xs">
            APEX DEVELOPER CONSOLE
          </span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/30">
            F9
          </span>
        </div>

        {/* Quick chip helpers */}
        <div className="hidden lg:flex items-center gap-1 text-[11px]">
          <button
            onClick={() => executeCommand("help")}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            help
          </button>
          <button
            onClick={() => executeCommand("unlock.all")}
            className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 transition-colors border border-emerald-500/20"
          >
            unlock.all
          </button>
          <button
            onClick={() => executeCommand("lock.all")}
            className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 transition-colors border border-rose-500/20"
          >
            lock.all
          </button>
          <button
            onClick={() => executeCommand("cash.add 50000000")}
            className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 transition-colors border border-amber-500/20"
          >
            +$50M
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={clearOutput}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear console output (clear)"
            aria-label="Clear Console"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={close}
            className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
            title="Close console (F9 / Esc)"
            aria-label="Close Console"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Output Stream */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1 font-mono text-xs bg-black/40 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {output.map(renderEntry)}
      </div>

      {/* Autocomplete Popup */}
      {suggestions.length > 0 && (
        <div className="px-4 py-1.5 bg-slate-900/95 border-t border-amber-500/20 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            Tab Complete:
          </span>
          {suggestions.map((s, idx) => (
            <button
              key={s.name}
              onClick={() => applySuggestion(s.name)}
              className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                idx === selectedSuggestionIndex
                  ? "bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm"
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
              }`}
            >
              <span>{s.name}</span>
              <span className="text-[10px] opacity-70">({s.description.slice(0, 30)})</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="px-4 py-2 bg-slate-950 border-t border-white/10 flex items-center gap-2">
        <span className="text-amber-400 font-bold flex items-center select-none text-xs">
          apex:dev<ChevronRight size={14} className="text-amber-500" />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Type a command (e.g. "help", "time.set 1985", "unlock.all"). Tab completes.'
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 font-mono text-xs focus:outline-none caret-amber-400"
          spellCheck={false}
          autoComplete="off"
        />
        <div className="flex items-center gap-2 text-[10px] text-slate-500 select-none">
          <span>Tab: complete</span>
          <span>↑↓: history</span>
          <button
            onClick={() => {
              if (inputVal.trim()) {
                executeCommand(inputVal.trim());
                setInputVal("");
              }
            }}
            className="p-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
            title="Execute (Enter)"
            aria-label="Execute command"
          >
            <CornerDownLeft size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
};
