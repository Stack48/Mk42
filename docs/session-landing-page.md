# Session — Landing Page Opus BTP
**Date :** 27 mai 2026  
**Branche :** `feat/sprint-s1-infrastructure`  
**Projet :** Opus SaaS BTP — gestion des apporteurs d'affaires  

---

## 1. Audit de l'état du projet (questions initiales)

### 1.1 Stack CSS

**Question :** Tailwind 4 + CSS variables custom, CSS Modules, ou les deux en combo ?

**Réponse :** Les deux en combo — et le bridge est **déjà en place** via le pattern natif Tailwind V4.

Mécanisme dans `src/app/globals.css` :
```css
/* 1. CSS custom properties (valeurs réelles) */
:root {
  --primary: oklch(0.5 0.22 265);
}

/* 2. @theme inline mappe les variables vers les tokens Tailwind */
@theme inline {
  --color-primary: var(--primary);
}

/* 3. shadcn injecte ses tokens */
@import "shadcn/tailwind.css";
```
Résultat : `bg-primary` dans Tailwind → `var(--primary)` → valeur oklch. Aucun hack. Pas de CSS Modules dans le projet.

---

### 1.2 Fichier `opus-landing-v4.html`

**Question :** Où est-il ? Le zip ne contient que 2 images.

**Réponse :** Il n'existe pas dans le projet. Le dossier racine contient :
- `Landing Page.png` / `Landing Page.jpg` (maquette design)
- `Dashboard Entreprise.png` / `Dashboard Entreprise.jpg` (dashboard placeholder)

**Conclusion :** Landing à créer from scratch en Next.js, en se basant sur les images comme référence visuelle.

---

### 1.3 État du projet Next.js

**Question :** Projet bootstrappé ou à init ?

**Réponse :** Déjà opérationnel :
- Next.js 16.2.6, build validé
- Containers Docker up (port 3000)
- Migrations Prisma appliquées (11 tables, 7 enums)
- `src/app/page.tsx` existant → placeholder "En construction"

---

### 1.4 Témoignages + Pricing — statique ou CMS ?

**Question :** Impact sur l'architecture si CMS prévu.

**Réponse :** Aucune infrastructure CMS dans le code (pas de table Prisma `testimonials` ou `pricing_plans`). **Décision : arrays statiques** — adapté pour une landing marketing, coût minimal, ajout d'un CMS possible plus tard sans casser l'existant.

---

## 2. Analyse des fichiers de design

### 2.1 Landing Page — sections identifiées

| # | Section | Contenu |
|---|---------|---------|
| 1 | **Header** | Logo OPUS + nav (4 liens) + CTA "Commencer gratuitement" — sticky glassmorphism |
| 2 | **Hero** | H1 + sous-titre + input email + CTA + dashboard en frame navigateur |
| 3 | **ProofStrip** | Fond `#EFF6FB`, 4 stats clés |
| 4 | **Features** | Bento 2×2 — Contrats, DAS2, Factures, Coffre-fort |
| 5 | **WhyOpus** | 3 onglets (Apporteur pro / particulier / Entreprise) + dashboard |
| 6 | **Testimonials** | 3 cards + note 4.9/5 |
| 7 | **Pricing** | 3 plans — Gratuit 0€ / Pro 3.99€ / Ultra 6.99€ |
| 8 | **FAQ** | Accordion 5 questions |
| 9 | **Footer** | Watermark OPUS géant + 3 colonnes + mentions légales |

### 2.2 Dashboard Entreprise — structure observée

| Zone | Contenu |
|------|---------|
| Sidebar | Dashboard, Mes Opportunités, Coffre Fort, Comptabilité, Paramètres |
| KPIs | 2 300€ (ce mois), 204 850€ (annuel), 5 en attente, 14 acceptées |
| Actions récentes | Commissions validées pour M.Dupont |
| Dernières transactions | Chantier de Maison, Réno salle de bain, Réno cabanon |
| Affaires récentes | Tableau Client / Type travaux / Statut (En Attente / Terminer) |

---

## 3. Décisions d'architecture

### 3.1 Route group `(public)` vs racine

**Problème :** `app/page.tsx` existe déjà. Si `app/(public)/page.tsx` est créé, Next.js lève une erreur de conflit (`/` servi deux fois).

**Contrainte :** Le tool disponible ne peut pas supprimer de fichiers.

**Décision retenue :** Conserver `app/page.tsx` comme page de la landing. Créer `app/(public)/layout.tsx` comme passthrough vide pour usage futur (pages auth, etc.). Les fonts sont injectées dans `app/layout.tsx` (root layout).

```
app/
├── layout.tsx          ← root : Rubik + DM Mono via next/font
├── page.tsx            ← landing (remplace le placeholder)
└── (public)/
    └── layout.tsx      ← passthrough, pour futures routes publiques
```

### 3.2 Fonts

**Choix :** `next/font/google` — Rubik (300→800) + DM Mono (400/500).

Variables CSS injectées sur `<body>` :
- `--font-rubik` → utilisé par `--font-sans` dans `@theme inline`
- `--font-dm-mono` → utilisé par `--font-mono`

`html { @apply font-sans; }` → Rubik cascade à tout le document.

### 3.3 Tokens Opus V4

Ajout des tokens Opus dans `globals.css` en complément des tokens shadcn existants :

```css
:root {
  --opus-bg: #F9FCFF;
  --opus-bg-warm: #FEFDF9;
  --opus-bg-tint: #EFF6FB;
  --opus-primary: #2274A5;   /* Cerulean */
  --opus-primary-dk: #1A5C85;
  --opus-primary-lt: #3A96C4;
  --opus-primary-xl: #E4F1F9;
  --opus-ink: #131B23;
  --opus-text: #2A3A48;
  --opus-muted: #5A6E7C;
  --opus-taupe: #816C61;
  --opus-border: #D4E6F2;
  --opus-success: #15724A;
  --opus-success-bg: #D8F0E6;
  --opus-error: #B91C1C;
  --opus-error-bg: #FEE2E2;
}
```

Mappés vers Tailwind via `@theme inline` → classes `bg-opus-primary`, `text-opus-ink`, `border-opus-border`, etc.

---

## 4. Implémentation — S0 à S10

### S0 — Setup (public) layout + fonts

**Fichiers modifiés :**
- `src/app/globals.css` — tokens Opus V4 + `--font-sans: var(--font-rubik)` + CSS scroll reveal
- `src/app/layout.tsx` — import Rubik + DM Mono, classes variable sur `<body>`

**Fichier créé :**
- `src/app/(public)/layout.tsx` — passthrough `<>{children}</>`

**Assets copiés :**
```
Dashboard Entreprise.png  →  public/dashboard-preview.png
Landing Page.png          →  public/landing-preview.png
```

**CSS scroll reveal ajouté :**
```css
.scroll-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 500ms ease, transform 500ms ease;
}
.scroll-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}
.scroll-reveal-delay-1 { transition-delay: 100ms; }
.scroll-reveal-delay-2 { transition-delay: 200ms; }
.scroll-reveal-delay-3 { transition-delay: 300ms; }
```

---

### S1 — Header

**Fichier :** `src/components/landing/Header.tsx`  
**Directive :** `'use client'` (useEffect pour scroll, useState pour menu mobile)

**Caractéristiques :**
- Logo : carré bleu (`#2274A5`, border-radius 7px) avec grille SVG 2×2 + texte "OPUS"
- Nav : 4 liens (Fonctionnalités, Témoignages, Prix, FAQ) avec hover `bg-opus-bg-tint`
- CTA : "Commencer gratuitement" → `/inscription`
- Sticky : `position: fixed`, `zIndex: 100`
- Glassmorphism : `backdrop-filter: blur(12px) saturate(1.4)` activé après 8px de scroll
- Fond : `rgba(249,252,255,0.82)` à partir du scroll
- Mobile : burger → menu déroulant avec tous les liens

---

### S2 — Hero + DashboardPreview

**Fichiers :**
- `src/components/landing/Hero.tsx` (`'use client'`)
- `src/components/landing/DashboardPreview.tsx` (Server Component)

**Hero — éléments :**
- Eyebrow badge : fond `--opus-primary-xl`, texte DM Mono, dot animé (pulse CSS)
- H1 : `clamp(36px, 5.5vw, 60px)`, weight 800, lettre-espacement -0.025em, couleur primaire sur le second membre
- Subtitle : `clamp(18px, 2vw, 21px)`, `--opus-muted`, max-width 580px
- CTA primaire : "Essayer gratuitement" → fond bleu, box-shadow tintée, hover translateY(-1px)
- CTA secondaire : "Se connecter" → border + bg white, hover border primaire

**DashboardPreview :**
- Frame navigateur HTML (barre avec 3 dots rouge/jaune/vert + champ URL DM Mono)
- `next/image` avec `priority` + `dashboard-preview.png`
- Box-shadow : `0 24px 80px rgba(34,116,165,0.18), 0 8px 24px rgba(34,116,165,0.08)`

---

### S3 — ProofStrip

**Fichier :** `src/components/landing/ProofStrip.tsx` (Server Component)

**Contenu :**
```
500+          12 000+         98%              0€
entreprises   documents       satisfaction     de redressement
BTP           générés         client           fiscal
```

**Style :** `bg-opus-bg-tint`, `borderTop/Bottom: 1px solid var(--opus-border)`, grid responsive `auto-fit minmax(160px, 1fr)`.

---

### S4 — Features bento

**Fichier :** `src/components/landing/Features.tsx` (`'use client'`)

**4 feature cards :**
| Icône SVG stroke 1.75 | Titre | Description |
|---|---|---|
| Fichier + lignes | Contrats légaux en 2 min | eIDAS, conformité droit français |
| Calculette | DAS2 sans effort | Généré automatiquement, net-entreprises.fr |
| Presse-papier | Factures automatiques | Chantier TERMINE → facture auto |
| Bouclier + coche | Coffre-fort sécurisé | 6 ans, valeur probante |

**Layout :** grid 12 colonnes, cards sur `span 3` (→ 2 col à 900px, 1 col à 600px via `<style>` scoped).

**Card promo full-width :** gradient bleu cerulean, "Conformez-vous en 10 minutes chrono" + CTA blanc.

**Hover cards :** `boxShadow + borderColor + translateY(-2px)` via onMouseEnter/Leave.

---

### S5 — WhyOpus (tabs)

**Fichier :** `src/components/landing/WhyOpus.tsx` (`'use client'`)

**3 onglets — personas :**
| Onglet | Persona | Heading |
|---|---|---|
| Apporteur pro | Marc, 45 ans, agent immo | Facturez vos commissions en toute légalité |
| Apporteur particulier | Sarah, 30 ans, cadre | Reçu de commission automatique, zéro paperasse |
| Entreprise BTP | Jean, PME maçonnerie | DAS2 et comptabilité automatisées |

**UX tab :**
- `useState(0)` — aucun re-render complet
- Bouton actif : `bg-opus-primary`, blanc, `boxShadow` tintée
- Bouton inactif : `bg-white`, `border-opus-border`
- Layout 2 colonnes : texte gauche (badge + heading + body + lien) + dashboard droite

---

### S6 — Testimonials

**Fichier :** `src/components/landing/Testimonials.tsx` (`'use client'`)

**3 témoignages statiques :**
| Personne | Rôle | Note |
|---|---|---|
| Marc D. | Agent immobilier — Apporteur pro | ★★★★★ |
| Sophie L. | Cadre — Apporteuse particulière | ★★★★★ |
| Jean-Pierre M. | Gérant PME maçonnerie | ★★★★★ |

**Design :**
- Aggregate : ★★★★★ **4.9** / 5 · +200 avis
- Cards : quote en italique, avatar initiales coloré (bleu/vert/amber), rôle en `--muted`
- Hover : `boxShadow + translateY(-2px)`

---

### S7 — Pricing

**Fichier :** `src/components/landing/Pricing.tsx` (`'use client'`)

**3 plans :**
| Plan | Prix | Points clés |
|---|---|---|
| **Gratuit** | 0€ | 1 apporteur, 3 docs/mois, contrats basiques |
| **Pro** ⭐ | 3.99€/mois | Apporteurs illimités, DAS2 auto, Coffre-fort, eIDAS, FEC |
| **Ultra** | 6.99€/mois | Tout Pro + multi-entreprises, API, SLA 99.9% |

**Highlight Pro :**
- Fond bleu `--opus-primary`, texte blanc
- Badge "La plus populaire" en amber au-dessus
- CTA : fond blanc, texte bleu (inversé)

**Position absolute badge :** `top: -13px; left: 50%; transform: translateX(-50%)`

---

### S8 — FAQ accordion

**Fichier :** `src/components/landing/Faq.tsx` (`'use client'`)

**5 questions :**
1. Vos commissions sont-elles vraiment protégées par Opus ?
2. Comment ça marche pour les apporteurs particuliers ?
3. Les documents générés ont-ils une valeur légale ?
4. Puis-je tester Opus gratuitement ?
5. Mes données sont-elles confidentielles ?

**Comportement :**
- `useState<number | null>(null)` — un seul item ouvert
- `onClick={() => setOpen(isOpen ? null : i)}`
- Hauteur : `maxHeight: isOpen ? '400px' : '0'` + `transition: max-height 300ms ease`
- Icône : `+` qui tourne 45° → `×` via `transform: rotate(45deg)`
- `aria-expanded={isOpen}` sur le `<button>`

---

### S9 — Footer

**Fichier :** `src/components/landing/Footer.tsx` (`'use client'`)

**Structure :**
- Fond `--opus-ink` (`#131B23`)
- Watermark OPUS : `fontSize: clamp(120px, 20vw, 200px)`, `color: rgba(255,255,255,0.04)`, `position: absolute`, `bottom: -30px`
- 4 colonnes : branding + Produit + Ressources + Contact
- Copyright dynamique : `new Date().getFullYear()`
- Liens légaux : `/mentions-legales`, `/cgu`, `/confidentialite`, `/cookies`
- Responsive : 2 colonnes à 768px, 1 colonne à 480px

---

### S10 — ScrollReveal + Assembly

**Fichiers :**
- `src/components/landing/ScrollReveal.tsx` (`'use client'`)
- `src/app/page.tsx` (Server Component, assembly final)

**ScrollReveal — implémentation :**
```tsx
'use client'
export default function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.unobserve(el)
        }
      },
      { threshold: 0.08 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref} className={`scroll-reveal scroll-reveal-delay-${delay}`}>...</div>
}
```

**Guards SSR :** `IntersectionObserver` appelé uniquement dans `useEffect` → pas d'accès `window` en Server Side.

**page.tsx — assembly + metadata :**
```tsx
export const metadata: Metadata = {
  title: "Opus — Simplifiez vos commissions d'apporteurs d'affaires BTP",
  description: "Contrats légaux, factures, DAS2 et coffre-fort automatisés...",
  openGraph: { type: 'website', locale: 'fr_FR', ... },
}
```

**Ordre des sections :**
```
Header (sticky, en dehors du main)
<main>
  Hero
  ScrollReveal > ProofStrip
  ScrollReveal > Features
  ScrollReveal > WhyOpus
  ScrollReveal > Testimonials
  ScrollReveal > Pricing
  ScrollReveal > Faq
</main>
Footer
```

---

## 5. Bug rencontré et correction

### Erreur build Next.js

**Message :**
```
Error: Event handlers cannot be passed to Client Component props.
  {href: ..., onMouseEnter: function onMouseEnter, ...}
```

**Cause :** Les composants `Hero.tsx`, `Features.tsx`, `Testimonials.tsx`, `Pricing.tsx`, `Footer.tsx` étaient des Server Components mais passaient des `onMouseEnter`/`onMouseLeave` à des composants Client (`next/link`) ou utilisaient des handlers sur des éléments HTML lors du prerendering statique.

**Fix :** Ajout de `'use client'` en tête de chaque composant concerné.

**Composants devenus Client Components :**
| Composant | Raison |
|---|---|
| `Header.tsx` | `useEffect` scroll + `useState` menu |
| `Hero.tsx` | `onMouseEnter` sur `Link` |
| `Features.tsx` | `onMouseEnter` sur `div` / `<a>` |
| `WhyOpus.tsx` | `useState` tabs |
| `Testimonials.tsx` | `onMouseEnter` sur cards |
| `Pricing.tsx` | `onMouseEnter` sur `Link` |
| `Faq.tsx` | `useState` accordion |
| `Footer.tsx` | `onMouseEnter` sur `<a>` |
| `ScrollReveal.tsx` | `useEffect` + `useRef` |

**Composants restés Server :**
| Composant | Raison |
|---|---|
| `ProofStrip.tsx` | Aucun handler, data statique |
| `DashboardPreview.tsx` | `next/image` uniquement |

---

## 6. Résultat du build final

```
▲ Next.js 16.2.6 (Turbopack)
✓ Compiled successfully in 4.6s
✓ TypeScript OK
✓ Static pages (6/6)

Route (app)
┌ ○ /                    ← Landing — statique ✓
├ ○ /_not-found
├ ƒ /api/emails/send
└ ƒ /api/webhooks/clerk
```

Route `/` prérendue en **statique** (`○`) — optimal pour une landing marketing (TTI maximal, CDN-cacheable).

---

## 7. Structure finale des fichiers créés

```
src/
├── app/
│   ├── (public)/
│   │   └── layout.tsx          ← passthrough, route group futur
│   ├── globals.css             ← tokens Opus V4 + scroll reveal CSS
│   ├── layout.tsx              ← Rubik + DM Mono via next/font
│   └── page.tsx                ← assembly landing (Server Component)
│
└── components/
    └── landing/
        ├── Header.tsx          ← sticky glass + mobile menu
        ├── Hero.tsx            ← H1 + CTA + dashboard frame
        ├── DashboardPreview.tsx← next/image + browser chrome
        ├── ProofStrip.tsx      ← 4 stats cerulean
        ├── Features.tsx        ← bento 2×2 + card promo
        ├── WhyOpus.tsx         ← 3 onglets + dashboard
        ├── Testimonials.tsx    ← 3 cards + rating 4.9/5
        ├── Pricing.tsx         ← 3 plans, Pro highlighted
        ├── Faq.tsx             ← accordion 5 questions
        ├── Footer.tsx          ← watermark + 3 colonnes
        └── ScrollReveal.tsx    ← IntersectionObserver wrapper

public/
├── dashboard-preview.png       ← copié depuis racine
└── landing-preview.png         ← copié depuis racine
```

---

## 8. Accès au visuel

### Option A — Docker (recommandé)
```bash
make up
# → http://localhost:3000
```

### Option B — Dev local sans Docker
```bash
cd C:\Users\lario\Desktop\Mk42
npm run dev
# → http://localhost:3000
```

### Option C — Build statique
```bash
npm run build && npm start
# → http://localhost:3000
```

---

## 9. Points restants / prochaines étapes

| Priorité | Tâche |
|---|---|
| 🔴 | Pages `/inscription` (6 étapes) — Clerk auth flow |
| 🔴 | Page `/connexion` — Clerk SignIn |
| 🟡 | Pages légales : `/cgu`, `/mentions-legales`, `/confidentialite`, `/cookies` |
| 🟡 | Lighthouse audit (objectif perf ≥ 85 mobile) |
| 🟢 | Optimisation hover → CSS pur (supprimer `'use client'` sur composants statiques) |
| 🟢 | `next/image` lazy sur dashboard WhyOpus tabs |
| 🟢 | Test CLS < 0.1 en DevTools |
| 🟢 | `og:image` réel (screenshot de la landing) |

---

*Généré le 27 mai 2026 — Session landing page Opus BTP*
