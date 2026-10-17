// TODO(capacitor): remplacer par @capacitor/local-notifications
//   import { LocalNotifications } from "@capacitor/local-notifications";
//   demanderPermission → (await LocalNotifications.requestPermissions()).display === "granted"
//   programmerRappelQuotidien(heure) →
//     await LocalNotifications.cancel({ notifications: [{ id: ID_RAPPEL }] });
//     await LocalNotifications.schedule({ notifications: [{
//       id: ID_RAPPEL, title, body,
//       schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
//     }]});
//   annulerRappel → LocalNotifications.cancel({ notifications: [{ id: ID_RAPPEL }] })
// Android 13+ demande la permission POST_NOTIFICATIONS ; Android 12+ demande
// SCHEDULE_EXACT_ALARM pour une heure précise.
//
// Rappel quotidien d'apprentissage. Sur le web, un rappel ne peut se déclencher
// que tant que l'application est ouverte (minuteur) : c'est la limite principale
// que le plugin natif lève.

import { estNavigateur } from "./index";

export type EtatPermission = "accordee" | "refusee" | "a-demander" | "indisponible";

const TITRE = "Jàngal";
const MESSAGE = "C'est l'heure de ta leçon du jour ! Quelques minutes suffisent pour garder ta série.";

let minuteur: ReturnType<typeof setTimeout> | null = null;

function notificationsDisponibles(): boolean {
  return estNavigateur() && "Notification" in window;
}

export async function etatPermission(): Promise<EtatPermission> {
  if (!notificationsDisponibles()) return "indisponible";
  switch (Notification.permission) {
    case "granted":
      return "accordee";
    case "denied":
      return "refusee";
    default:
      return "a-demander";
  }
}

export async function demanderPermission(): Promise<EtatPermission> {
  if (!notificationsDisponibles()) return "indisponible";
  const resultat = await Notification.requestPermission();
  return resultat === "granted" ? "accordee" : resultat === "denied" ? "refusee" : "a-demander";
}

function prochaineOccurrence(heure: string, maintenant = new Date()): Date {
  const [h, m] = heure.split(":").map(Number);
  const cible = new Date(maintenant);
  cible.setHours(h, m, 0, 0);
  if (cible <= maintenant) cible.setDate(cible.getDate() + 1);
  return cible;
}

/** Programme le rappel tous les jours à `heure` (« HH:MM »). */
export async function programmerRappelQuotidien(heure: string): Promise<boolean> {
  await annulerRappel();
  if ((await etatPermission()) !== "accordee") return false;
  const armer = () => {
    const delai = prochaineOccurrence(heure).getTime() - Date.now();
    minuteur = setTimeout(() => {
      try {
        new Notification(TITRE, { body: MESSAGE, icon: "/icon.png", tag: "rappel-quotidien" });
      } catch {
        // Android Chrome exige un service worker pour `new Notification` : ignoré sur le web.
      }
      armer();
    }, delai);
  };
  armer();
  return true;
}

export async function annulerRappel(): Promise<void> {
  if (minuteur) clearTimeout(minuteur);
  minuteur = null;
}
