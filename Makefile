.PHONY: help dev typecheck lint format db-migrate db-seed db-reset final-check build docker-build docker-run deploy clean

help:
	@echo "Dashboard Development & Deployment Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Start development server with hot reload"
	@echo "  make typecheck        - Run TypeScript type checking on entire project"
	@echo "  make lint             - Run ESLint on all files"
	@echo "  make format           - Format code with Prettier (if available)"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate       - Run pending Prisma migrations (dev mode)"
	@echo "  make db-seed          - Seed database with initial data"
	@echo "  make db-init          - Initialize DB and run migrations + seed"
	@echo "  make db-init-seed     - Initialize DB with explicit seed flag"
	@echo "  make db-reset         - Reset entire database (dev only, destructive!)"
	@echo "  make db-studio        - Open Prisma Studio"
	@echo ""
	@echo "Pre-Build Checks:"
	@echo "  make final-check      - Run all checks before build (typecheck, lint, migrations)"
	@echo ""
	@echo "Build & Deploy:"
	@echo "  make build            - Build Next.js production bundle"
	@echo "  make docker-build     - Build Docker image"
	@echo "  make docker-run       - Run application locally via Docker"
	@echo "  make docker-compose-up   - Start full stack with Docker Compose"
	@echo "  make docker-compose-down - Stop Docker Compose stack"
	@echo "  make deploy           - Deploy to production (placeholder)"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean            - Clean build artifacts and caches"
	@echo "  make help             - Show this help message"

# Development
dev:
	npm run dev

typecheck:
	npx tsc --noEmit

lint:
	npm run lint

format:
	@command -v prettier >/dev/null 2>&1 && npx prettier --write . || echo "Prettier not installed, skipping format"

# Database operations
db-migrate:
	npm run db:migrate

db-seed:
	npm run db:seed

db-init:
	npm run db:init

db-init-seed:
	npm run db:init:seed

db-reset:
	@echo "⚠️  Warning: This will DELETE all data in the database!"
	@read -p "Type 'yes' to confirm: " confirm && [ "$$confirm" = "yes" ] && npm run db:reset || echo "Cancelled"

db-studio:
	npm run db:studio

# Pre-build checks
final-check: typecheck lint db-migrate
	@echo "✅ All pre-build checks passed!"

# Build
build: typecheck
	npm run build

# Docker operations
docker-build:
	docker build -t jasonw404/dashboard:latest .

docker-run: docker-build
	docker run -p 3001:3000 --env-file .env jasonw404/dashboard:latest

docker-compose-up:
	docker-compose up -d

docker-compose-down:
	docker-compose down

# Deploy (placeholder - customize based on your deployment platform)
deploy: final-check build docker-build
	@echo "🚀 Ready to deploy!"
	@echo "Next steps depend on your deployment platform (Vercel, Railway, AWS, etc.)"

# Utilities
clean:
	rm -rf .next
	rm -rf dist
	rm -rf node_modules/.cache
	@echo "✅ Cleaned build artifacts"

install:
	npm install

# Watch type checking (optional, for development)
typecheck-watch:
	npx tsc --noEmit --watch
