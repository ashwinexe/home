import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { TEFrame } from "@/components/layout/TEFrame";
import { SpeedInsights } from "@vercel/speed-insights/next";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ashwinexe.com"),
  title: {
    default: "Ashwin Kumar Uppala",
    template: "%s | Ashwin Kumar Uppala",
  },
  description: "Polymath • Head of Community at Devfolio",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Ashwin Kumar Uppala",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@AshwinExe",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexMono.variable} ${ibmPlexSans.variable} font-mono`}
      >
        <TEFrame>{children}</TEFrame>
        <SpeedInsights />
      </body>
    </html>
  );
}
