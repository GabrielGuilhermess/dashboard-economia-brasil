# Dashboard Economia Local

Camada de orquestracao local para `dashboard-economia/` e, opcionalmente, `dashboard-economia-backend/` como referencia.

## Pre-requisitos

- Docker
- Docker Compose v2

## Variaveis de ambiente

1. Copie `dashboard-economia-local/.env.example` para `dashboard-economia-local/.env` se quiser ajustar portas, URLs ou timeouts.
2. Em Linux, ajuste `UID` e `GID` no `.env` com `id -u` e `id -g` para manter ownership coerente no bind mount do frontend.
3. Use `dashboard-economia-backend/.env.example` e `dashboard-economia/.env.example` como referencia para execucao isolada de cada repositorio.

## Desenvolvimento

Subir somente o frontend com hot reload, snapshots locais e sem Nest no runtime:

```bash
docker compose --env-file .env -f compose.dev.yml up --build
```

O frontend gera snapshots em `public/data/` antes de subir e passa a ler apenas esses arquivos estaticos.

Se quiser manter o backend Nest apenas como referencia durante a migracao local:

```bash
docker compose --env-file .env --profile reference-backend -f compose.dev.yml up --build
```

## Producao local

Buildar e subir apenas o frontend estatico em modo producao:

```bash
docker compose --env-file .env -f compose.prod.yml up --build -d
```

Nesse fluxo o backend Nest nao participa do runtime. Os JSONs sao regenerados durante o build e o container final apenas serve os arquivos exportados.

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
- Dados estaticos: `http://localhost:3000/data/summary.json`
- Backend de referencia em dev: `http://localhost:3001/api/economia/summary` com o profile `reference-backend`

## Producao estatica

- Producao passa a depender apenas do build estatico do frontend e dos snapshots gerados em `public/data/`.
- O backend Nest pode continuar no repositorio por um ciclo curto, mas fica fora do deploy de producao.
- O redeploy horario deve ser acionado pelo workflow `.github/workflows/vercel-static-redeploy.yml`.
- Configure o secret `VERCEL_DEPLOY_HOOK_URL` no GitHub com a URL do Deploy Hook do projeto no Vercel.
