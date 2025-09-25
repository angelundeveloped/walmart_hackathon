import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SelectionProvider } from "@/lib/selection";
import { AuthProvider } from "@/contexts/AuthContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PWAWrapper from "@/components/pwa/PWAWrapper";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Walmart Wavefinder - AI-Powered In-Store Navigation",
  description: "AI-powered navigation system for Walmart stores with real-time positioning and intelligent routing",
  manifest: "/manifest.json",
  themeColor: "#0071CE",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wavefinder",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0071CE" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Wavefinder" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            <PreferencesProvider>
              <SelectionProvider>
                <PWAWrapper>{children}</PWAWrapper>
              </SelectionProvider>
            </PreferencesProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
