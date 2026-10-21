import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Dybbo", template: "%s · Dybbo" },
  description:
    "Possess any Chog Genesis for up to ten minutes on Monad. No approval, no custody. The fee waits in escrow for its holder.",
};

export const viewport: Viewport = { themeColor: "#3ddc97" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <link rel="preload" href="/fonts/chillax-700.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/chillax-500.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
