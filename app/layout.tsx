import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./product-ui.css";

export const metadata: Metadata = {
  title: "Through the Bible — The Big Story",
  description: "A cinematic, interactive journey through the one unfolding story of Scripture, beginning with Creation, the Fall, and the First Promise.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Through the Bible",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8f6f1",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/images/course-intro-hero-v2.webp" type="image/webp" />
        <link rel="preload" as="image" href="/images/week1-cinematic-master-v4.webp" type="image/webp" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>{children}</body>
    </html>
  );
}
