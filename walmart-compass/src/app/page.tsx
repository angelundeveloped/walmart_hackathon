import { MapDisplay, ChatWindow, ShoppingList } from '@/components';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-walmart text-white p-3 sm:p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                🛒 Walmart Wavefinder
                <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">BETA</span>
              </h1>
              <p className="opacity-90 mt-1 text-sm sm:text-base">AI-Powered In-Store Navigation</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span>📡</span>
                <span>UWB Active</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🤖</span>
                <span>AI Ready</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-2 sm:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Map Section - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2 order-1">
            <MapDisplay className="h-full" />
          </div>
          
          {/* Right Sidebar - Chat and Shopping List */}
          <div className="space-y-4 lg:space-y-6 order-2">
            <ChatWindow className="h-[400px] lg:h-[500px]" />
            <ShoppingList />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0b4c8c] text-white p-3 sm:p-4 mt-6 sm:mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-blue-100 text-xs sm:text-sm">
            Walmart Wavefinder - Hackathon Project | AI-Powered Navigation System
          </p>
        </div>
      </footer>
    </div>
  );
}