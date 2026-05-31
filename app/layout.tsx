import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Bubbleit | Mobile Car Wash Booking App",
  description:
    "Book a professional mobile car wash in minutes with Bubbleit. Choose your service, set your time, and let the team come to you.",
  metadataBase: new URL("https://bubbleit.app"),
  openGraph: {
    title: "Bubbleit | Mobile Car Wash Booking App",
    description:
      "A clean, fast way to book mobile car wash services from your phone.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bubbleit | Mobile Car Wash Booking App",
    description:
      "Book a professional mobile car wash in minutes with Bubbleit.",
  },
  keywords: [
    "Bubbleit",
    "mobile car wash",
    "car wash booking app",
    "car cleaning service",
    "Qatar car wash app",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
