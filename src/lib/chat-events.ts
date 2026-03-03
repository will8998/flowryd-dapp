import { EventEmitter } from 'events';

/**
 * In-memory event bus for real-time chat.
 * POST /messages emits here → SSE streams pick up instantly (no polling).
 *
 * Events:
 *   `deal:{dealId}:message`  — new message object
 *   `deal:{dealId}:typing`   — { userId, displayName, isTyping }
 *   `deal:{dealId}:presence` — { userId, displayName, status: 'online'|'offline' }
 */
class ChatEventBus extends EventEmitter {
  constructor() {
    super();
    // Allow many concurrent SSE connections per deal
    this.setMaxListeners(500);
  }
}

// Singleton — shared across all API routes in the same Node.js process
const chatBus = new ChatEventBus();
export default chatBus;
