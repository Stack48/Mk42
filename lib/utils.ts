// UTILITAIRE shadcn/ui — fonction cn()
//
// cn() fusionne des classes Tailwind de façon intelligente.
// Problème sans cn() : si tu fais className={"bg-red-500 " + "bg-blue-500"},
// les DEUX classes sont dans le DOM et c'est le CSS qui décide (imprévisible).
// tailwind-merge résout ça : bg-blue-500 écrase bg-red-500, une seule gagne.
// clsx gère les conditions : cn("base", condition && "extra", { "autre": bool })

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
