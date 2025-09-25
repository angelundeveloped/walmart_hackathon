'use client';

import { MapDisplay, ChatWindow, ShoppingList } from '@/components';
import AuthButton from '@/components/auth/AuthButton';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import MobileMenu from '@/components/ui/MobileMenu';
import MobileLayout from '@/components/ui/MobileLayout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { dictionary, isLoading } = useLanguage();

  if (isLoading || !dictionary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 pb-4 sm:pb-6">
      {/* Header */}
      <header className="bg-walmart text-white p-2 xs:p-3 sm:p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-sm xs:text-base sm:text-xl md:text-2xl font-bold flex items-center gap-1 sm:gap-2 truncate">
                🛒 <span className="hidden xs:inline">{dictionary.header.title}</span><span className="xs:hidden">WF</span>
                <span className="text-xs sm:text-sm bg-walmart-yellow text-walmart px-1 xs:px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold">{dictionary.header.beta}</span>
              </h1>
              <p className="opacity-90 mt-1 text-xs sm:text-sm md:text-base hidden sm:block">{dictionary.header.subtitle}</p>
            </div>
            <div className="flex items-center gap-1 xs:gap-2 sm:gap-2 md:gap-4 flex-shrink-0">
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span>📡</span>
                  <span>{dictionary.header.uwbActive}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🤖</span>
                  <span>{dictionary.header.aiReady}</span>
                </div>
              </div>
              
              {/* Desktop Auth & Language */}
              <div className="hidden lg:flex items-center gap-2">
                <LanguageSwitcher />
                <AuthButton />
              </div>
              
              {/* Mobile Menu */}
              <div className="lg:hidden">
                <MobileMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

               {/* Main Content */}
               <main className="max-w-7xl mx-auto p-2 xs:p-3 sm:p-4 w-full">
                 {/* Desktop Layout */}
                 <div className="hidden xl:grid grid-cols-5 gap-8 desktop-grid">
                   {/* Map Section - Takes up 3 columns on large screens */}
                   <div className="col-span-3 map-section">
                     <MapDisplay className="h-[600px] w-full" />
                   </div>
                   
                   {/* Right Sidebar - Chat and Shopping List */}
                   <div className="col-span-2 space-y-6 sidebar-section">
                     <ChatWindow className="h-[350px]" />
                     <ShoppingList className="h-auto" />
                   </div>
                 </div>
                 
                 {/* Mobile/Tablet Layout */}
                 <div className="xl:hidden">
                   <MobileLayout
                     mapContent={
                       <div className="h-full">
                         <MapDisplay className="h-full" />
                       </div>
                     }
                     chatContent={
                       <div className="h-full p-2">
                         <ChatWindow className="h-full" />
                       </div>
                     }
                     listContent={
                       <div className="h-full p-2">
                         <ShoppingList className="h-full" />
                       </div>
                     }
                   />
                 </div>
               </main>

      {/* Footer */}
      <footer className="bg-[#0b4c8c] text-white p-3 sm:p-4 mt-6 sm:mt-8 mb-4 sm:mb-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-blue-100 text-xs sm:text-sm leading-tight">
            {dictionary.footer.description}
          </p>
        </div>
      </footer>
    </div>
  );
}