import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import SiteAnalytics from "@/components/site-analytics";
import CoachEyes from "@/components/coach-eyes";
import RouteTransition from "@/components/route-transition";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const TITLE = "DataDraft — SQL practice on real NFL data";
const DESCRIPTION =
  "You're already the numbers person in your fantasy league. Make it your job: practice SQL, Python and Excel on real NFL stats, chart your own league, and build a portfolio an interviewer remembers.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  // "./" resolves against each route's own path (Next resolves a relative
  // canonical with the pathname), so every page gets its own canonical URL
  // without repeating it, query strings dropped. A page that sets its own
  // `alternates` (the pattern guides) overrides this. Same for og:url, which
  // pointed every page at the home page: a shared question link told
  // Facebook and LinkedIn it was the home page.
  alternates: { canonical: "./" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "./",
    siteName: "DataDraft",
    type: "website",
    // A drawn card (app/api/og/card), not the 1.9 MB stadium photo: it
    // says what the site is in the preview itself, and it loads fast.
    images: [
      {
        url: "/api/og/card",
        width: 1200,
        height: 630,
        alt: "DataDraft — LeetCode for football data",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/api/og/card"],
  },
};

export const viewport: Viewport = {
  themeColor: "#131F24",
};

// Paint the saved (or system) theme before first paint so there's no flash.
// Keep in sync with components/theme-toggle.tsx.
const THEME_SCRIPT = `
(function(){try{
var k="sqlsports-theme";
var t=localStorage.getItem(k);
if(t!=="light"&&t!=="dark"){
  t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";
}
document.documentElement.setAttribute("data-theme",t);
}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="font-sans antialiased bg-stadium">
        {children}
        <SiteAnalytics />
        <CoachEyes />
        <RouteTransition />
      </body>
    </html>
  );
}
