import Vapi from '@vapi-ai/web';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface UserContext {
  name: string;
  email: string;
  issue: string;
}

export type VapiEventCallback = (data: any) => void;

export class VapiClient {
  private vapi: Vapi | null = null;
  private publicKey: string;
  private assistantId: string;
  private eventCallbacks: Map<string, VapiEventCallback[]> = new Map();

  constructor() {
    this.publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';
    this.assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '';

    if (!this.publicKey || !this.assistantId) {
      console.warn('[VAPI Warning] Missing credentials. Please set NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID');
    }
  }

  initialize() {
    if (this.vapi) {
      console.log('[VAPI Event: already-initialized]');
      return;
    }

    console.log('[VAPI Event: initializing]', { publicKey: this.publicKey ? '***' : 'missing' });

    this.vapi = new Vapi(this.publicKey);
    this.setupEventListeners();

    console.log('[VAPI Event: initialized]');
  }

  private setupEventListeners() {
    if (!this.vapi) return;

    // Call lifecycle events
    this.vapi.on('call-start', ((data: any) => {
      console.log('[VAPI Event: call-start]', data);
      this.emit('call-start', data);
    }) as any);

    this.vapi.on('call-end', ((data: any) => {
      console.log('[VAPI Event: call-end]', data);
      this.emit('call-end', data);
    }) as any);

    // Speech events
    this.vapi.on('speech-start', ((data: any) => {
      console.log('[VAPI Event: speech-start]', data);
      this.emit('speech-start', data);
    }) as any);

    this.vapi.on('speech-end', ((data: any) => {
      console.log('[VAPI Event: speech-end]', data);
      this.emit('speech-end', data);
    }) as any);

    // Message events (includes transcripts)
    this.vapi.on('message', ((message: any) => {
      console.log('[VAPI Event: message]', message);

      // Log specific message types
      if (message.type === 'transcript') {
        console.log(`[VAPI Event: transcript] ${message.role}: ${message.transcript || message.transcriptType}`);
      } else if (message.type === 'function-call') {
        console.log('[VAPI Event: function-call]', message);
      } else if (message.type === 'conversation-update') {
        console.log('[VAPI Event: conversation-update]', message);
      }

      this.emit('message', message);
    }) as any);

    // Volume level events
    this.vapi.on('volume-level', ((data: any) => {
      // Don't log volume events as they're too frequent
      this.emit('volume-level', data);
    }) as any);

    // Error events
    this.vapi.on('error', ((error: any) => {
      console.error('[VAPI Event: error]', error);
      this.emit('error', error);
    }) as any);
  }

  async startVoiceCall(userContext: UserContext) {
    if (!this.vapi) {
      throw new Error('[VAPI Error] Client not initialized');
    }

    console.log('[VAPI Event: starting-voice-call]', { userContext });

    try {
      // Start call with user context passed as assistant overrides
      await this.vapi.start(this.assistantId, {
        variableValues: {
          userName: userContext.name,
          userEmail: userContext.email,
          userIssue: userContext.issue,
        }
      });

      console.log('[VAPI Event: voice-call-started]');
    } catch (error) {
      console.error('[VAPI Error: start-voice-call-failed]', error);
      throw error;
    }
  }

  async startChat(userContext: UserContext) {
    if (!this.vapi) {
      throw new Error('[VAPI Error] Client not initialized');
    }

    console.log('[VAPI Event: starting-chat]', { userContext });

    try {
      // Start the assistant in chat mode
      await this.vapi.start(this.assistantId, {
        variableValues: {
          userName: userContext.name,
          userEmail: userContext.email,
          userIssue: userContext.issue,
        }
      });

      // Send initial context message
      const initialMessage = `User ${userContext.name} (${userContext.email}) needs help with: ${userContext.issue}`;
      console.log('[VAPI Event: sending-initial-context]', initialMessage);

      this.vapi.send({
        type: 'add-message',
        message: {
          role: 'system',
          content: initialMessage,
        }
      });

      console.log('[VAPI Event: chat-started]');
    } catch (error) {
      console.error('[VAPI Error: start-chat-failed]', error);
      throw error;
    }
  }

  sendMessage(content: string) {
    if (!this.vapi) {
      throw new Error('[VAPI Error] Client not initialized');
    }

    console.log('[VAPI Event: sending-message]', { content });

    try {
      this.vapi.send({
        type: 'add-message',
        message: {
          role: 'user',
          content,
        }
      });

      console.log('[VAPI Event: message-sent]');
    } catch (error) {
      console.error('[VAPI Error: send-message-failed]', error);
      throw error;
    }
  }

  stop() {
    if (!this.vapi) {
      console.warn('[VAPI Warning] Client not initialized');
      return;
    }

    console.log('[VAPI Event: stopping]');

    try {
      this.vapi.stop();
      console.log('[VAPI Event: stopped]');
    } catch (error) {
      console.error('[VAPI Error: stop-failed]', error);
      throw error;
    }
  }

  setMuted(muted: boolean) {
    if (!this.vapi) {
      console.warn('[VAPI Warning] Client not initialized');
      return;
    }

    console.log('[VAPI Event: set-muted]', { muted });

    try {
      this.vapi.setMuted(muted);
    } catch (error) {
      console.error('[VAPI Error: set-muted-failed]', error);
      throw error;
    }
  }

  isMuted(): boolean {
    if (!this.vapi) {
      return false;
    }
    return this.vapi.isMuted();
  }

  // Event subscription system
  on(event: string, callback: VapiEventCallback) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  off(event: string, callback: VapiEventCallback) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  destroy() {
    console.log('[VAPI Event: destroying-client]');

    if (this.vapi) {
      try {
        this.vapi.stop();
      } catch (error) {
        console.error('[VAPI Error: destroy-failed]', error);
      }
    }

    this.eventCallbacks.clear();
    this.vapi = null;

    console.log('[VAPI Event: client-destroyed]');
  }
}
