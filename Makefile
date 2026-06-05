.DEFAULT_GOAL := help

# ─── Variables ────────────────────────────────────────────────────────────────
CONTAINER_POSTGRES := commissionpro_postgres
CONTAINER_APP      := commissionpro_app
DB_USER            := commissionpro
DB_NAME            := commissionpro

# ─── Help ─────────────────────────────────────────────────────────────────────
.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}' \
		| sort

# ─── Docker ───────────────────────────────────────────────────────────────────
.PHONY: up
up: ## Démarrer et afficher les logs (hot reload actif)
	docker compose up

.PHONY: start
start: ## Démarrer en arrière-plan
	docker compose up -d

.PHONY: down
down: ## Arrêter tous les containers
	docker compose down

.PHONY: restart
restart: ## Redémarrer tous les containers
	docker compose restart

.PHONY: rebuild
rebuild: ## Rebuild l'image app et redémarrer
	docker compose up --build

.PHONY: destroy
destroy: ## Supprimer containers, images et volumes
	docker compose down --rmi all --volumes --remove-orphans

.PHONY: ps
ps: ## Statut des containers
	docker compose ps

.PHONY: logs
logs: ## Logs de tous les containers (follow)
	docker compose logs -f

.PHONY: logs-db
logs-db: ## Logs PostgreSQL (follow)
	docker compose logs -f postgres

.PHONY: logs-app
logs-app: ## Logs Next.js (follow)
	docker compose logs -f app

# ─── Shells ───────────────────────────────────────────────────────────────────
.PHONY: shell-app
shell-app: ## Shell dans le container Next.js
	docker exec -it $(CONTAINER_APP) sh

.PHONY: shell-db
shell-db: ## Shell bash dans le container PostgreSQL
	docker exec -it $(CONTAINER_POSTGRES) bash

.PHONY: pgadmin
pgadmin: ## Ouvrir pgAdmin dans le navigateur (http://localhost:5051)
	open http://localhost:5051 || xdg-open http://localhost:5051

.PHONY: psql
psql: ## Console psql dans la base commissionpro
	docker exec -it $(CONTAINER_POSTGRES) psql -U $(DB_USER) -d $(DB_NAME)

# ─── Database ─────────────────────────────────────────────────────────────────
.PHONY: db-reset
db-reset: ## Supprimer et recréer le volume PostgreSQL
	docker compose down -v
	docker compose up -d

# ─── Prisma ───────────────────────────────────────────────────────────────────
.PHONY: migrate
migrate: ## Créer et appliquer une migration (usage: make migrate name=init)
	docker exec -it $(CONTAINER_APP) npx prisma migrate dev --name $(name)

.PHONY: migrate-reset
migrate-reset: ## Reset complet de la base + migrations
	docker exec -it $(CONTAINER_APP) npx prisma migrate reset --force

.PHONY: migrate-deploy
migrate-deploy: ## Appliquer les migrations en production
	docker exec -it $(CONTAINER_APP) npx prisma migrate deploy

.PHONY: prisma-generate
prisma-generate: ## Générer le client Prisma
	docker exec -it $(CONTAINER_APP) npx prisma generate

.PHONY: prisma-studio
prisma-studio: ## Ouvrir Prisma Studio (port 5555)
	docker exec -it $(CONTAINER_APP) npx prisma studio --port 5555 --hostname 0.0.0.0

.PHONY: prisma-push
prisma-push: ## Push le schema sans migration (dev only)
	docker exec -it $(CONTAINER_APP) npx prisma db push

.PHONY: seed
seed: ## Insérer les données de démonstration
	docker exec -it $(CONTAINER_APP) sh -c "TS_NODE_COMPILER_OPTIONS='{\"module\":\"CommonJS\"}' npx ts-node prisma/seed.ts"

# ─── Build ────────────────────────────────────────────────────────────────────
.PHONY: build
build: ## Builder l'application Next.js
	docker exec -it $(CONTAINER_APP) npm run build

.PHONY: lint
lint: ## Linter le code
	docker exec -it $(CONTAINER_APP) npm run lint

.PHONY: typecheck
typecheck: ## Vérifier les types TypeScript
	docker exec -it $(CONTAINER_APP) npx tsc --noEmit
