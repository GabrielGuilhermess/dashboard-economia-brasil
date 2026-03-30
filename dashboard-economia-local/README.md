# Dashboard Economia Local

Camada de orquestracao local para `dashboard-economia/` e `dashboard-economia-backend/`.

## Pre-requisitos

- Docker
- Docker Compose v2

## Variaveis de ambiente

1. Copie `dashboard-economia-local/.env.example` para `dashboard-economia-local/.env` se quiser ajustar portas, URLs ou timeouts.
2. Use `dashboard-economia-backend/.env.example` e `dashboard-economia/.env.example` como referencia para execucao isolada de cada repositorio.

## Desenvolvimento

Subir backend e frontend com hot reload:

```bash
docker compose --env-file .env -f compose.dev.yml up --build
```

## Producao local

Buildar e subir backend e frontend em modo producao:

```bash
docker compose --env-file .env -f compose.prod.yml up --build -d
```

## Derrubar

Desligar qualquer modo:

```bash
docker compose -f compose.dev.yml down
docker compose -f compose.prod.yml down
```

## Rebuild

Refazer as imagens sem reaproveitar cache:

```bash
docker compose --env-file .env -f compose.dev.yml build --no-cache
docker compose --env-file .env -f compose.prod.yml build --no-cache
```

## Endpoints locais

- Frontend: `http://localhost:3000/dashboard`
- Backend: `http://localhost:3001/api/economia/summary`
