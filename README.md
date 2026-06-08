# CommissionPro BTP — Feature [12-BE]

Suivi automatique des commissions apporteurs dans un projet Next.js 14 + Prisma + PostgreSQL.

---

## 1. Variables d'environnement

Copier `.env.example` en `.env` et renseigner :

```env
# Format : postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:password@localhost:5432/commissionpro"

# Taux de commission par défaut en % (optionnel, défaut : 5)
DEFAULT_COMMISSION_RATE=5
```

---

## 2. Installation

```bash
# Installer les dépendances Node
npm install

# Générer le client Prisma (à faire après chaque modification du schéma)
npm run db:generate

# Appliquer le schéma à la base PostgreSQL (crée les tables)
npm run db:migrate

# (Optionnel) Peupler avec des données de démo
npm run db:seed

# Lancer le serveur de développement
npm run dev
```

L'app est disponible sur `http://localhost:3000`.

---

## 3. Commandes utiles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur Next.js en mode développement |
| `npm run db:generate` | Régénère le client Prisma après modification du schéma |
| `npm run db:migrate` | Applique les migrations (crée/modifie les tables SQL) |
| `npm run db:push` | Pousse le schéma sans créer de fichier de migration (dev rapide) |
| `npm run db:seed` | Insère les données de démonstration |
| `npm run db:studio` | Ouvre Prisma Studio (UI pour explorer la base) |
| `npm test` | Lance les tests unitaires Vitest |

---

## 4. Adapter le schéma à une base existante

Si votre équipe a déjà des tables `Deal` ou `User` avec des noms différents, voici où modifier :

### 4a. Renommer les tables SQL (sans changer le code TypeScript)

Dans `prisma/schema.prisma`, chaque modèle a une directive `@@map()` :

```prisma
model Apporteur {
  ...
  @@map("apporteurs")  // ← changer ici pour pointer vers votre table existante
}

model Deal {
  ...
  @@map("deals")  // ← ex: @@map("projects") si votre table s'appelle "projects"
}

model Commission {
  ...
  @@map("commissions")
}
```

### 4b. Réutiliser un modèle User existant comme Apporteur

Si vous avez déjà un modèle `User` et que l'apporteur EST un utilisateur :

1. **Supprimer le modèle `Apporteur`** dans `schema.prisma`
2. **Remplacer** la relation dans `Commission` :
   ```prisma
   // Avant
   apporteurId String
   apporteur   Apporteur @relation(fields: [apporteurId], references: [id])

   // Après (si votre modèle s'appelle User)
   apporteurId String
   apporteur   User @relation(fields: [apporteurId], references: [id])
   ```
3. **Ajouter la relation inverse** dans votre modèle `User` :
   ```prisma
   model User {
     ...
     commissions Commission[]
   }
   ```
4. **Mettre à jour les imports** dans `lib/actions/commission.actions.ts` :
   remplacer `prisma.apporteur` par `prisma.user`

### 4c. Ajouter des champs métier à `Deal`

Si vos deals ont plus de champs (référence chantier, client, localisation...) :

```prisma
model Deal {
  id            String     @id @default(cuid())
  titre         String
  montant       Float
  statut        DealStatut @default(DRAFT)
  // ← Ajouter vos champs ici
  referenceChantier String?
  clientNom         String?
  localisation      String?
  ...
}
```

Puis relancer : `npm run db:migrate`

---

## 5. Pages disponibles

| Route | Description |
|---|---|
| `/commissions` | Vue entreprise : tableau de toutes les commissions avec filtres et KPI |
| `/commissions/apporteur/[id]` | Vue apporteur : ses commissions, total dû, historique |
| `/commissions/dashboard` | Dashboard ROI : performance par apporteur |

---

## 6. Server Actions exposées

Fichier : `lib/actions/commission.actions.ts`

### Mutations

```typescript
// Signe un deal et crée automatiquement la commission
signerDealEtCreerCommission(payload: CreateCommissionPayload)
// → { success: boolean, commissionId?: string, error?: string }

// Change le statut d'une commission (PENDING→TO_PAY→PAID uniquement)
changerStatutCommission(payload: UpdateStatutPayload)
// → { success: boolean, error?: string }

// Raccourci : valide le paiement (TO_PAY → PAID)
validerPaiement(commissionId: string, by?: string)
// → { success: boolean, error?: string }
```

### Lectures

```typescript
// Toutes les commissions (filtre optionnel par statut)
getCommissions(filtreStatut?: "PENDING" | "TO_PAY" | "PAID")

// Commissions d'un apporteur
getCommissionsApporteur(apporteurId: string)

// Données ROI agrégées pour le dashboard
getROIApporteurs()

// Totaux € par statut
getTotauxParStatut()
```

### Types des payloads

```typescript
interface CreateCommissionPayload {
  dealId: string;
  apporteurId: string;
  entrepriseId: string;
  taux?: number; // défaut : valeur de DEFAULT_COMMISSION_RATE (env) ou 5
}

interface UpdateStatutPayload {
  commissionId: string;
  newStatut: "PENDING" | "TO_PAY" | "PAID";
  by?: string; // identifiant de l'auteur du changement (pour l'audit)
}
```

---

## 7. Architecture des fichiers

```
/app
  /commissions
    page.tsx                    ← Vue entreprise (Server Component)
    /apporteur/[id]/page.tsx    ← Vue apporteur (Server Component, route dynamique)
    /dashboard/page.tsx         ← Dashboard ROI (Server Component)
/components
  /commissions
    CommissionTable.tsx         ← Tableau interactif (Client Component)
    StatusBadge.tsx             ← Badge statut coloré (Server Component)
    CommissionCard.tsx          ← Carte commission avec audit trail (Server Component)
    DashboardROI.tsx            ← Tableau ROI (Server Component)
  Navbar.tsx                    ← Navigation OPUS (Server Component)
/lib
  /actions
    commission.actions.ts       ← Toute la logique métier (Server Actions)
  /prisma
    client.ts                   ← Singleton Prisma (évite les connexions multiples)
/prisma
  schema.prisma                 ← Schéma de base de données
  seed.ts                       ← Données de démonstration BTP
/types
  commission.types.ts           ← Types TypeScript partagés
/__tests__
  commission.test.ts            ← Tests unitaires Vitest
```

---

## 8. Règles métier

- Un deal **SIGNED** génère exactement **une** commission (contrainte `@unique` sur `dealId`)
- Transitions de statut autorisées : `PENDING → TO_PAY → PAID` (sens unique, pas de retour arrière)
- Chaque changement de statut est **loggé automatiquement** dans `auditTrail` (champ JSON PostgreSQL)
- `paidAt` est renseigné automatiquement lors du passage au statut `PAID`
- Le taux de commission est configurable via `DEFAULT_COMMISSION_RATE` dans `.env`

---

## [13-BE] Contrats d'Apport d'Affaires & Signature

Génération de contrats PDF, signature en ligne sécurisée par token, upload du contrat signé, validation admin.

### Nouvelles variables d'environnement

Ajouter dans `.env` :

```env
# Driver de stockage : "local" (dev) ou "s3" (prod)
STORAGE_DRIVER="local"

# Chemin de stockage local (relatif à la racine du projet)
LOCAL_STORAGE_PATH="./storage/contrats"

# Clé AES-256 pour le chiffrement des fichiers (64 caractères hexadécimaux)
# Générer avec : node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AES_ENCRYPTION_KEY="REMPLACER_PAR_64_CARACTERES_HEX"

# AWS S3 (optionnel — uniquement si STORAGE_DRIVER="s3")
# AWS_REGION="eu-west-3"
# AWS_ACCESS_KEY_ID="..."
# AWS_SECRET_ACCESS_KEY="..."
# AWS_S3_BUCKET="commissionpro-contrats"

# URL de base pour les liens de signature (optionnel, défaut : http://localhost:3000)
# NEXT_PUBLIC_BASE_URL="https://votre-domaine.com"
```

### Migration Prisma — nouvelles tables

Deux nouvelles tables sont ajoutées au schéma :

```bash
# Applique le schéma et crée les tables contrats + contrat_access_logs
npm run db:migrate

# Puis peupler avec les données de démo [13-BE]
npm run db:seed
```

### Comment passer du stockage local à S3 en production

1. Renseigner les variables AWS dans `.env` :
   ```env
   STORAGE_DRIVER="s3"
   AWS_REGION="eu-west-3"
   AWS_ACCESS_KEY_ID="AKIA..."
   AWS_SECRET_ACCESS_KEY="..."
   AWS_S3_BUCKET="commissionpro-contrats"
   ```
2. Créer le bucket S3 avec accès privé (pas d'accès public)
3. Les fichiers sont chiffrés AES-256 **avant** upload sur S3 — double couche de sécurité
4. Les URLs de téléchargement sont des URLs présignées (valides 15 minutes)

### Pages disponibles

| Route | Description | Auth |
|---|---|---|
| `/contrats` | Vue admin : liste de tous les contrats, filtres, actions | Requise |
| `/contrats/[id]` | Détail admin : infos, timeline, validation/rejet | Requise |
| `/contrats/signer/[token]` | Page de signature apporteur : téléchargement + upload | **Publique** |

### Note sur la route publique `/contrats/signer/[token]`

Cette route est intentionnellement **sans authentification** — l'apporteur y accède via un lien tokenisé envoyé par email. Si un middleware d'authentification est ajouté au projet, cette route devra être exclue explicitement :

```typescript
// middleware.ts
export const config = {
  matcher: ["/((?!contrats/signer).*)"],
};
```

### Server Actions exposées

Fichier : `lib/actions/contrat.actions.ts`

| Action | Description |
|---|---|
| `generateContrat(dealId, adminId)` | Génère le PDF, crée le contrat en DRAFT |
| `sendContratLink(contratId, adminId)` | Passe en SENT, simule l'envoi du lien |
| `uploadSignedContrat(token, buffer, filename, ip?, userAgent?)` | Upload du contrat signé par l'apporteur |
| `validateContrat(contratId, adminId)` | Valide le contrat (UPLOADED → VALIDATED) |
| `rejectContrat(contratId, adminId, reason)` | Rejette le contrat (UPLOADED → REJECTED) |
| `getContrats(filtreStatut?)` | Liste tous les contrats |
| `getContratById(id)` | Contrat par ID avec logs |
| `getContratByToken(token)` | Contrat par token (page publique) |
| `getContratsByDeal(dealId)` | Contrats d'un deal |
| `getContratsByApporteur(apporteurId)` | Contrats d'un apporteur |

### Transitions de statut

```
DRAFT → SENT → UPLOADED → VALIDATED
                        ↘ REJECTED
```

---

## [17-FE] Espace Client & Participation Active

Invitation des clients par lien sécurisé, consultation du dossier sans compte, validation ou refus d'étapes, journal d'événements.

### Nouvelles variables d'environnement

Ajouter dans `.env` :

```env
# Durée de validité des liens d'invitation en heures (défaut : 72h = 3 jours)
TOKEN_EXPIRY_HOURS=72

# URL de base pour les liens d'invitation (déjà défini dans [13-BE])
# NEXT_PUBLIC_BASE_URL="https://votre-domaine.com"
```

### Migration Prisma — nouvelles tables

```bash
# Applique le schéma et crée les tables client_invitations + client_evenements
npm run db:migrate

# Puis peupler avec les données de démo [17-FE]
npm run db:seed
```

### Pages disponibles

| Route | Description | Auth |
|---|---|---|
| `/clients` | Vue admin : liste des invitations, modal invitation, timeline événements | Requise |
| `/clients/[token]` | Espace client : dossier, boutons Valider/Refuser, historique | **Publique** |

### Note sur la route publique `/clients/[token]`

Cette route est intentionnellement **sans authentification** — le client y accède via un lien tokenisé envoyé par email. Si un middleware d'authentification est ajouté, exclure cette route :

```typescript
// middleware.ts
export const config = {
  matcher: ["/((?!contrats/signer|clients/).*)" ],
};
```

### Server Actions exposées

Fichier : `lib/actions/client.actions.ts`

| Action | Description |
|---|---|
| `inviterClient(dealId, email, nom)` | Crée l'invitation, génère le token, simule l'envoi email |
| `getEspaceClient(token, ip?, userAgent?)` | Vérifie le token, retourne le dossier, logue DOSSIER_CONSULTE au 1er accès |
| `validerEtape(token, etapeId, ip?, userAgent?)` | Passe l'invitation à VALIDATED, logue ETAPE_VALIDEE |
| `refuserEtape(token, etapeId, raison, ip?, userAgent?)` | Passe l'invitation à REFUSED, logue ETAPE_REFUSEE |
| `getInvitations()` | Liste toutes les invitations avec deal et événements (vue admin) |
| `getHistoriqueClient(invitationId)` | Événements d'une invitation |

### Comment brancher Resend quand l'équipe est prête

Le fichier `lib/email/client.email.ts` est structuré pour un branchement minimal :

1. `npm install resend`
2. Ajouter `RESEND_API_KEY=re_xxx` dans `.env`
3. Dans `client.email.ts`, remplacer le bloc `console.log` par :

```typescript
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send(emailData);
```

Aucun autre fichier à modifier — l'interface `sendInvitationEmail()` reste identique.

### Transitions de statut invitation

```
PENDING → ACCESSED → VALIDATED
                   ↘ REFUSED
```

### Note sur [11-FE]

La feature [11-FE] introduira une entité **Étape** (étapes du dossier avec statuts détaillés). Quand ce code sera intégré :

- `validerEtape` et `refuserEtape` recevront un vrai `etapeId` référençant l'entité Étape
- `EspaceClientView.tsx` affichera la liste des étapes au lieu du Deal entier
- Le champ `metadata.etapeId` dans `ClientEvenement` sera déjà en place — aucune migration nécessaire

---

## [18-FE] Notifications (Phase 2)

Alertes temps réel (polling 30s) pour les événements métier : nouveau deal, commission calculée, commission payée. Centre de notifications in-app avec badge et email simulé.

### Nouvelles dépendances installées

```bash
npm install lucide-react clsx tailwind-merge class-variance-authority
```

Ces quatre paquets constituent la base de **shadcn/ui** :
- `lucide-react` — bibliothèque d'icônes SVG (Bell, etc.)
- `clsx` + `tailwind-merge` — fusion intelligente de classes Tailwind (fonction `cn()`)
- `class-variance-authority` — gestion de variantes de style (Badge)

### Variables d'environnement

Ajouter dans `.env` :

```env
# Intervalle de polling du badge de notifications en ms (défaut : 30 000 = 30s)
NEXT_PUBLIC_NOTIFICATION_POLLING_INTERVAL=30000

# URL de base (déjà définie dans [13-BE])
# NEXT_PUBLIC_BASE_URL="https://votre-domaine.com"
```

### Migration Prisma — nouvelle table

```bash
# Crée la table notifications
npm run db:migrate

# Puis peupler : 3 notifs non lues (Jean) + 2 lues (Marc)
npm run db:seed
```

### Pages disponibles

| Route | Description | Auth |
|---|---|---|
| `/notifications` | Liste complète paginée, filtres toutes/non lues, tout marquer lu | Requise |

### Comment brancher Resend pour les emails de notification

Le fichier `lib/email/notification.email.ts` est structuré pour un branchement en 3 étapes :

1. `npm install resend`
2. Ajouter `RESEND_API_KEY=re_xxx` dans `.env`
3. Dans `notification.email.ts`, remplacer le bloc `console.log` par :

```typescript
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send(emailData);
```

### Comment passer du polling au WebSocket

Si l'équipe souhaite des notifications instantanées (< 1s) :

1. **Option A — Pusher/Ably** (recommandé, serverless-compatible) :
   - `npm install pusher pusher-js`
   - Dans `createNotification`, appeler `pusher.trigger(userId, "notification", data)`
   - Dans `NotificationBell`, remplacer `setInterval` par `pusher.subscribe(userId)`

2. **Option B — Server-Sent Events** (Next.js Route Handler) :
   - Créer `app/api/notifications/stream/route.ts` avec `ReadableStream`
   - Dans `NotificationBell`, remplacer `setInterval` par `new EventSource(...)`
   - Compatible Vercel sans infrastructure supplémentaire

3. **Option C — WebSocket natif** (nécessite un serveur Node.js dédié, incompatible Vercel serverless)

Le polling à 30s reste la solution la plus simple et la plus robuste pour ce cas d'usage.

---

## [11-FE] Pipeline Kanban des Deals

Tableau kanban avec drag & drop pour suivre l'avancement des deals, messagerie interne deal par deal, upload de documents (devis, factures), déclenchement automatique des commissions au statut SIGNE.

### Installation shadcn/ui (effectuée dans cette feature)

```bash
# Dépendances installées (lucide-react + shadcn/ui basis + @dnd-kit)
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
# Déjà installés dans [18-FE] :
# npm install lucide-react clsx tailwind-merge class-variance-authority
```

Les fichiers shadcn créés : `lib/utils.ts` (fonction `cn()`), `components/ui/badge.tsx`.

### Variables d'environnement

```env
# Intervalle de polling du chat interne en ms (défaut : 10 000 = 10s)
NEXT_PUBLIC_DEAL_CHAT_POLLING_INTERVAL=10000
```

### Migration Prisma — nouvelles tables

```bash
# Crée kanban_deals + deal_documents + deal_messages
npm run db:migrate

# Seed : 6 deals répartis + 3 docs + 4 messages
npm run db:seed
```

### Pages disponibles

| Route | Description |
|---|---|
| `/deals` | Tableau kanban 5 colonnes, drag & drop, bouton "Nouveau deal" |
| `/deals/[id]` | Détail : infos, changement statut, documents, chat |

### Colonnes kanban et transitions autorisées

```
PROSPECT → CONTACTE → SIGNE → PAYE
    ↘          ↘        ↘
   ANNULE    ANNULE   ANNULE  (terminal, drag & drop désactivé depuis ANNULE)
```

### Déclenchement commission [12-BE] au statut SIGNE

Quand un `KanbanDeal` passe à `SIGNE` :
1. Un `Deal` ([12-BE]) est créé automatiquement avec le même titre et montant
2. `signerDealEtCreerCommission()` est appelée → commission `PENDING` créée
3. L'ID du Deal créé est stocké dans `KanbanDeal.commissionDealId`

### Note sur [10-BE]

La feature [10-BE] (Tracking & Liens d'Attribution) n'est pas encore intégrée.
Quand elle le sera, adapter :
- `KanbanDeal.clientNom/Email/Tel` → remplacer par une relation `clientId` vers le modèle Client de [10-BE]
- Les liens d'attribution pourront être rattachés au `KanbanDeal`

### Événements qui déclenchent une notification

| Événement | Action source | Type |
|---|---|---|
| Client invité sur un deal | `inviterClient()` dans `client.actions.ts` | `NOUVEAU_DEAL` |
| Commission calculée (deal signé) | `signerDealEtCreerCommission()` dans `commission.actions.ts` | `COMMISSION_CALCULEE` |
| Commission payée | `changerStatutCommission()` avec statut PAID | `COMMISSION_PAYEE` |

Chaque transition est vérifiée via `isContratTransitionValide()` (`lib/contrat.utils.ts`).
Chaque action crée une entrée immuable dans `ContratAccessLog`.
