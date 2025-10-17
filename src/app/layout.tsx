import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "zkProofport — Demo Dapp",
  description: "Example dapp using @zkproofport/sdk",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>{children}</body></html>
  );
}
