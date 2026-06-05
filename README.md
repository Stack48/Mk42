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
