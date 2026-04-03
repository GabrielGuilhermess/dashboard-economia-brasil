FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_USE_MOCKS=false
ARG API_TIMEOUT_MS=10000
ARG BCB_SGS_BASE_URL=https://api.bcb.gov.br/dados/serie/bcdata.sgs
ARG BCB_PTAX_BASE_URL=https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata
ARG IBGE_AGREGADOS_BASE_URL=https://servicodados.ibge.gov.br/api/v3/agregados
ARG IBGE_MALHAS_BASE_URL=https://servicodados.ibge.gov.br/api/v3/malhas

ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_USE_MOCKS=${NEXT_PUBLIC_USE_MOCKS}
ENV API_TIMEOUT_MS=${API_TIMEOUT_MS}
ENV BCB_SGS_BASE_URL=${BCB_SGS_BASE_URL}
ENV BCB_PTAX_BASE_URL=${BCB_PTAX_BASE_URL}
ENV IBGE_AGREGADOS_BASE_URL=${IBGE_AGREGADOS_BASE_URL}
ENV IBGE_MALHAS_BASE_URL=${IBGE_MALHAS_BASE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV STATIC_DIR=out

COPY --from=builder --chown=node:node /app/out ./out
COPY --from=builder --chown=node:node /app/scripts ./scripts

USER node

EXPOSE 3000

CMD ["node", "scripts/serve-static.mjs"]
