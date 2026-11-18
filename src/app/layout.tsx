import type { Metadata } from "next";
import {
  Fraunces,
  Geist_Mono,
  Noto_Sans_Devanagari,
  Source_Sans_3,
} from "next/font/google";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { Toaster } from "@/components/ui/sonner";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hearth",
    template: "%s · Hearth",
  },
  description: "Household money, kept together.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${sourceSans.variable} ${notoDevanagari.variable} ${geistMono.variable} h-full`}
    >
      <body
        className={
          locale === "hi"
            ? "min-h-full flex flex-col font-[family-name:var(--font-noto-devanagari),var(--font-source-sans),sans-serif]"
            : "min-h-full flex flex-col"
        }
      >
        <LocaleProvider locale={locale} dict={dict}>
          {children}
          <Toaster richColors position="top-right" />
        </LocaleProvider>
      </body>
    </html>
  );
}
