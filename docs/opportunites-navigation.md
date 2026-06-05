# Navigation — Page Création Opportunité

## Flux complet

```
/connexion
    │ (après login Clerk)
    ▼
/opportunites                    ← liste des opportunités
    │ bouton "Nouvelle opportunité" ou CTA vide
    ▼
/opportunites/nouvelle           ← formulaire 4 étapes  ← ON EST ICI
    │ Step 4 → Soumettre → Server Action createOpportunite()
    ▼
/opportunites/[id]/confirmation  ← page succès (existe)
    │ bouton "Voir mes opportunités"
    ▼
/opportunites
```

---

## Pages existantes et leurs connexions

### `/opportunites` — `src/app/(apporteur)/opportunites/page.tsx`
- **Entrée depuis :** sidebar nav, `/opportunites/[id]/confirmation`
- **Sortie vers :** `/opportunites/nouvelle` (bouton "Nouvelle opportunité" + CTA si liste vide)
- **Sortie vers :** `/opportunites/[id]` (clic sur une carte) ⚠️ **page détail non créée**
- **Auth :** `redirect('/connexion')` si non connecté ✅

### `/opportunites/nouvelle` — `src/app/(apporteur)/opportunites/nouvelle/page.tsx`
- **Entrée depuis :** `/opportunites`
- **Bouton "← Retour" :** `router.back()` → retourne à `/opportunites`
- **Sortie après soumission :** `router.push('/opportunites/${id}/confirmation')` dans `StepSoumettre.tsx` ✅
- **Server Action :** `src/lib/actions/opportunite.ts` → `createOpportunite()` → Prisma + Resend

### `/opportunites/[id]/confirmation` — `src/app/(apporteur)/opportunites/[id]/confirmation/page.tsx`
- **Entrée depuis :** `/opportunites/nouvelle` (redirection post-soumission)
- **À relier :** bouton "Voir mes opportunités" → `/opportunites` ⚠️ **à vérifier/implémenter**
- **À relier :** bouton "Créer une autre opportunité" → `/opportunites/nouvelle` ⚠️ **à vérifier/implémenter**

---

## Pages manquantes à créer (autres branches)

| Route | Priorité | Description |
|-------|----------|-------------|
| `/opportunites/[id]` | Haute | Détail d'une opportunité — la liste y pointe déjà |
| `/dashboard` | Haute | Dashboard principal — sidebar y pointe, page inexistante |
| `/coffre-fort` | Moyenne | Coffre-fort RGPD |
| `/comptabilite` | Moyenne | DAS2, factures |
| `/parametres` | Basse | Paramètres compte |

---

## Connexions à compléter lors du merge

### 1. `/connexion` (créée dans cette branche)
Créée pour que Clerk puisse rediriger les utilisateurs non connectés.  
Fichier : `src/app/connexion/[[...rest]]/page.tsx`  
**À supprimer si une page de connexion existe déjà dans une autre branche.**

### 2. `/dashboard` → `/opportunites/nouvelle`
Quand le dashboard sera créé, ajouter un CTA rapide :
```tsx
<Link href="/opportunites/nouvelle">Proposer une opportunité</Link>
```

### 3. `/opportunites/[id]` (page détail)
La liste fait déjà `href={/opportunites/${opp.id}}`.  
Créer `src/app/(apporteur)/opportunites/[id]/page.tsx` avec les données Prisma :
```ts
const opp = await prisma.opportunite.findUnique({
  where: { id: params.id },
  include: { client: true, apporteur: true },
})
```

### 4. Page confirmation — vérifier les boutons retour
Vérifier que `src/app/(apporteur)/opportunites/[id]/confirmation/page.tsx` contient bien :
```tsx
<Link href="/opportunites">Voir mes opportunités</Link>
<Link href="/opportunites/nouvelle">Créer une autre opportunité</Link>
```

---

## Server Action — `createOpportunite`

Fichier : `src/lib/actions/opportunite.ts`

- Authentification via `auth()` Clerk → récupère `userId`
- Recherche `Utilisateur` par `clerkId` → puis `Apporteur`
- Crée `Client` + `Opportunite` en Prisma
- Envoie email de notification via Resend (optionnel si clé absente)
- Retourne `{ success: true, id }` ou `{ success: false, error }`

**Prérequis env pour que la soumission fonctionne :**
```
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...   # optionnel, désactivé si absent
```

**Prérequis BDD :** l'utilisateur doit exister en tant que `Utilisateur` + `Apporteur` dans Prisma  
(flow webhook Clerk → à implémenter, voir `src/app/api/webhooks/`)
