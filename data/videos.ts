// Vidéos MP4 publiques d'exemple, légères (0,5 à 5 Mo) et servies avec CORS
// (Access-Control-Allow-Origin: *), ce qui permet de les stocker hors ligne.
// À remplacer par les vraies vidéos des formateurs.
export const VIDEOS = {
  fleur: { url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", tailleMo: 1.1 },
  vendredi: { url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4", tailleMo: 0.5 },
  lapin: {
    url: "https://mdn.github.io/learning-area/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4",
    tailleMo: 0.8,
  },
  bunny: { url: "https://mdn.github.io/dom-examples/fullscreen-api/assets/bigbuckbunny.mp4", tailleMo: 4.7 },
} as const;
