// TODO(capacitor): remplacer par @capacitor/dialog
//   import { Dialog } from "@capacitor/dialog";
//   const { value } = await Dialog.confirm({ title, message, okButtonTitle, cancelButtonTitle });
//   return value;
// La boîte native respecte le style du système (Material sur Android) et
// affiche un vrai titre, ce que window.confirm ne permet pas.
//
// Confirmation avant une action destructive (suppression, réinitialisation).

import { estNavigateur } from "./index";

export type OptionsConfirmation = {
  titre: string;
  message: string;
  boutonOk?: string;
  boutonAnnuler?: string;
};

export async function confirmer({ titre, message }: OptionsConfirmation): Promise<boolean> {
  if (!estNavigateur()) return false;
  return window.confirm(`${titre}\n\n${message}`);
}
