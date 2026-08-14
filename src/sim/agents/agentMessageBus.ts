// ===================================================================
// AGENT MESSAGE BUS — Decoupled Inter-Agent Communication Engine
// ===================================================================
// Supports direct messaging, topic subscriptions (e.g. "agent.powertrain.*"),
// and system-wide broadcast alerts across all autonomous engineering agents.
// ===================================================================

export type MessagePriority = "low" | "medium" | "high" | "critical";
export type MessageType = "finding" | "recommendation" | "alert" | "request" | "ack";

export interface AgentMessage<T = any> {
  id: string;
  fromAgentId: string;
  toAgentId: string | "broadcast";
  type: MessageType;
  priority: MessagePriority;
  topic: string; // e.g., "powertrain.knock", "aero.balance", "system.alert"
  payload: T;
  timestamp: number;
}

export type MessageHandler = (message: AgentMessage) => void;

export class AgentMessageBus {
  private static instance: AgentMessageBus;
  private subscribers: Map<string, Set<MessageHandler>> = new Map(); // topic -> handlers
  private messageHistory: AgentMessage[] = [];
  private maxHistorySize = 200;

  private constructor() {}

  public static getInstance(): AgentMessageBus {
    if (!AgentMessageBus.instance) {
      AgentMessageBus.instance = new AgentMessageBus();
    }
    return AgentMessageBus.instance;
  }

  /**
   * Subscribe to a specific topic or wildcard topic pattern (e.g., "powertrain.*", "*")
   */
  public subscribe(topic: string, handler: MessageHandler): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(handler);

    // Return unsubscribe callback
    return () => {
      const topicSubscribers = this.subscribers.get(topic);
      if (topicSubscribers) {
        topicSubscribers.delete(handler);
        if (topicSubscribers.size === 0) {
          this.subscribers.delete(topic);
        }
      }
    };
  }

  /**
   * Publish a message to target agent(s) or topic subscribers
   */
  public publish(message: AgentMessage): void {
    this.messageHistory.push(message);
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }

    // Deliver to exact topic subscribers & pattern matches
    this.subscribers.forEach((handlers, pattern) => {
      if (this.matchesTopic(pattern, message.topic)) {
        handlers.forEach((handler) => {
          try {
            handler(message);
          } catch (err) {
            console.error(`[AgentMessageBus] Error executing subscriber for pattern '${pattern}':`, err);
          }
        });
      }
    });
  }

  /**
   * Matches wildcard topics like "powertrain.*", "aero.balance", "*"
   */
  private matchesTopic(pattern: string, topic: string): boolean {
    if (pattern === "*" || pattern === topic) return true;
    if (pattern.endsWith(".*")) {
      const prefix = pattern.slice(0, -2);
      return topic.startsWith(prefix);
    }
    return false;
  }

  /**
   * Fetch recent message history (optionally filtered by agent or topic)
   */
  public getHistory(agentId?: string, limit = 50): AgentMessage[] {
    let filtered = this.messageHistory;
    if (agentId) {
      filtered = filtered.filter(
        (m) => m.fromAgentId === agentId || m.toAgentId === agentId || m.toAgentId === "broadcast"
      );
    }
    return filtered.slice(-limit);
  }

  /**
   * Clear message history for testing/resetting state
   */
  public clear(): void {
    this.messageHistory = [];
    this.subscribers.clear();
  }
}
