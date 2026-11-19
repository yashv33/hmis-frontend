import type { Metadata } from "next";
import { Noto_Sans, Work_Sans } from "next/font/google";
import "./globals.css";

// Font/Family/text-heading → Work Sans, Font/Family/text-paragraph → Noto Sans.
// `latin-ext` is needed for the rupee sign (₹) used in the preview slider.
const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin", "latin-ext"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "TiaMeds",
    template: "%s | TiaMeds",
  },
  description: "TiaMeds hospital network — patient portal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${workSans.variable} ${notoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
