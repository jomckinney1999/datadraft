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

const TITLE = "SQL Sports — Learn SQL through fantasy football";
const DESCRIPTION =
  "An education platform that teaches SQL and data analytics through fantasy football. Query live season data. Think like an analyst.";

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
  themeColor: "#0c1022",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans antialiased bg-stadium">{children}</body>
    </html>
  );
}
