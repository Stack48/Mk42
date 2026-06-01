# Sprint S1 — Session 29 mai 2026

> **Pour les non-développeurs** : Ce document résume le travail technique effectué lors de cette session.
> Les sections marquées 💬 contiennent une explication simple en français courant.

---

## Ce qui a été fait

### 1. Débogage et correction du flux d'inscription (étape 3)

💬 *En reprenant le travail de la veille, on a constaté que le bouton "Continuer" de l'étape 3 restait bloqué en chargement infini. On a identifié et corrigé plusieurs problèmes en cascade.*

**Problèmes rencontrés et solutions :**

**a) Redirection vers la page de connexion au lieu de l'API**
- Cause : le middleware Clerk interceptait les appels vers `/api/inscription/entreprise` et redigeait les utilisateurs non authentifiés vers `/connexion` au lieu de retourner une erreur JSON
- Solution : ajout d'une exception dans `proxy.ts` — les routes `/api/` gèrent leur propre authentification et retournent un JSON 401 au lieu de rediriger

**b) Erreur non capturée côté client**
- Cause : si le serveur renvoyait du HTML (page d'erreur) au lieu de JSON, `res.json()` plantait silencieusement et `setChargement(false)` n'était jamais appelé
- Solution : enveloppe de tout le fetch dans un `try/catch` avec message d'erreur affiché

**c) Organisation Clerk bloquante**
- Cause : `clerkClient().organizations.createOrganization()` échouait (fonctionnalité désactivée dans le dashboard Clerk) et faisait planter toute la route
- Solution : enveloppement de la création d'organisation dans un `try/catch` optionnel — l'organisation Clerk n'est pas bloquante pour l'inscription

**d) Utilisateur absent en base de données**
- Cause : le webhook Clerk `user.created` n'était pas reçu (ngrok non actif), donc l'utilisateur n'existait pas dans la base Prisma
- Solution : fallback ajouté — si l'utilisateur n'est pas en base, on le récupère depuis l'API Clerk et on le crée automatiquement

---

### 2. Refonte complète de l'étape 2 (création de compte)

💬 *L'étape 2 est la page où l'utilisateur crée son compte. On a eu beaucoup de problèmes avec le système de "CAPTCHA" (le test anti-robot de Cloudflare) qui bloquait toutes les tentatives. Après plusieurs approches, on a trouvé une solution robuste.*

**Problèmes rencontrés :**

**a) CAPTCHA Turnstile bloquant**
- La configuration Clerk avait `captcha_enabled: true` (protection anti-bot de Cloudflare)
- Le widget CAPTCHA échouait dans l'environnement de développement (erreurs `401 Unauthorized` sur `challenges.cloudflare.com`)
- `signUp.create()` attendait indéfiniment que le CAPTCHA se résolve → bouton bloqué

**b) Changements d'API Clerk v7**
- En Clerk v7, `signUp.create()` retourne `{ result, error }` au lieu de lancer une exception ou de retourner la ressource directement — comportement différent des versions précédentes
- Les méthodes `prepareEmailAddressVerification` et `attemptEmailAddressVerification` ont été renommées en `prepareVerification` et `attemptVerification`
- `setActive` n'est plus disponible sur `useSignIn()` — il faut l'obtenir depuis `useClerk()`
- `isLoaded` retourne `undefined` (et non `false`) avant l'initialisation de Clerk, ce qui faisait que `!isLoaded` était `true` et bloquait l'exécution

**c) Conflits de redirection**
- L'ancienne route `[[...sign-up]]` était une route "catch-all" qui capturait toutes les URLs sous `/inscription`, créant des conflits avec les routes `/inscription/etape-3`, `/inscription/etape-4`, etc.
- La variable d'environnement `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/inscription/etape-2` créait une boucle infinie : après inscription → redirection vers `/inscription/etape-2` → qui est aussi une page d'inscription → boucle
- Correction : `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/inscription/etape-3`

**Solution finale adoptée :**

💬 *Au lieu de laisser Clerk gérer la création de compte côté navigateur (où il y a le CAPTCHA), on crée le compte depuis notre serveur (qui n'a pas de CAPTCHA), puis on utilise un "ticket" — un code secret à usage unique valable 5 minutes — pour connecter automatiquement l'utilisateur.*

1. Le formulaire envoie les données à notre API `/api/inscription/compte`
2. Notre serveur crée le compte Clerk via l'API admin (pas de CAPTCHA côté serveur)
3. Notre serveur crée l'utilisateur en base de données
4. Notre serveur génère un **sign-in token** (ticket à usage unique, expire dans 5 minutes)
5. Le navigateur utilise ce ticket via `signIn.create({ strategy: 'ticket', ticket })` pour activer la session
6. Session établie → redirection vers étape 3

**Nouvelle architecture de l'étape 2 :**
- Route dédiée `/inscription/etape-2` (suppression de l'ancienne route catch-all `[[...sign-up]]`)
- Formulaire custom : prénom, nom, email, mot de passe
- Wrapper `Suspense` ajouté (requis par Next.js App Router pour `useSearchParams`)

---

### 3. Implémentation des étapes 4, 5 et 6

💬 *On a complété le tunnel d'inscription avec les trois étapes manquantes.*

#### Étape 4 — Coordonnées bancaires

- Formulaire : IBAN, BIC, nom du titulaire du compte (obligatoires)
- Taux de commission par défaut (%) et montant fixe (€) — optionnels, modifiables contrat par contrat
- API route `POST /api/inscription/banque` : mise à jour de l'enregistrement `Entreprise` en base
- Bouton "Passer cette étape" — les coordonnées bancaires peuvent être renseignées plus tard depuis le dashboard

#### Étape 5 — Documents KYC

💬 *KYC signifie "Know Your Customer" (Connaître Votre Client). C'est une obligation légale qui consiste à vérifier l'identité des entreprises et des personnes avec qui on travaille, pour éviter la fraude et le blanchiment d'argent.*

- Upload du KBIS (document officiel d'immatriculation de l'entreprise, moins de 3 mois)
- Upload de la pièce d'identité du représentant légal
- Architecture d'upload en deux temps :
  1. Notre API génère une **URL présignée** S3 (une URL temporaire et sécurisée qui permet d'envoyer un fichier directement dans notre stockage cloud sans passer par notre serveur)
  2. Le navigateur envoie le fichier directement vers S3 via cette URL
  3. Notre API enregistre les métadonnées du document (type, nom, chemin) en base de données
- Statut KYC initial : `EN_ATTENTE` (vérification par l'équipe sous 24-48h)
- Bouton "Passer cette étape" disponible

#### Étape 6 — Confirmation

- Page de succès avec récapitulatif des étapes complétées
- Indicateur visuel du statut KYC en attente
- Explication du délai de vérification (24-48h)
- Bouton d'accès direct au tableau de bord

---

### 4. Corrections techniques diverses

**Contrainte d'unicité SIRET :**
- Lors des tests avec le même SIRET, Prisma renvoyait une erreur 500 non explicite
- Correction : détection de l'erreur Prisma `P2002` (violation de contrainte unique) et retour d'un message clair : "Ce SIRET est déjà enregistré"

**`useSearchParams` sans Suspense :**
- Next.js App Router exige que tout composant utilisant `useSearchParams()` soit enveloppé dans un `<Suspense>`
- Correction appliquée sur étapes 3, 4, 5 et 6 — sans quoi les pages s'affichaient vides

---

## Problèmes connus / à traiter avant production

| Problème | Impact | Solution recommandée |
|----------|--------|---------------------|
| Pas de vérification email | Un utilisateur peut s'inscrire avec une adresse qui ne lui appartient pas | Envoyer un email de confirmation via Resend après création du compte |
| Endpoint `/api/inscription/compte` sans rate limiting | Peut être spammé pour créer des comptes en masse | Ajouter `@upstash/ratelimit` ou limiter par IP |
| CAPTCHA désactivé de facto | Moins de protection anti-bot en développement | Résoudre le conflit Turnstile / environnement de dev avant la mise en production |

---

## État du flux d'inscription au 29 mai 2026

| Étape | Statut | Description |
|-------|--------|-------------|
| 1 — Choix du profil | ✅ Fonctionnel | Sélection Entreprise BTP ou Apporteur d'affaires |
| 2 — Création de compte | ✅ Fonctionnel | Formulaire custom, création serveur + ticket Clerk |
| 3 — Infos entreprise | ✅ Fonctionnel | SIRET, raison sociale, adresse, représentant légal |
| 4 — Coordonnées bancaires | ✅ Fonctionnel | IBAN, BIC, commission par défaut |
| 5 — Documents KYC | ✅ Fonctionnel | Upload S3 KBIS + pièce d'identité |
| 6 — Confirmation | ✅ Fonctionnel | Récapitulatif + redirection dashboard |
| Flux Apporteur | ❌ Non implémenté | Étapes 3-5 spécifiques au profil apporteur |

---

## Prochaines étapes

- Implémenter le flux d'inscription pour le profil **Apporteur d'affaires** (étapes 3-5 différentes : infos personnelles, type particulier/professionnel, IBAN)
- Développer le **dashboard** avec les fonctionnalités principales
- Configurer ngrok de façon permanente pour les webhooks Clerk en développement
- Ajouter la vérification email post-inscription
