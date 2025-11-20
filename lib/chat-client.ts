// HTTP-based chat client for VAPI text-only mode
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  id: string;
  output: ChatMessage[];
}

export class ChatClient {
  private chatId: string | null = null;

  constructor(apiKey: string, assistantId: string) {
    // No longer needed on client side - API route handles authentication
  }

  async sendMessage(message: string, userContext?: Record<string, string>): Promise<ChatMessage[]> {
    console.log('[Chat API] Sending message:', message);

    try {
      const requestBody: any = {
        input: message,
      };

      // Include previous chat ID for conversation continuity
      if (this.chatId) {
        requestBody.previousChatId = this.chatId;
      }

      // Include variable values for user context (first message only)
      if (userContext && !this.chatId) {
        requestBody.assistantOverrides = {
          variableValues: userContext,
        };
      }

      // Call our secure API route instead of VAPI directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Chat API Error]', response.status, errorText);
        throw new Error(`Chat API error: ${response.status} ${errorText}`);
      }

      const data: ChatResponse = await response.json();
      console.log('[Chat API] Response:', data);

      // Store chat ID for conversation continuity
      if (data.id) {
        this.chatId = data.id;
      }

      // Return only the assistant messages from output
      return data.output || [];
    } catch (error) {
      console.error('[Chat API] Request failed:', error);
      throw error;
    }
  }

  reset() {
    console.log('[Chat API] Resetting chat session');
    this.chatId = null;
  }

  getChatId(): string | null {
    return this.chatId;
  }
}
