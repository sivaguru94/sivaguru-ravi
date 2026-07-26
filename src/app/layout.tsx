import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Scanlines } from "@/components/Scanlines";
import "@/styles/tokens.css";
import "@/styles/globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shinigami-rog.cc"),
  title: "Sivaguru Ravi (shinigami-rog) — Senior SDE",
  description:
    "Senior SDE · 9+ yrs · Java Spring Boot · Angular. Architecting enterprise-grade applications and building the org's AI-assisted engineering playbook. a.k.a. shinigami-rog.",
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#050705",
};

/*
 * No-flash theme + JS gate. Must be the FIRST child of <body> (App Router
 * does not support hand-authored <head> children): parser-blocking, runs
 * before first paint. Stored value is allowlisted; reads are try/catch-safe
 * for blocked-storage contexts. Also stamps data-js, which gates animation
 * initial states in CSS (no JS -> full content visible).
 */
const themeInit =
  "try{var t=localStorage.getItem('theme'),m=localStorage.getItem('motion'),s=localStorage.getItem('scanlines')}catch(e){}" +
  "var d=document.documentElement;" +
  "d.dataset.theme=t==='light'?'light':'dark';" +
  "if(m==='off')d.dataset.motion='off';" +
  "if(s==='off')d.dataset.scanlines='off';" +
  "d.dataset.js='';";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <ThemeProvider>
          <Scanlines />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
