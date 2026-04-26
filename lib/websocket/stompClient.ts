/**
 * stompClient.ts
 *
 * Lazy singleton STOMP client backed by SockJS.
 *
 * Backend WebSocket setup (WebSocketConfig.java):
 *   • Endpoint : /ws  (SockJS fallback enabled)
 *   • Subscribe: /topic/**
 *   • Send to  : /app/**
 *
 * This module is intentionally NOT a React hook — it is a plain TS singleton
 * so the single STOMP connection is shared across all components that subscribe.
 *
 * Usage:
 *   const unsub = subscribeToTopic("/topic/posts/123/likes", (body) => { ... });
 *   // later:
 *   unsub();
 */

import { Client, StompSubscription } from "@stomp/stompjs";

const WS_URL =
  (process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8080") + "/ws";

// ─── Internal state ───────────────────────────────────────────────────────────

let _client: Client | null = null;

/**
 * All registered handler sets, keyed by destination topic.
 * Multiple handlers can listen to the same topic (fan-out).
 */
const handlersByTopic = new Map<string, Set<(body: string) => void>>();

/**
 * Active STOMP subscriptions, keyed by destination topic.
 * A single STOMP subscription is shared by all JS handlers for that topic.
 */
const activeSubscriptions = new Map<string, StompSubscription>();

// ─── Client factory ───────────────────────────────────────────────────────────

function buildClient(): Client {
  const c = new Client({
    // SockJS must be required at call-time (browser-only)
    webSocketFactory: () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const SockJS = require("sockjs-client");
      return new SockJS(WS_URL);
    },
    reconnectDelay: 5000,

    onConnect: () => {
      // On every (re)connection re-subscribe all registered topics
      handlersByTopic.forEach((handlers, topic) => {
        if (handlers.size > 0 && !activeSubscriptions.has(topic)) {
          _doSubscribe(c, topic, handlers);
        }
      });
    },

    onDisconnect: () => {
      // Clear active subscriptions — they will be restored in onConnect
      activeSubscriptions.clear();
    },

    onStompError: (frame) => {
      console.error("[WS] STOMP error", frame.headers["message"], frame.body);
    },
  });

  return c;
}

/** Actually subscribe one STOMP topic and fanout to all JS handlers. */
function _doSubscribe(
  client: Client,
  topic: string,
  handlers: Set<(body: string) => void>
) {
  const sub = client.subscribe(topic, (msg) => {
    handlers.forEach((h) => h(msg.body));
  });
  activeSubscriptions.set(topic, sub);
}

function getClient(): Client {
  if (!_client) {
    _client = buildClient();
  }
  return _client;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Subscribe to a STOMP topic.
 *
 * • If the client is already connected, the STOMP subscription is made immediately.
 * • If not yet connected, the client is activated and the subscription is created
 *   automatically inside `onConnect`.
 * • Multiple callers can subscribe to the same topic — they all receive every message.
 *
 * Returns an `unsubscribe` function. Call it when the component unmounts.
 */
export function subscribeToTopic(
  topic: string,
  handler: (body: string) => void
): () => void {
  const client = getClient();

  // Register handler in the fan-out set for this topic
  if (!handlersByTopic.has(topic)) {
    handlersByTopic.set(topic, new Set());
  }
  handlersByTopic.get(topic)!.add(handler);

  // If already connected and no active STOMP sub for this topic yet, create one
  if (client.connected && !activeSubscriptions.has(topic)) {
    _doSubscribe(client, topic, handlersByTopic.get(topic)!);
  }

  // Activate the connection if it hasn't been started yet
  if (!client.active) {
    client.activate();
  }

  // Return cleanup
  return () => {
    const handlers = handlersByTopic.get(topic);
    if (!handlers) return;

    handlers.delete(handler);

    // When the last handler is removed, tear down the STOMP subscription too
    if (handlers.size === 0) {
      activeSubscriptions.get(topic)?.unsubscribe();
      activeSubscriptions.delete(topic);
      handlersByTopic.delete(topic);
    }
  };
}
