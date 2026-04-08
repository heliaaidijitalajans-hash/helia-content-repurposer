import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const locale = h.get("X-NEXT-INTL-LOCALE") ?? "tr";

  return (
    <html
      lang={locale}
      className={`notranslate ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      translate="no"
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        className="min-h-screen min-h-full bg-white font-sans text-gray-900 antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
