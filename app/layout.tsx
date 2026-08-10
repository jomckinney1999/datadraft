import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

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

const TITLE = "SQL Sports — Become a data analyst. Sports are the lens.";
const DESCRIPTION =
  "SQL, Python, R, Git, and statistics — everything an aspiring data analyst or data scientist needs, taught through football, basketball, or baseball. You don't have to watch the games.";

export const metadata: Metadata = {
  metadataBase: new URL("https://sql-sports.vercel.app"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://sql-sports.vercel.app",
    siteName: "SQL Sports",
    type: "website",
    images: [
      {
        url: "/hero-stadium-night.png",
        width: 1536,
        height: 1024,
        alt: "SQL Sports",
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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c1022" },
    { media: "(prefers-color-scheme: light)", color: "#f6f7fc" },
  ],
};

// Runs before first paint so the page never flashes the wrong theme. Mirrors
// the resolution order in components/theme-toggle.tsx — keep the two in sync.
// Any failure leaves the document with no data-theme, which renders dark.
const THEME_SCRIPT = `
(function(){try{
var s=localStorage.getItem("sqlsports-theme");
var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");
document.documentElement.setAttribute("data-theme",t);
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
