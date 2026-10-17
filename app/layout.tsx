import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { FournisseurApp } from "@/components/fournisseur-app";
import { FournisseurAnnonces } from "@/components/annonce";
import { SCRIPT_THEME_INITIAL } from "@/lib/platform/preferences";
import "./globals.css";

// next/font télécharge la police au build et la sert depuis /_next/static :
// aucune requête vers un CDN à l'exécution, l'app fonctionne hors ligne.
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jàngal – Apprendre aujourd'hui, construire demain",
  description:
    "Des cours pratiques et accessibles pour les étudiants et les jeunes professionnels en Afrique de l'Ouest.",
  applicationName: "Jàngal",
  appleWebApp: { capable: true, title: "Jàngal", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1424" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${figtree.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME_INITIAL }} />
      </head>
      <body className="min-h-full">
        <FournisseurApp>
          <FournisseurAnnonces>{children}</FournisseurAnnonces>
        </FournisseurApp>
      </body>
    </html>
  );
}
