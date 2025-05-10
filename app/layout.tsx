import { Toaster } from "@/components/ui/sonner";
import {
  ClerkProvider
} from '@clerk/nextjs';
import type { Metadata } from "next";
import { ThemeProvider } from "../components/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apple Pass",
  description: "Generate and manage Apple Passes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider dynamic>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`font-[-apple-system,BlinkMacSystemFont]antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
