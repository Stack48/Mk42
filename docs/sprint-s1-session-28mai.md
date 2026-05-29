# Sprint S1 — Session 28 mai 2026

> **Pour les non-développeurs** : Ce document résume le travail technique effectué lors de cette session.
> Les sections marquées 💬 contiennent une explication simple en français courant.

---

## Ce qui a été fait

### 1. Configuration du webhook Clerk
💬 *Un "webhook" est un système qui permet à Clerk (notre outil de gestion des comptes utilisateurs) d'envoyer automatiquement un message à notre application chaque fois qu'un événement se produit — par exemple quand quelqu'un crée un compte ou rejoint une organisation. On a configuré ce canal de communication.*

- Tunnel ngrok configuré pour exposer `localhost:3000` à Clerk (ngrok crée une adresse internet temporaire qui pointe vers notre ordinateur)
- Endpoint webhook créé dans le Clerk Dashboard : `https://<ngrok>/api/webhooks/clerk`
- 5 événements abonnés : `user.created`, `user.deleted`, `organization.created`, `organizationMembership.created`, `organizationMembership.deleted`
- `CLERK_WEBHOOK_SECRET` ajouté dans `.env.local` (clé secrète pour vérifier que les messages viennent bien de Clerk)

---

### 2. Correction middleware Next.js
💬 *Le "middleware" est un gardien qui vérifie chaque visiteur avant de le laisser accéder à une page. Next.js (notre framework) a changé le nom du fichier de ce gardien. On a migré notre code dans le nouveau fichier.*

- Fichier `src/middleware.ts` supprimé et logique RBAC migrée dans `src/proxy.ts` (convention Next.js 16+)

---

### 3. Correction Prisma v6 → v7
💬 *Prisma est l'outil qu'on utilise pour communiquer avec la base de données. Il y avait un conflit de version : l'outil de commande était en version 6 mais le code de l'application utilisait la version 7. Comme deux clés qui ne correspondent pas à la même serrure.*

- Mismatch détecté : `prisma` CLI en v6, `@prisma/client` en v7
- CLI mis à jour : `npm install prisma@^7.8.0 --save-dev`
- Champ `url` retiré du schéma (non supporté en v7 — URL gérée séparément)
- `@prisma/client` réinstallé
- Client généré avec la commande appropriée

---

### 4. Migration base de données
💬 *Une "migration" est une modification structurelle de la base de données — comme ajouter de nouvelles colonnes dans un tableau. On a vérifié que toutes les modifications étaient bien appliquées.*

- Migration `20260528003911_add_clerk_organizations` déjà présente
- Confirmé : aucune migration en attente

---

### 5. Pages d'authentification
💬 *On a créé les pages visibles par les utilisateurs pour s'inscrire et se connecter.*

- `/connexion` → page de connexion
- `/inscription` → formulaire d'inscription personnalisé (étape 2)
- `/dashboard` → tableau de bord après connexion, avec bouton de déconnexion
- `/inscription/etape-1` → choix du profil (Apporteur ou Entreprise BTP)
- `/inscription/etape-3` → formulaire infos entreprise (raison sociale, SIRET, adresse, etc.)
- `/inscription/etape-4` → page provisoire en attente de développement

---

### 6. Packages installés
💬 *Des "packages" sont des briques de code déjà faites par d'autres développeurs qu'on ajoute à notre projet pour ne pas tout recréer from scratch — comme des extensions.*

```
clsx, lucide-react, class-variance-authority
shadcn: button, card, input, label
```

---

### 7. API endpoint création entreprise
💬 *On a créé une "porte d'entrée" côté serveur qui, quand le formulaire étape 3 est soumis, enregistre les informations de l'entreprise dans la base de données ET crée automatiquement l'organisation correspondante dans Clerk.*

- `POST /api/inscription/entreprise` : crée l'`Entreprise` en DB + organisation Clerk, lie le `clerkOrgId`

---

## Problèmes rencontrés et solutions

### P1 — Conflit entre deux fichiers "gardien" (middleware vs proxy)
💬 *On avait deux fichiers qui jouaient le même rôle de gardien des pages. Next.js ne peut en accepter qu'un seul et a bloqué le démarrage de l'application.*

**Erreur** : `Both middleware file "./src/middleware.ts" and proxy file "./src/proxy.ts" are detected`
**Cause** : Next.js 16 a renommé la convention `middleware.ts` → `proxy.ts`. Les deux fichiers coexistaient.
**Solution** : Fusion de la logique dans `proxy.ts`, suppression de `middleware.ts`, vidage du cache `.next`.

---

### P2 — Fichier manquant dans Prisma (`library.js` not found)
💬 *Après avoir mis à jour l'outil de base de données, certains fichiers internes avaient changé de nom. L'application cherchait un fichier qui n'existait plus sous ce nom.*

**Erreur** : `Module not found: Can't resolve './runtime/library.js'`
**Cause** : En version 7 de Prisma, ce fichier s'appelle `client.js` au lieu de `library.js`. La version du CLI (v6) et du code applicatif (v7) ne correspondaient pas.
**Solution** : Mise à jour du CLI vers v7.

---

### P3 — Mot de passe de base de données non trouvé lors de la génération
💬 *Pour générer le code de connexion à la base de données, l'outil a besoin de l'adresse de la base de données. Cette adresse est stockée dans un fichier de configuration que l'outil ne lisait pas automatiquement.*

**Erreur** : `Error: DATABASE_URL must be set`
**Cause** : `prisma.config.ts` lit le fichier `.env`, mais nos variables sont dans `.env.local`. Prisma v7 vérifie la présence de cette variable dès le démarrage.
**Solution** : Passage de la variable manuellement avant la commande :
```powershell
$env:DATABASE_URL = (Get-Content .env.local | Where-Object { $_ -match '^DATABASE_URL=' } | ForEach-Object { ($_ -split '=', 2)[1] }); npx prisma generate
```

---

### P4 — Webhook refusait les messages (signature invalide)
💬 *Clerk signe chaque message qu'il envoie avec une empreinte unique, comme un sceau sur une lettre. Notre application recréait cette empreinte à partir du message reçu, mais en reformatant le texte, ce qui donnait une empreinte différente — comme si on avait réécrit la lettre avant de vérifier le sceau.*

**Erreur** : Signature Svix invalide → HTTP 400
**Cause** : Le message était converti en JSON puis reconverti en texte, ce qui modifie subtilement le formatage et invalide la signature.
**Solution** : Lecture du message brut sans transformation (`req.text()` au lieu de `req.json()`).

---

### P5 — Webhook refusait les événements de test (email vide)
💬 *Clerk propose un bouton "envoyer un événement de test" dans son tableau de bord. Ces événements de test ne contiennent pas de vraie adresse email — notre code plantait car il attendait toujours un email.*

**Erreur** : Retour HTTP 400 avec `{ error: 'Email manquant' }`
**Cause** : Les événements de test Clerk envoient un tableau `email_addresses` vide.
**Solution** : Si aucun email n'est présent, on répond "reçu mais ignoré" (HTTP 200) au lieu de planter.

---

### P6 — Formulaire d'inscription : le bouton "Continuer" ne réagissait pas
💬 *Deux problèmes indépendants empêchaient le formulaire de s'envoyer quand l'utilisateur cliquait sur "Continuer".*

**Cause 1** : La fonction `useSignUp()` de Clerk retournait `undefined` pour `isLoaded` (au lieu de `true`/`false`). Notre vérification bloquait silencieusement l'envoi.
**Solution** : Vérification remplacée — on vérifie maintenant que l'objet `signUp` existe, ce qui est plus fiable.

**Cause 2** : Le composant `Button` de notre bibliothèque UI (`@base-ui/react`) ne déclenchait pas l'événement d'envoi du formulaire HTML.
**Solution** : Remplacement par un bouton HTML natif avec un gestionnaire de clic direct.

---

### P7 — Erreur silencieuse après création du compte (`{}`)
💬 *Après avoir créé le compte, on essayait d'envoyer immédiatement le code de vérification par email. Mais Clerk gère déjà ça en interne, ce qui créait un conflit et une erreur vide.*

**Erreur** : Erreur vide `{}` après `signUp.create()`
**Cause** : Appel redondant à `prepareEmailAddressVerification()` juste après `create()`.
**Solution** : Suppression de cet appel. La vérification email se fera à l'étape 6 du flux d'inscription, comme prévu initialement.

---

## État à la fin de la session

| Étape | Description | Statut |
|-------|-------------|--------|
| Étape 1 | Choix du profil (Apporteur / Entreprise BTP) | ✅ Fonctionnel |
| Étape 2 | Informations personnelles (nom, email, mot de passe) | ✅ Fonctionnel |
| Étape 3 | Informations entreprise BTP (SIRET, adresse, etc.) | ✅ Implémenté, non testé |
| Étape 4 | Coordonnées bancaires (IBAN/BIC) | 🔲 À faire |
| Étape 5 | Vérification d'identité (upload de documents) | 🔲 À faire |
| Étape 6 | Code de vérification par email | 🔲 À faire |
| Étape 3 Apporteur | Formulaire pour les apporteurs d'affaires | 🔲 À faire |
| Organisations Clerk | Fonctionnalité RBAC (gestion des rôles) | ⚠️ À activer dans le Dashboard Clerk |
