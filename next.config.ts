import type { NextConfig } from "next";

// Export 100 % statique : le dossier `out/` est ensuite empaqueté par Capacitor
// (webDir: "out"). Aucun serveur, aucune route API, aucune optimisation d'image.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
