'use client';

import { useState, useEffect, useRef } from 'react';
import { VapiClient, Message, UserContext } from '@/lib/vapi-client';
import { ChatClient } from '@/lib/chat-client';
import ChatInterface from './ChatInterface';
import VoiceInterface from './VoiceInterface';
import FeedbackModal from './FeedbackModal';

type WidgetState = 'closed' | 'form' | 'chat' | 'voice';

export default function CourtneyWidget() {
  const [widgetState, setWidgetState] = useState<WidgetState>('closed');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UserContext>({
    name: '',
    email: '',
    issue: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<UserContext>>({});

  const vapiClientRef = useRef<VapiClient | null>(null);
  const chatClientRef = useRef<ChatClient | null>(null);
  const messageIdCounter = useRef(0);

  useEffect(() => {
    // Initialize VAPI client for voice calls
    vapiClientRef.current = new VapiClient();
    vapiClientRef.current.initialize();

    // Initialize Chat client for text chat
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '';
    chatClientRef.current = new ChatClient(publicKey, assistantId);

    // Set up event listeners for voice mode
    vapiClientRef.current.on('message', handleVapiMessage);
    vapiClientRef.current.on('call-end', handleCallEnd);
    vapiClientRef.current.on('error', handleVapiError);

    return () => {
      // Cleanup on unmount
      if (vapiClientRef.current) {
        vapiClientRef.current.destroy();
      }
    };
  }, []);

  const handleVapiMessage = (message: any) => {
    console.log('[Widget] Received VAPI message:', message);

    // Only handle transcript messages for voice mode
    // Filter: Only show FINAL transcripts (not partial), and skip system messages
    if (message.type === 'transcript') {
      // Only show final transcripts (ignore partial/interim transcripts)
      if (message.transcriptType === 'final' && message.transcript) {
        // Skip system messages
        if (message.role === 'system') {
          console.log('[Widget] Skipping system message');
          return;
        }

        const role = message.role === 'user' ? 'user' : 'assistant';
        addMessage(role, message.transcript);
      }
    }
  };

  const handleCallEnd = () => {
    console.log('[Widget] Call/Session ended');
    setIsSessionActive(false);
    setShowFeedback(true);
  };

  const handleVapiError = (error: any) => {
    console.error('[Widget] VAPI Error:', error);
    addMessage('system', `Error: ${error.message || 'An error occurred'}`);
  };

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    // Avoid duplicate messages
    setMessages((prev) => {
      const isDuplicate = prev.some(
        (msg) => msg.role === role && msg.content === content &&
        Date.now() - msg.timestamp.getTime() < 1000
      );
      if (isDuplicate) return prev;

      const newMessage: Message = {
        id: `msg-${messageIdCounter.current++}`,
        role,
        content,
        timestamp: new Date(),
      };
      return [...prev, newMessage];
    });
  };

  const validateForm = (): boolean => {
    const errors: Partial<UserContext> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.issue.trim()) {
      errors.issue = 'Please describe your issue';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStartChat = async () => {
    if (!validateForm()) return;

    console.log('[Widget] Starting chat mode (text-only)');
    setWidgetState('chat');
    setIsSessionActive(true);
    setMessages([]);

    // Reset chat session
    chatClientRef.current?.reset();

    // Add welcome message (optional)
    // addMessage('assistant', `Hi ${formData.name}! How can I help you today?`);
  };

  const handleStartCall = async () => {
    if (!validateForm()) return;

    try {
      console.log('[Widget] Starting voice call');
      setWidgetState('voice');
      setIsSessionActive(true);
      setMessages([]);

      await vapiClientRef.current?.startVoiceCall(formData);
    } catch (error: any) {
      console.error('[Widget] Failed to start call:', error);
      alert('Failed to start call. Please check your VAPI credentials and microphone permissions.');
      setWidgetState('form');
      setIsSessionActive(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!isSessionActive) return;

    console.log('[Widget] Sending message:', content);
    addMessage('user', content);

    try {
      if (widgetState === 'chat') {
        // Use HTTP Chat API for text chat
        if (!chatClientRef.current) return;

        const userContext = chatClientRef.current.getChatId() ? undefined : {
          userName: formData.name,
          userEmail: formData.email,
          userIssue: formData.issue,
        };

        const responses = await chatClientRef.current.sendMessage(content, userContext);

        // Add assistant responses to UI
        responses.forEach((msg) => {
          if (msg.role === 'assistant' && msg.content) {
            addMessage('assistant', msg.content);
          }
        });
      } else if (widgetState === 'voice') {
        // Use VAPI Web SDK for voice mode (not applicable for text sending in voice)
        // Voice mode handles messages via transcript events
        console.log('[Widget] Voice mode - messages handled via transcripts');
      }
    } catch (error: any) {
      console.error('[Widget] Failed to send message:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    }
  };

  const handleEndSession = () => {
    console.log('[Widget] Ending session');

    // Stop voice call if active
    if (widgetState === 'voice') {
      vapiClientRef.current?.stop();
    }

    // Reset chat session if active
    if (widgetState === 'chat') {
      chatClientRef.current?.reset();
    }

    setIsSessionActive(false);
    setShowFeedback(true);
  };

  const handleNewSession = () => {
    console.log('[Widget] Starting new session');

    // Clean up both clients
    if (widgetState === 'voice') {
      vapiClientRef.current?.stop();
    }
    if (widgetState === 'chat') {
      chatClientRef.current?.reset();
    }

    setMessages([]);
    setFormData({ name: '', email: '', issue: '' });
    setFormErrors({});
    setWidgetState('form');
    setIsSessionActive(false);
    setIsMuted(false);
  };

  const handleToggleMute = () => {
    if (!vapiClientRef.current) return;

    const newMutedState = !isMuted;
    vapiClientRef.current.setMuted(newMutedState);
    setIsMuted(newMutedState);
    console.log('[Widget] Mute toggled:', newMutedState);
  };

  const handleFeedbackSubmit = (rating: number, feedback: string) => {
    console.log('[Widget] Feedback submitted:', { rating, feedback });
    setShowFeedback(false);
    // Here you could send the rating and feedback to your backend
  };

  const handleFeedbackClose = () => {
    console.log('[Widget] Feedback modal closed');
    setShowFeedback(false);
  };

  return (
    <>
      {/* Widget Button */}
      {widgetState === 'closed' && (
        <button
          onClick={() => setWidgetState('form')}
          className="fixed bottom-6 right-6 w-16 h-16 bg-brand-primary hover:brightness-90 text-gray-900 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
          aria-label="Open support chat"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Widget Panel */}
      {widgetState !== 'closed' && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Form View */}
          {widgetState === 'form' && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-brand-secondary text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-semibold">
                    C
                  </div>
                  <div>
                    <h3 className="font-semibold">Courtney Support</h3>
                    <p className="text-xs opacity-90">AI Customer Support</p>
                  </div>
                </div>
                <button
                  onClick={() => setWidgetState('closed')}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <div className="flex-1 p-6 overflow-y-auto">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">How can we help you?</h4>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Your name"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-1">
                      How can we help? *
                    </label>
                    <textarea
                      id="issue"
                      value={formData.issue}
                      onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none ${
                        formErrors.issue ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe your issue..."
                      rows={4}
                    />
                    {formErrors.issue && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.issue}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={handleStartChat}
                  className="w-full px-4 py-3 bg-brand-primary hover:brightness-90 text-gray-900 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Start Chat
                </button>
                <button
                  onClick={handleStartCall}
                  className="w-full px-4 py-3 bg-brand-secondary hover:brightness-110 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                  Start Call
                </button>
              </div>
            </div>
          )}

          {/* Chat View */}
          {widgetState === 'chat' && (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onEndSession={handleEndSession}
              onNewSession={handleNewSession}
              isActive={isSessionActive}
            />
          )}

          {/* Voice View */}
          {widgetState === 'voice' && (
            <VoiceInterface
              messages={messages}
              onEndCall={handleEndSession}
              onNewSession={handleNewSession}
              onToggleMute={handleToggleMute}
              isMuted={isMuted}
              isActive={isSessionActive}
            />
          )}
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={handleFeedbackClose}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
}
