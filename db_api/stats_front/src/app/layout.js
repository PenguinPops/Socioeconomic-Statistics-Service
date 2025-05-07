import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from '@/app/context/AuthContext'; 
import { Menu } from "@/app/components/Menu/page"
import { auth } from "@/../auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dane gospodarcze",
  description: "Dane gospodarcze Polski w latach 2000-2024",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Provider>
          <div className="flex h-screen">
            {/* Fixed Left-side Menu */}
            <div className="fixed left-0 top-0 bottom-0 w-64 border-r border-gray-200">
              <Menu/>
            </div>
            
            {/* Content area with padding to account for fixed menu */}
            <div className="flex-1 pl-64 overflow-y-auto">
              {children}
            </div>
          </div>
        </Provider>
      </body>
    </html>
  );
}