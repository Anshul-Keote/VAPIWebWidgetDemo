import CourtneyWidget from '@/components/CourtneyWidget';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-primary/10 via-white to-brand-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Courtsapp Support
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get instant help from Courtney, our AI-powered customer support assistant.
            Available 24/7 to answer your questions via chat or voice call.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Text Chat</h3>
              <p className="text-sm text-gray-600">
                Have a conversation via text messages at your own pace
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-brand-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-brand-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Call</h3>
              <p className="text-sm text-gray-600">
                Speak naturally with our AI assistant for faster support
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Response</h3>
              <p className="text-sm text-gray-600">
                Get immediate answers to your questions, any time of day
              </p>
            </div>
          </div>

          {/* Demo Instructions */}
          <div className="mt-16 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Try the Demo</h2>
            <div className="text-left space-y-3 text-gray-700">
              <p className="flex items-start gap-2">
                <span className="text-brand-primary font-bold mt-1">1.</span>
                <span>Click the chat button in the bottom-right corner</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-brand-primary font-bold mt-1">2.</span>
                <span>Fill in your name, email, and describe your issue</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-brand-primary font-bold mt-1">3.</span>
                <span>Choose "Start Chat" for text messaging or "Start Call" for voice support</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-brand-primary font-bold mt-1">4.</span>
                <span>All VAPI events are logged to the browser console for debugging</span>
              </p>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Make sure to configure your VAPI credentials in the{' '}
                <code className="bg-yellow-100 px-1 py-0.5 rounded">.env.local</code> file
                before using the widget.
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-12 text-gray-600">
            <p className="text-sm">
              Built with Next.js 14, TypeScript, Tailwind CSS, and VAPI AI
            </p>
          </div>
        </div>
      </div>

      {/* Courtney Widget */}
      <CourtneyWidget />
    </main>
  );
}
