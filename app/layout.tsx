import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { SocketProvider } from "@/components/SocketProvider";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chillout",
  description: "Real-time chat and video calling app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ReactQueryProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
