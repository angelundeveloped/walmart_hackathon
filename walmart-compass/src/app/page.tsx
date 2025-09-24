import { MapDisplay, ChatWindow, ShoppingList } from '@/components';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-walmart text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">🛒 Walmart Wavefinder</h1>
          <p className="opacity-90 mt-1">AI-Powered In-Store Navigation</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <MapDisplay className="h-full" />
          </div>
          
          {/* Right Sidebar - Chat and Shopping List */}
          <div className="space-y-6">
            <ChatWindow className="h-[500px]" />
            <ShoppingList />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0b4c8c] text-white p-4 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-300">
            Walmart Wavefinder - Hackathon Project | AI-Powered Navigation System
          </p>
        </div>
      </footer>
    </div>
  );
}