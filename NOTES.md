# NOTES — Observations [13-BE]

Fichier de suggestions et observations **sans application** dans le code existant.
Conformément à la règle absolue : aucune modification du code [12-BE].

---

## Middleware absent

Il n'existe pas de `middleware.ts` à la racine du projet.

La route `/contrats/signer/[token]` est publique (sans authentification requise).
Si l'équipe ajoute un middleware d'authentification plus tard, il faudra exclure
ce pattern dans la configuration du matcher :

```typescript
// middleware.ts (à créer si nécessaire)
export const config = {
  matcher: ["/((?!contrats/signer).*)"],
};
```

---

## Améliorations identifiées dans [12-BE] (non appliquées)

- **Cast `as unknown as`** : dans `app/commissions/page.tsx`, le cast
  `commissions as unknown as CommissionWithRelations[]` pourrait être évité en
  typant explicitement le retour des fonctions Prisma dans les actions.

- **`alert()` pour les erreurs** : dans `CommissionTable.tsx`, le `alert(res.error)`
  donne une mauvaise UX. Un composant toast/notification serait plus adapté
  (ex: bibliothèque `sonner` ou `react-hot-toast`).

---

## Suggestions pour [13-BE]

- **Un contrat par deal** : actuellement, un deal peut avoir plusieurs contrats
  (pas de contrainte unique). Si l'équipe veut garantir 1 contrat par deal,
  ajouter dans `schema.prisma` : `@@unique([dealId])` sur le modèle `Contrat`.

- **Upload via Server Action** : `SignerUpload.tsx` utilise une route API
  `/api/contrats/signer` pour l'upload binaire. Depuis Next.js 14, les Server
  Actions acceptent aussi les `FormData` avec fichiers — alternative possible
  si l'équipe préfère éviter les routes API.

- **Envoi email réel** : `sendContratLink` simule l'envoi via `console.log`.
  Pour un envoi réel, les services recommandés : **Resend** (simple, API REST)
  ou **Nodemailer** (SMTP). Ajouter une variable `RESEND_API_KEY` dans `.env`.

- **Navbar** : `/contrats` n'est pas encore dans la `Navbar.tsx` (`components/Navbar.tsx`).
  Non modifié ici par respect de la règle absolue. À ajouter manuellement :
  ```tsx
  <Link href="/contrats" className="text-sm text-[#6B7280] hover:text-[#0F1117] transition-colors">
    Contrats
  </Link>
  ```

- **Régénération PDF** : le `templateData` est stocké en JSON précisément pour
  permettre de régénérer le PDF à tout moment. Une action `regenerateContratPDF(contratId)`
  serait utile si le PDF original est corrompu ou perdu.

- **Validation taille fichier côté serveur** : la limite 10Mo est vérifiée côté client
  dans `SignerUpload.tsx`. La route API `/api/contrats/signer/route.ts` vérifie aussi
  la taille, mais pour une sécurité maximale, configurer également `next.config.ts` :
  ```typescript
  // next.config.ts
  export default { api: { bodyParser: { sizeLimit: "10mb" } } };
  ```

- **URLs de téléchargement signées** : en production S3, les URLs présignées expirent
  (15 min par défaut dans `S3StorageService`). Les liens dans `ContratDetail.tsx`
  devraient être régénérés à chaque affichage de page, pas mis en cache.

---

## Observations [17-FE] — Espace Client (non appliquées)

### Middleware absent

Il n'existe toujours pas de `middleware.ts` à la racine du projet.

La route `/clients/[token]` est publique (sans authentification). Si l'équipe ajoute
un middleware d'authentification, exclure **les deux** routes publiques token-based :

```typescript
// middleware.ts (à créer si nécessaire)
export const config = {
  matcher: ["/((?!contrats/signer|clients/).*)" ],
};
```

### [11-FE] absent — hypothèse appliquée

La feature [11-FE] n'existe pas encore dans ce projet. Pour les boutons Valider/Refuser,
l'hypothèse retenue est : le "dossier" = le Deal lui-même (titre, montant, statut).
L'`etapeId` passé aux actions est `deal-{dealId}` et stocké dans les metadata de l'événement.

Quand [11-FE] sera intégré, adapter :
- `EspaceClientView.tsx` : remplacer l'affichage du Deal par la liste des Étapes
- `validerEtape` / `refuserEtape` : utiliser un vrai ID d'étape Prisma
- Aucune migration DB nécessaire (`metadata` JSON est déjà extensible)

### Navbar — `/clients` non ajouté

La page `/clients` n'est pas encore dans la `Navbar.tsx` par respect de la règle absolue.
À ajouter manuellement dans `components/Navbar.tsx` :

```tsx
<Link href="/clients" className="text-sm text-[#6B7280] hover:text-[#0F1117] transition-colors">
  Espace Client
</Link>
```

### Sécurité token — amélioration possible

Le token est actuellement valide jusqu'à `tokenExpiresAt` même si le client a déjà
validé ou refusé. Une amélioration serait d'invalider le token après traitement
(statut VALIDATED ou REFUSED) en ajoutant `tokenExpiresAt: new Date()` lors du update.
Non appliqué pour rester dans le scope de la spec.

### Envoi email multi-invitations

Actuellement, un même client peut recevoir plusieurs invitations pour le même deal
(pas de contrainte d'unicité sur `(dealId, email)`). Si l'équipe veut garantir
une seule invitation active par client/deal, ajouter dans `schema.prisma` :
```prisma
@@unique([dealId, email])
```

---

## Observations [18-FE] — Notifications (non appliquées)

### Pas d'authentification — userId hardcodé en démo

La Navbar utilise le premier apporteur en base (`findFirst`) comme utilisateur de démo.
En production avec auth, remplacer par `getServerSession()` (NextAuth) ou
l'équivalent du framework auth choisi. Le `userId` se propagera naturellement
à `NotificationBell` et toutes les actions de notification.

### Notifications orphelines possible

Si un apporteur est supprimé, ses notifications sont supprimées en cascade
(`onDelete: Cascade` dans le schéma). Si l'équipe veut conserver l'historique
après suppression, changer en `onDelete: SetNull` et rendre `userId` nullable.

### Polling et mode veille navigateur

`setInterval` est mis en pause par certains navigateurs quand l'onglet est inactif
(throttling après 1 min). Acceptable pour un badge de compteur. Si la fraîcheur
est critique, utiliser `visibilitychange` pour relancer un fetch au retour en focus :
```typescript
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshCount();
});
```

### alert() dans les composants existants

`CommissionTable.tsx` et `ContratTable.tsx` utilisent encore `alert()` natif
pour les erreurs. Avec [18-FE], un composant toast serait cohérent avec les
notifications in-app. Non modifié par respect de la règle absolue.

### Page /notifications — clic sans redirection

Sur la page `/notifications`, `NotificationItem` reçoit `onClick={() => {}}` (no-op)
car la redirection côté serveur est complexe sans Client Component dédié.
Amélioration possible : créer `NotificationItemClickable.tsx` (Client Component)
qui appelle `markAsRead` + `router.push()` au clic, et l'utiliser sur la page complète.

---

## Observations [11-FE] — Pipeline Kanban (non appliquées)

### [10-BE] absent — hypothèses appliquées

La feature [10-BE] (Tracking & Liens d'Attribution) n'existe pas dans le projet.
Hypothèses retenues :
- Pas de modèle `Client` → les infos client sont dénormalisées sur `KanbanDeal` (clientNom, clientEmail, clientTel)
- Pas de liens d'attribution → non implémentés dans cette feature
- Quand [10-BE] sera intégré : remplacer `clientNom/Email/Tel` par `clientId` (FK vers Client) + migration Prisma

### KanbanDeal vs Deal existant

Le modèle `KanbanDeal` (pipeline CRM) coexiste avec le modèle `Deal` ([12-BE], comptable).
Ce n'est pas une duplication — ce sont deux objets métier distincts :
- `Deal` ([12-BE]) = déclencheur de commission, statuts comptables (DRAFT/SIGNED/PAID)
- `KanbanDeal` ([11-FE]) = suivi commercial, statuts CRM (PROSPECT/CONTACTE/SIGNE/PAYE/ANNULE)

À terme, l'équipe pourra choisir de les fusionner ou de conserver la séparation.

### DragOverlay et alert()

`KanbanBoard.tsx` utilise `alert()` natif pour signaler une transition interdite au drag.
En production, remplacer par un toast (`sonner`) ou un état d'erreur inline.

### entrepriseId hardcodé

Dans `updateDealStatut` (cas SIGNE), l'`entrepriseId` est hardcodé à `"entreprise-btpro"`.
En production avec auth, récupérer l'ID de l'entreprise connectée via la session.

### Chat polling et onglet inactif

Même observation que [18-FE] : `setInterval` est throttlé par les navigateurs
après ~1 min d'inactivité de l'onglet. Ajouter un `visibilitychange` listener
pour forcer un refresh à la réactivation si la fraîcheur du chat est critique.

### Navbar — /deals non ajouté

La page `/deals` n'est pas encore dans `Navbar.tsx` par respect de la règle absolue.
À ajouter manuellement :
```tsx
<Link href="/deals" className="text-sm text-[#6B7280] hover:text-[#0F1117] transition-colors">
  Pipeline
</Link>
```
