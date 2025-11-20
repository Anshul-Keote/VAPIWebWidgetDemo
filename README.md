# Courtney - AI Customer Support Widget Demo

A production-ready Next.js 14 chat widget demo featuring "Courtney" - an AI customer support agent for Courtsapp, powered by VAPI.

## Features

- **Dual Mode Support**:
  - **Text Chat**: HTTP-based API for pure text conversations (like ChatGPT)
  - **Voice Call**: WebSocket-based voice conversations with real-time transcripts
- **Smart Message Filtering**: Only shows assistant responses (no system prompts or partial transcripts)
- **Session Management**: Start new sessions, end calls/chats
- **Post-Session Feedback**: 5-star rating system
- **Comprehensive Event Logging**: All VAPI events logged to console
- **Responsive Design**: Beautiful, mobile-friendly interface
- **Sports-Themed Branding**: Custom Courtsapp color scheme

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- VAPI Chat API (HTTP) for text mode
- VAPI Client Web SDK (@vapi-ai/web) for voice mode

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure VAPI Credentials

Create or edit the `.env.local` file in the root directory:

```env
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id_here
```

Get your credentials from [VAPI Dashboard](https://vapi.ai)

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Open Browser Console

Press F12 or right-click → Inspect to open the browser console. All VAPI events will be logged here with clear labels like `[VAPI Event: message]`.

## Usage

1. Click the blue chat button in the bottom-right corner
2. Fill in your information:
   - Name
   - Email
   - Issue description
3. Choose your preferred mode:
   - **Start Chat**: Text-only conversation using VAPI Chat API (no voice)
   - **Start Call**: Voice conversation using VAPI Web SDK (with real-time transcripts)
4. Interact with Courtney
   - In chat mode: Type your messages
   - In voice mode: Speak naturally (transcripts appear in real-time)
5. When done, click "End Chat" or "End Call"
6. Rate your experience (optional)
7. Start a new session or close the widget

## How It Works

### Chat Mode (Text-Only)
- Uses VAPI's HTTP Chat API (`POST /chat`)
- Pure text conversation without voice processing
- Conversations maintain context via `chatId`
- Only displays final assistant responses (no system messages)

### Voice Mode (Real-time Voice)
- Uses VAPI Web SDK (`@vapi-ai/web`)
- Real-time voice conversation with transcription
- Only displays final transcripts (filters out partial/interim transcripts)
- Microphone controls (mute/unmute, end call)

## Project Structure

```
├── app/
│   ├── page.tsx           # Main demo page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── CourtneyWidget.tsx # Main widget (manages chat/voice modes)
│   ├── ChatInterface.tsx  # Text chat UI
│   ├── VoiceInterface.tsx # Voice call UI with transcripts
│   └── FeedbackModal.tsx  # 5-star rating modal
├── lib/
│   ├── chat-client.ts     # HTTP Chat API client for text mode
│   └── vapi-client.ts     # VAPI Web SDK wrapper for voice mode
├── .env.local             # Environment variables (not in git)
└── tailwind.config.ts     # Tailwind configuration with brand colors
```

## VAPI Events Logged

The application logs all VAPI events to the console:

### Connection Events
- `[VAPI Event: initializing]`
- `[VAPI Event: initialized]`
- `[VAPI Event: call-start]`
- `[VAPI Event: call-end]`

### Communication Events
- `[VAPI Event: message]`
- `[VAPI Event: transcript]`
- `[VAPI Event: sending-message]`
- `[VAPI Event: message-sent]`

### Speech Events
- `[VAPI Event: speech-start]`
- `[VAPI Event: speech-end]`

### Session Events
- `[VAPI Event: starting-chat]`
- `[VAPI Event: starting-voice-call]`
- `[VAPI Event: stopping]`
- `[VAPI Event: stopped]`

### Error Events
- `[VAPI Event: error]`
- `[VAPI Error: ...]`

## Customization

### Brand Colors

Edit `tailwind.config.ts` to customize the color scheme:

```typescript
brand: {
  primary: "#2563EB",    // Blue
  secondary: "#F97316",  // Orange
  accent: "#10B981",     // Green
  dark: "#1E293B",       // Dark slate
  light: "#F1F5F9",      // Light gray
}
```

### Assistant Configuration

The widget passes user context (name, email, issue) to VAPI via the `variableValues` parameter. You can customize this in `lib/vapi-client.ts`.

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### "Missing credentials" warning
- Make sure `.env.local` exists and contains valid VAPI credentials
- Restart the dev server after creating/modifying `.env.local`

### Voice call not starting
- Check browser microphone permissions
- Verify VAPI credentials are correct
- Check console for error messages

### Messages not appearing
- Open browser console to see VAPI event logs
- Verify the assistant is properly configured in VAPI dashboard
- Check network tab for API call errors

## License

MIT

## Support

For VAPI-related issues, visit [VAPI Documentation](https://docs.vapi.ai)
