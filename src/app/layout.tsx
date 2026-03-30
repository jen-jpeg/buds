import type { Metadata } from "next";
import { Schoolbell } from "next/font/google";
import "./globals.css";
import NavBar from "./components/nav-bar";

const schoolbell = Schoolbell({
  weight: ["400"],
  variable: "--font-schoolbell",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "buds",
  description: "a playful friendship health tracker",
  icons: {
    icon: "/flowers/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${schoolbell.variable} h-full antialiased`}
    > 
      <body className="min-h-full flex flex-col">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
