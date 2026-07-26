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

const TITLE = "Sivaguru Ravi (shinigami-rog) — Senior SDE";
const DESCRIPTION =
  "Senior SDE · 9+ yrs · Java Spring Boot · Angular. Architecting enterprise-grade applications and building the org's AI-assisted engineering playbook. a.k.a. shinigami-rog.";

export const metadata: Metadata = {
  metadataBase: new URL("https://shinigami-rog.cc"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://shinigami-rog.cc",
    siteName: "shinigami-rog",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

/* JSON-LD Person — static author-controlled data; serialized with the
 * </script>-breakout guard so future edits stay safe (plan §7). */
const personJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Sivaguru Ravi",
  alternateName: "shinigami-rog",
  jobTitle: "Senior Software Development Engineer",
  url: "https://shinigami-rog.cc",
  email: "mailto:sivaguru94@gmail.com",
  sameAs: ["https://www.linkedin.com/in/sivaguru-ravi/"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangalore",
    addressCountry: "IN",
  },
}).replace(/</g, "\\u003c");

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: personJsonLd }}
        />
        <ThemeProvider>
          <Scanlines />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
