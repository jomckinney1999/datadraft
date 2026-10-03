import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import SiteAnalytics from "@/components/site-analytics";

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
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
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

// Force dark — clear any leftover light preference from before dark-only.
const THEME_SCRIPT = `
(function(){try{
localStorage.removeItem("sqlsports-theme");
document.documentElement.setAttribute("data-theme","dark");
}catch(e){}})();
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
      </body>
    </html>
  );
}
