import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

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
  "LeetCode for football data. A new SQL question every day on real NFL scoring, courses from SELECT to window functions, and projects you can put your name on. You don't have to watch the games.";

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
    images: [
      {
        url: "/hero-stadium-night.png",
        width: 1536,
        height: 1024,
        alt: "DataDraft",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/hero-stadium-night.png"],
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
      <body className="font-sans antialiased bg-stadium">{children}</body>
    </html>
  );
}
