# Spec 00 — Fundação técnica

## 1. Objetivo

Criar uma base local e reproduzível para desenvolver o LarFinance com segurança, qualidade e ciclos curtos de validação.

## 2. Escopo

- Inicializar Next.js (App Router), React, TypeScript, Tailwind e a estrutura de pastas definida em `docs/ARCHITECTURE.md`.
- Subir aplicação e PostgreSQL por Docker Compose, com volume persistente para o banco.
- Configurar Prisma, uma migration de verificação e acesso por variáveis de ambiente.
- Configurar scripts de lint, typecheck, testes Vitest, testes E2E Playwright e build; criar workflow de CI para executá-los.
- Criar `.env.example`, README de inicialização/backup/restauração e seed somente para desenvolvimento.
- Entregar layout-base com tema escuro, responsividade mínima, página de erro e estado de retry.

## 3. Fora de Escopo

- Cadastro, login, entidades de produto, regras financeiras e telas de negócio.
- Integração externa, deploy, backup automático ou dados reais no seed.
- Instalação antecipada de TanStack Query, Zustand ou componentes shadcn que não sejam necessários ao layout-base.

## 4. Regras de Negócio

- A aplicação deve executar localmente sem depender de serviços externos.
- O volume do PostgreSQL deve sobreviver à reinicialização normal dos containers.
- Seeds de demonstração só podem executar em ambiente de desenvolvimento e nunca podem ser acionados automaticamente contra dados reais.
- Segredos não podem ser versionados, exibidos em logs nem incluídos em `.env.example`.

## 5. Fluxo Principal

1. A pessoa clona o projeto, copia `.env.example` para `.env` e preenche valores locais.
2. Executa o comando documentado para subir a aplicação e o banco.
3. A aplicação aplica migrations e responde em uma rota de saúde ou página inicial.
4. Em desenvolvimento, a pessoa pode executar o seed explicitamente.
5. Se conexão, variável obrigatória ou migration falhar, a inicialização informa o problema sem revelar segredos e o README orienta a correção.

## 6. Critérios de Aceite

- `docker compose up` inicia app e PostgreSQL com persistência comprovada após reinício.
- Prisma conecta ao banco local e aplica uma migration em banco vazio.
- Lint, typecheck, Vitest, Playwright e build possuem scripts documentados; o CI executa lint, typecheck, testes e build.
- README documenta inicialização, variáveis, backup, restauração e seed de desenvolvimento.
- A interface-base funciona em 360 px, possui tema escuro e apresenta erro/retry compreensível.

## 7. Testes Esperados

- Unitário: teste de fumaça de utilitário/configuração que não dependa de rede.
- Integração: conexão do Prisma com o Postgres de teste e aplicação da migration.
- E2E: abertura da rota inicial e exibição de fallback de erro controlado.
- CI: execução dos scripts em ambiente limpo.

## 8. Restrições e Decisões Técnicas

- Usar somente Next.js App Router; não adicionar React Router ou TanStack Router.
- PostgreSQL é o banco de desenvolvimento e Prisma é a única camada de acesso persistente.
- A configuração de teste não deve reutilizar o banco de desenvolvimento.
- Esta spec prepara a estrutura, mas não cria uma camada de domínio genérica nem repositórios-base.

## 9. Plano de Implementação

1. Criar o projeto TypeScript/Next, Tailwind e a estrutura mínima de diretórios.
2. Adicionar Docker Compose, Prisma, variáveis de ambiente e migration de verificação.
3. Configurar lint, typecheck, Vitest, Playwright, scripts e workflow de CI.
4. Criar layout-base, fallback de erro e teste E2E de fumaça.
5. Documentar operação local, seed, backup e restauração; revisar todos os comandos em ambiente limpo.

## 10. Como testar

1. Confirme que o Docker Desktop está em execução e copie `.env.example` para `.env` caso o arquivo ainda não exista.
2. Valide a configuração dos containers com `docker compose config`.
3. Suba o banco com `docker compose up -d db` (a porta padrão no host é `55432`), aguarde o healthcheck e execute `npm run db:deploy`.
4. Execute `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:integration` e `npm run build`.
5. Execute `npm run test:e2e`; ele inicia a aplicação e verifica a página inicial no Chromium.
6. Para uma verificação manual completa, execute `docker compose up --build`, abra `http://localhost:3000` e `http://localhost:3000/api/health`, então reinicie os containers para confirmar que o volume do banco permanece.

`docker compose down` preserva o volume. Não use `docker compose down -v` sem querer apagar os dados locais.
