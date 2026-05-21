# Mk42 — Boilerplate Next.js

Boilerplate Next.js 16 avec Prisma, PostgreSQL et Docker.

## Stack

- **Next.js 16** — App Router, Server Components, Server Actions
- **Prisma 7** — ORM avec client généré dans `src/generated/prisma`
- **PostgreSQL 16** — via Docker
- **pgAdmin 4** — interface d'administration de la base
- **Tailwind CSS v4** — avec Base UI et shadcn
- **TypeScript 5**

## Prérequis

- [Docker](https://www.docker.com/) + Docker Compose

## Démarrage

```bash
make setup
```

Lance le build, démarre les containers et applique les migrations. L'app est disponible sur [http://localhost:3000](http://localhost:3000).

## Commandes

### Docker

| Commande         | Description                             |
| ---------------- | --------------------------------------- |
| `make up`        | Démarrer avec logs                      |
| `make start`     | Démarrer en arrière-plan                |
| `make down`      | Arrêter                                 |
| `make rebuild`   | Rebuild l'image et redémarrer           |
| `make destroy`   | Supprimer containers, images et volumes |
| `make logs`      | Afficher les logs                       |
| `make shell-app` | Shell dans le container Next.js         |

### Base de données

| Commande                | Description                               |
| ----------------------- | ----------------------------------------- |
| `make migrate name=xxx` | Créer et appliquer une migration          |
| `make migrate-reset`    | Reset complet de la base                  |
| `make prisma-push`      | Push le schema sans migration (dev)       |
| `make prisma-generate`  | Regénérer le client Prisma                |
| `make prisma-studio`    | Ouvrir Prisma Studio (port 5555)          |
| `make psql`             | Console psql                              |
| `make db-reset`         | Supprimer et recréer le volume PostgreSQL |

## Services

| Service    | URL                   | Identifiants                |
| ---------- | --------------------- | --------------------------- |
| App        | http://localhost:3000 | —                           |
| pgAdmin    | http://localhost:5050 | `admin@local.dev` / `admin` |
| PostgreSQL | `localhost:5432`      | `mk42` / `mk42password`     |

Le serveur PostgreSQL est pré-configuré dans pgAdmin — aucune configuration manuelle requise.

## Variables d'environnement

Copier `.env.local` et renseigner les valeurs :

```bash
cp .env.local .env.local
```

```env
DATABASE_URL="postgresql://mk42:mk42password@localhost:5432/mk42_dev?schema=public"
```

> Dans le container Docker, `DATABASE_URL` est automatiquement surchargé pour pointer vers le service `postgres`.

## Structure

```
src/
├── app/                  # Pages et routes Next.js
│   └── api/              # Routes API
├── components/           # Composants React
│   └── ui/               # Composants de base (Button, Field…)
├── lib/                  # Utilitaires (prisma, auth, errors…)
├── schemas/              # Schémas Zod
├── server/               # Server actions
└── generated/prisma/     # Client Prisma généré (ne pas modifier)
```

## Bonnes pratiques — branches Git

### Nommage

- Utilisez un **préfixe** qui indique le type de travail, puis une **description courte** en **kebab-case** (minuscules, tirets).
- Forme recommandée : `<type>/<description>`.

| Préfixe     | Usage                                    |
| ----------- | ---------------------------------------- |
| `feature/`  | Nouvelle fonctionnalité                  |
| `fix/`      | Correction de bug                        |
| `hotfix/`   | Correctif urgent en production           |
| `chore/`    | Tâches techniques (deps, config, CI)     |
| `docs/`     | Documentation uniquement                 |
| `refactor/` | Refactor sans changement de comportement |

Exemples : `feature/user-profile`, `fix/login-redirect`, `chore/update-eslint`.
