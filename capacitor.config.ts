import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'sn.jangal.app',
  appName: 'Jàngal',
  webDir: 'out',
  plugins: {
    SystemBars: {
      // La page déclare déjà viewport-fit=cover (app/layout.tsx) : le dire dès
      // le démarrage évite un saut de mise en page au premier affichage.
      initialViewportFitValueHint: 'cover',
    },
  },
};

export default config;
