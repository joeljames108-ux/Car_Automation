// ============================================================================
// RACE ENGINEERING SUITE — RACE ENGINEER CHAT
// ============================================================================
// Interactive chat interface for communicating with the AI race engineer.
// Displays real-time messages, allows user queries, and provides tactical
// advice during race simulation with priority-based message styling.
// ============================================================================

import React, { useState, useRef, useEffect, memo } from 'react';
import { RaceEngineerAI, EngineerMessage } from '../../sim/ai/raceEngineerAI';
import { playHMIClickSound } from '../../utils/hmiSoundSynth';

interface RaceEngineerChatProps {
  engineer: RaceEngineerAI;
  messages: EngineerMessage[];
  currentLap: number;
  totalLaps: number;
}

interface ChatMessage {
  id: string;
  sender: 'engineer' | 'driver';
  text: string;
  timestamp: number;
  category?: EngineerMessage['category'];
  priority?: EngineerMessage['priority'];
}

export const RaceEngineerChat: React.FC<RaceEngineerChatProps> = memo(function RaceEngineerChat({
  engineer, messages, currentLap, totalLaps,
}) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync engineer messages to chat
  useEffect(() => {
    const newEngineerMsgs = messages.filter(m =>
      !chatMessages.some(cm => cm.id === m.id)
    ).map(m => ({
      id: m.id,
      sender: 'engineer' as const,
      text: m.message,
      timestamp: m.timestamp,
      category: m.category,
      priority: m.priority,
    }));

    if (newEngineerMsgs.length > 0) {
      setChatMessages(prev => [...prev, ...newEngineerMsgs]);
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const quickCommands = [
    { label: 'Tire status', query: 'What is the tire condition?' },
    { label: 'Gap report', query: 'What are the gaps?' },
    { label: 'Pit window', query: 'When should we pit?' },
    { label: 'Fuel status', query: 'How is our fuel?' },
    { label: 'Weather update', query: 'What is the weather outlook?' },
    { label: 'Push mode', query: 'Should we push harder?' },
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    playHMIClickSound();

    const driverMsg: ChatMessage = {
      id: `driver_${Date.now()}`,
      sender: 'driver',
      text: input.trim(),
      timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev, driverMsg]);
    setInput('');

    // Simulate engineer response
    setIsTyping(true);
    setTimeout(() => {
      const response = generateEngineerResponse(input.trim(), currentLap, totalLaps);
      const engineerMsg: ChatMessage = {
        id: `eng_${Date.now()}`,
        sender: 'engineer',
        text: response,
        timestamp: Date.now(),
        category: 'info',
        priority: 'medium',
      };
      setChatMessages(prev => [...prev, engineerMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleQuickCommand = (query: string) => {
    playHMIClickSound();
    setInput(query);
    setTimeout(() => {
      const driverMsg: ChatMessage = {
        id: `driver_${Date.now()}`,
        sender: 'driver',
        text: query,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, driverMsg]);
      setIsTyping(true);
      setTimeout(() => {
        const response = generateEngineerResponse(query, currentLap, totalLaps);
        setChatMessages(prev => [...prev, {
          id: `eng_${Date.now()}`,
          sender: 'engineer',
          text: response,
          timestamp: Date.now(),
          category: 'info',
          priority: 'medium',
        }]);
        setIsTyping(false);
      }, 800 + Math.random() * 800);
      setInput('');
    }, 100);
  };

  return (
    <div className="bg-amber-900/40 rounded-2xl border border-amber-800/30 flex flex-col" style={{ height: '500px' }}>
      {/* Header */}
      <div className="p-3 border-b border-amber-800/30 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-amber-950 font-bold text-sm">RE</div>
        <div>
          <h3 className="text-amber-100 text-sm font-bold">Race Engineer</h3>
          <p className="text-amber-400/60 text-xs">Lap {currentLap}/{totalLaps}</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs">ONLINE</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Welcome message */}
        {chatMessages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">{'\u260E\uFE0F'}</span>
            </div>
            <p className="text-amber-300 text-sm font-bold">Race Engineer Online</p>
            <p className="text-amber-400/60 text-xs mt-1">I'm here to help you go faster. Ask me anything about strategy, tires, fuel, or race conditions.</p>
          </div>
        )}

        {chatMessages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'driver' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
              msg.sender === 'driver'
                ? 'bg-amber-500/30 text-amber-100 rounded-br-sm'
                : msg.priority === 'critical' ? 'bg-red-500/20 text-red-200 border border-red-500/30 rounded-bl-sm'
                : msg.priority === 'high' ? 'bg-orange-500/15 text-orange-200 border border-orange-500/20 rounded-bl-sm'
                : 'bg-amber-950/60 text-amber-200 rounded-bl-sm'
            }`}>
              {msg.sender === 'engineer' && msg.category && (
                <span className={`text-xs font-bold uppercase block mb-0.5 ${
                  msg.category === 'strategy' ? 'text-blue-400' :
                  msg.category === 'tire' ? 'text-yellow-400' :
                  msg.category === 'fuel' ? 'text-green-400' :
                  msg.category === 'weather' ? 'text-cyan-400' : 'text-amber-400'
                }`}>{msg.category}</span>
              )}
              <p className="text-sm">{msg.text}</p>
              <span className="text-xs opacity-40 block mt-0.5">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-amber-950/60 rounded-2xl rounded-bl-sm px-3 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick commands */}
      <div className="px-3 py-2 border-t border-amber-800/20">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {quickCommands.map((cmd, i) => (
            <button key={i} onClick={() => handleQuickCommand(cmd.query)}
              className="px-2 py-1 rounded-lg bg-amber-950/40 text-amber-400/70 text-xs hover:bg-amber-900/40 hover:text-amber-200 transition-all cursor-pointer">
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-amber-800/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask your race engineer..."
            className="flex-1 bg-amber-950/40 border border-amber-800/30 rounded-xl px-3 py-2 text-sm text-amber-100 placeholder-amber-600 outline-none focus:border-amber-500/50"
          />
          <button onClick={handleSend}
            className="px-4 py-2 bg-amber-500 text-amber-950 rounded-xl text-sm font-bold hover:bg-amber-400 transition-all cursor-pointer">
            {'\u27A4'}
          </button>
        </div>
      </div>
    </div>
  );
});

function generateEngineerResponse(query: string, currentLap: number, totalLaps: number): string {
  const q = query.toLowerCase();
  if (q.includes('tire') || q.includes('tyre')) {
    return `Tires are in good shape. ${currentLap > totalLaps * 0.6 ? 'Wear is building, consider boxing soon.' : 'We have plenty of life left. Keep pushing.'} Current compound is performing within expected parameters.`;
  }
  if (q.includes('gap') || q.includes('position')) {
    return `Gap to car ahead is ${(1.2 + Math.random() * 2).toFixed(1)}s. You're in the DRS window. Gap behind is ${(2.5 + Math.random() * 3).toFixed(1)}s. Comfortable buffer.`;
  }
  if (q.includes('pit') || q.includes('stop')) {
    const optimalLap = Math.floor(totalLaps * 0.45);
    return `Optimal pit window is around lap ${optimalLap}. Undercut is available if you box early. Current tire life supports ${Math.max(1, totalLaps - currentLap - 5)} more laps.`;
  }
  if (q.includes('fuel') || q.includes('save')) {
    const remaining = Math.max(0, totalLaps - currentLap);
    return `Fuel is ${remaining > totalLaps * 0.3 ? 'comfortable' : 'tight'}. We have ${remaining} laps to go. ${remaining < totalLaps * 0.2 ? 'Switch to lean mixture to conserve.' : 'You can push in standard mode.'}`;
  }
  if (q.includes('weather') || q.includes('rain')) {
    return `Weather looks ${Math.random() > 0.5 ? 'stable for the next 20 minutes' : 'like rain could arrive in the next 10-15 minutes'}. We're monitoring conditions closely. Recommend staying on current compound for now.`;
  }
  if (q.includes('push') || q.includes('fast') || q.includes('attack')) {
    return `Copy. Push push push! Your sector 3 was strong last lap. Attack into Turn 1, you have better braking performance. Keep it clean and we'll gain time.`;
  }
  return `Copy, I'm looking into that. Current lap ${currentLap}/${totalLaps}. Everything is looking good from our side. Keep focusing on your markers.`;
}
