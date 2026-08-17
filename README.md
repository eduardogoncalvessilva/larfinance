# LarFinance

Sistema web local de controle financeiro familiar. A primeira etapa entrega a fundação técnica; as funcionalidades de produto são implementadas pelas specs em `docs/specs/`.

## Pré-requisitos

- Node.js 22 ou superior.
- Docker Desktop em execução para subir o PostgreSQL local.

## Inicialização local

1. Copie `.env.example` para `.env`. A URL padrão usa `127.0.0.1:55432` para não conflitar com um PostgreSQL local que já ocupe as portas comuns.
2. Execute `docker compose up --build`.
3. Acesse `http://localhost:3000` e `http://localhost:3000/api/health`.

O Compose aplica migrations antes de iniciar a aplicação. Para executar a interface no host, mantenha somente o banco no Docker com `docker compose up -d db`, então use `npm run dev`.

## Comandos de qualidade

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
```

`npm run test` executa testes unitários e de integração. `npm run test:integration` exige PostgreSQL acessível pela `DATABASE_URL` do `.env`; `npm run test:unit` não exige Docker. O teste E2E inicia a aplicação automaticamente.

## Seed de demonstração

Com o banco iniciado, execute `npm run db:seed`. O script se recusa a rodar com `NODE_ENV=production` e, na fundação técnica, não grava dados de domínio.

## Backup e restauração manual

Com o Compose em execução, crie um backup:

```bash
docker compose exec -T db pg_dump -U larfinance -d larfinance > backup-larfinance.sql
```

Restaure um backup confirmado:

```bash
Get-Content -Raw backup-larfinance.sql | docker compose exec -T db psql -U larfinance -d larfinance
```

Antes de restaurar, faça um backup do estado atual. A restauração altera os dados do banco local.
