# Session 08-FE — Création d'Opportunité · Sprint S2 · OPUS SaaS BTP

> Résumé de session — 03 juin 2026
> Front uniquement · Back (Server Action + Prisma + Resend) à venir

---

## Ce qui a été fait

### 1. Contexte & objectif

Implémentation de la page **"Proposer une opportunité"** accessible uniquement aux apporteurs d'affaires (Marc et Sarah). Formulaire en **4 étapes** avec validation, appel API INSEE, et page de confirmation.

---

### 2. Fichiers créés (19 fichiers)

```
src/
├── lib/
│   └── validations/
│       └── opportunite.ts                        ← Schémas Zod (PRO, PARTICULIER, chantier)
└── app/
    └── (apporteur)/
        ├── layout.tsx                            ← Layout dashboard avec sidebar nav
        ├── layout.module.css
        └── opportunites/
            ├── nouvelle/
            │   ├── page.tsx                      ← State machine stepper + OpportuniteFormData
            │   ├── page.module.css
            │   └── _components/
            │       ├── ProgressBar.tsx           ← Barre de progression 4px animée
            │       ├── ProgressBar.module.css
            │       ├── StepperSidebar.tsx        ← Sidebar 4 étapes done/active/inactive
            │       ├── StepperSidebar.module.css
            │       ├── StepVosInfos.tsx          ← Étape 1 : profil Clerk read-only
            │       ├── StepVosInfos.module.css
            │       ├── StepInfosClient.tsx       ← Étape 2 : formulaire client + INSEE
            │       ├── StepInfosClient.module.css
            │       ├── StepDetailsChantier.tsx   ← Étape 3 : type de travaux + chantier
            │       ├── StepDetailsChantier.module.css
            │       ├── StepSoumettre.tsx         ← Étape 4 : récap + mock submit
            │       └── StepSoumettre.module.css
            └── [id]/
                └── confirmation/
                    ├── page.tsx                  ← Page de confirmation animée
                    └── page.module.css
```

### 3. Fichiers modifiés (2 fichiers pré-existants)

| Fichier | Raison |
|---|---|
| `prisma.config.ts` | Correction `process.env["DATABASE_URL"]` → cast `as string` (erreur TS pré-existante) |
| `src/server/users/controller.ts` | Migration `prisma.user` → `prisma.utilisateur` (désalignement schema démo Sprint S1) |

---

## Ce qui fonctionne

### ✅ Build & TypeScript

- **Build Next.js 100% propre** — 0 erreur TypeScript, 0 warning
- Routes générées correctement :
  - `○ /opportunites/nouvelle` (statique)
  - `ƒ /opportunites/[id]/confirmation` (dynamique)

### ✅ Layout apporteur (`(apporteur)/layout.tsx`)

- Sidebar gauche fixe (224px) avec :
  - Logo "Opus □" avec icône grille SVG
  - 5 liens nav : Dashboard · Mes Opportunités · Coffre Fort · Comptabilité · Paramètres
  - Section utilisateur en bas : avatar initiales + nom Clerk + bouton Déconnexion
- Colonne principale `flex: 1` qui accueille le contenu des pages apporteur
- Responsive : sidebar masquée sur mobile (≤ 768px)

### ✅ ProgressBar (`ProgressBar.tsx`)

- Hauteur 4px, fond gris clair, remplissage primary `#4648D4`
- Largeur calculée : `(step / 4) × 100%`
- Transition CSS `width 400ms cubic-bezier(...)` 
- `role="progressbar"` + `aria-valuenow/valuemax` pour l'accessibilité
- Respecte `prefers-reduced-motion` (désactive la transition si nécessaire)

### ✅ StepperSidebar (`StepperSidebar.tsx`)

- 4 étapes : "Vos informations" · "Informations du client" · "Détails du chantier" · "Soumettre l'opportunité"
- 3 états visuels :
  - **Complétée** : cercle noir + icône check SVG blanc + sous-texte "Validé" en muted
  - **Active** : cercle primary `#4648D4` + numéro blanc + "En cours" en primary
  - **À venir** : cercle gris + numéro gris, pas de sous-texte
- Ligne de connexion verticale entre étapes
- Étape 1 affiche "(pré-rempli)" quand complétée
- `aria-current="step"` sur l'étape active, sticky en desktop

### ✅ Page principale (`nouvelle/page.tsx`)

- Type `OpportuniteFormData` exporté (contrat de données front/back) :
  ```typescript
  clientType, clientSiret, clientRaisonSociale, clientNom, clientPrenom,
  clientTelephone, clientEmail, adresseChantier, typesTravaux, description, delai
  ```
- State machine : `step` (1→4) + `formData` centralisés
- Header interne : bouton "← Retour" (`router.back()`) + `<ProgressBar>`
- Titre et sous-titre dynamiques selon l'étape active
- Transition entre étapes : animation CSS `opacity + translateY(12px→0)` 300ms sur `key={step}`
- `window.scrollTo({ top: 0, behavior: 'smooth' })` à chaque changement d'étape

### ✅ Étape 1 — Vos informations (`StepVosInfos.tsx`)

- Données via `useUser()` de `@clerk/nextjs` avec fallbacks si non chargé
- Affiche : avatar avec initiales, nom complet (grand, semi-bold), badge rôle
- Badge rôle : "Apporteur Pro" ou "Apporteur Particulier" selon `publicMetadata.role`
- Champs avec icônes SVG : email, téléphone
- SIRET en `font-mono` (DM Mono) + raison sociale si rôle pro
- Note informative en bas : "Pour modifier ces infos, allez dans Paramètres"
- Un seul bouton "Continuer →" (pas de "Précédent" à l'étape 1)

### ✅ Étape 2 — Informations du client (`StepInfosClient.tsx`)

- **Toggle Professionnel / Particulier** avec `role="radiogroup"` + `role="radio"` + `aria-checked`
- Changer de type réinitialise tous les champs client
- **Mode PRO** :
  - Champ SIRET `inputMode="numeric"` `maxLength={14}` en font-mono
  - Bouton "Vérifier" : appel réel `GET api.annuaire-entreprises.data.gouv.fr` avec `AbortController` timeout 4 secondes
  - Spinner pendant le chargement, champ disabled
  - Succès → bannière verte "✓ SIRET VALIDE · Raison sociale · Active depuis XXXX"
  - Auto-fill de `clientRaisonSociale`
  - Erreur / timeout → bannière discrète "Saisie manuelle activée", bouton Vérifier masqué
  - Téléphone (oblig.) + Email (oblig.) + Adresse chantier **(Facultatif)**
- **Mode PARTICULIER** :
  - Nom (oblig.) + Prénom (oblig.) + Téléphone (oblig.) + Email (oblig.) + Adresse chantier **(obligatoire)**
- Validation Zod au `onBlur` sur chaque champ
- Erreurs inline `font-size: 12px` en rouge sous chaque champ
- Validation schema complet au clic "Continuer" (affiche toutes les erreurs manquées)
- Boutons : "Précédent" + "Continuer →"

### ✅ Étape 3 — Détails du chantier (`StepDetailsChantier.tsx`)

- **Type de travaux** (obligatoire) — `<select>` natif stylisé, 11 options :
  Maçonnerie & Gros œuvre · Charpente & Couverture · Plomberie & Sanitaire · Électricité · Isolation & Thermique · Menuiserie & Fenêtres · Carrelage & Revêtements · Peinture & Décoration · Aménagement extérieur & Terrassement · Démolition & Désamiantage · Autre
- **Description** (Optionnel) — `<textarea>` min-height 100px, resize vertical
- **Délai souhaité** (Optionnel) — `<select>` 5 options : Urgent (< 1 mois) · 1 à 3 mois · 3 à 6 mois · Plus de 6 mois · Non défini
- **Adresse du chantier** (obligatoire) — pré-remplie si déjà saisie à l'étape 2 (PRO)
  - Lien "Utiliser l'adresse saisie précédemment" si le champ est effacé
- Validation Zod `typesTravaux` + `adresseChantier` au blur

### ✅ Étape 4 — Soumettre (`StepSoumettre.tsx`)

- **Récapitulatif en 2 cards** côte à côte (stack sur mobile ≤ 768px) :
  - Card "Le client" : badge Pro/Particulier, nom/raison sociale, SIRET en mono si Pro, téléphone, email, adresse
  - Card "Le chantier" : type de travaux, délai en badge pill, adresse, description en italique muted
- **Checkbox** "Je confirme l'exactitude des informations renseignées." — bouton submit disabled si non cochée
- **Bouton "Soumettre l'opportunité"** : pleine largeur, rounded-full (999px), hauteur 56px
  - Pendant le submit : spinner inline + "Soumission en cours…", bouton disabled
- **Mock submit** préservé avec commentaire `// 🔌 MOCK` :
  ```typescript
  console.log('[08-FE MOCK] Données opportunité :', formData)
  await new Promise(resolve => setTimeout(resolve, 1200))
  router.push('/opportunites/mock-id/confirmation')
  ```

### ✅ Page de confirmation (`[id]/confirmation/page.tsx`)

- Contenu centré verticalement et horizontalement
- **Animation SVG** : cercle vert qui se dessine via `stroke-dashoffset` (CSS pur, pas d'image bitmap)
  - Cercle : 600ms ease-out
  - Coche : 300ms ease-out décalée de 600ms
- Titre "Opportunité soumise !" — Rubik 700
- Sous-titre : "L'entreprise a été notifiée et reviendra vers vous sous 48h."
- Bouton primaire "Voir mes opportunités" → `/opportunites`
- Lien texte "Soumettre une nouvelle opportunité" → `/opportunites/nouvelle`
- Respecte `prefers-reduced-motion`

### ✅ Design System V4

- Couleur primary réelle du projet : `#4648D4` (indigo) — pas `#2274A5` du brief initial
- Pattern CSS Modules strict (un fichier par composant), cohérent avec l'existant
- Tokens locaux déclarés dans chaque module (pas de pollution globale)
- Inputs : height 46px, border-radius 8px, bg `#F3F4F6`, focus ring `rgba(70,72,212,0.12)`
- Boutons : "Précédent" border ghost, "Continuer" filled primary, "Soumettre" rounded-full
- Icônes SVG stroke linéaires, stroke-width 1.75, jamais filled
- Font Rubik (inherit du root layout), DM Mono pour SIRET

---

## Ce qui ne marche pas / limitations connues

### ⚠️ Clerk non configuré en local

Les pages `(apporteur)/*` requièrent Clerk. Sans variables `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY` dans `.env.local`, le rendu de `useUser()` ne retourne pas de vrai utilisateur. Le code gère les fallbacks (valeurs par défaut "John Doe") pour ne pas crasher.

**Impact :** L'étape 1 affiche les données fallback et non les vraies données Clerk.

### ⚠️ Pas d'authentification sur les routes

Le groupe de route `(apporteur)` n'a pas de middleware de protection. N'importe qui peut accéder à `/opportunites/nouvelle` sans être connecté. La protection doit être ajoutée dans `middleware.ts` (session back).

### ⚠️ Pas de persistance des données

Le mock submit fait uniquement un `console.log`. Les données ne sont pas envoyées au backend, pas stockées en base, pas d'email envoyé à l'entreprise.

**Prévu en session back :** Server Action `createOpportunite()` + Prisma + Resend.

### ⚠️ Route `/opportunites` absente

Le bouton "Voir mes opportunités" sur la page de confirmation redirige vers `/opportunites` qui n'existe pas encore. Il renvoie une 404 jusqu'à la création de la liste des opportunités.

### ⚠️ Routes dashboard absentes

La sidebar nav pointe vers `/dashboard`, `/coffre-fort`, `/comptabilite`, `/parametres` qui n'existent pas encore. Les liens sont fonctionnels mais aboutissent sur des 404.

### ⚠️ `StepDetailsChantier` — lien "Utiliser l'adresse précédente"

Le lien ne s'affiche que si :
- `clientType === 'PRO'`
- L'adresse avait été saisie à l'étape 2 (capturée au montage du composant)
- L'utilisateur a effacé l'adresse dans le champ de l'étape 3

Si l'adresse n'a pas été touchée depuis l'étape 2, le lien n'apparaît pas (ce qui est correct — l'adresse est déjà là).

### ℹ️ `<select>` natif au lieu de shadcn/ui Select

Le prompt demandait `@/components/ui/select` de shadcn. Ces composants n'existent pas dans le projet (`src/components/ui/` est vide). Des `<select>` natifs stylisés CSS Modules ont été utilisés à la place, cohérents avec le pattern existant du projet.

---

## Décisions techniques prises

| Décision | Raison |
|---|---|
| CSS Modules au lieu de Tailwind utilitaire | Cohérence avec tous les composants `inscription/` existants |
| `<select>` natif | `src/components/ui/` est vide — pas de shadcn/ui installé côté composants |
| Couleur primary `#4648D4` | Valeur réelle dans `globals.css`, pas `#2274A5` du brief |
| Appel INSEE réel (pas mock) | Le prompt le spécifiait explicitement avec timeout 4s |
| Fallback sur `useUser()` | Clerk non configuré en local, évite le crash en dev |
| Validation full-schema au clic "Continuer" | Affiche toutes les erreurs si l'utilisateur a sauté des champs sans blur |

---

## Prochaines étapes (session back)

1. **Server Action `createOpportunite()`** dans `src/app/actions/opportunite.ts`
2. **Prisma** : créer l'`Opportunite` en base avec `statut: EN_ATTENTE`
3. **Resend** : email de notification à l'entreprise
4. **Middleware Clerk** : protéger toutes les routes `(apporteur)/*`
5. **Page liste** `/opportunites` : affichage des opportunités de l'apporteur avec statuts
6. **Pages dashboard** manquantes

---

## Commandes utiles

```bash
# Démarrer l'app
make up

# Vérifier le build
npx next build

# Lancer en dev
npx next dev

# Accéder à la page
http://localhost:3000/opportunites/nouvelle
```

---

*Session : Front uniquement — 08-FE Création d'Opportunité · Sprint S2 · OPUS SaaS BTP*
*Date : 03 juin 2026 · Build : ✅ 0 erreur TypeScript*
