# LarFinance — Registro de Decisões

Formato: cada decisão registra contexto, escolha e consequência. Este arquivo é a memória breve do projeto; decisões grandes podem apontar para uma spec/ADR futura.

| ID | Decisão | Escolha | Consequência |
| --- | --- | --- | --- |
| D-001 | Escopo inicial | Uma família, vários membros, local primeiro | Modelar `Family` desde o início, sem operar multi-tenant público ainda. |
| D-002 | Visibilidade | Dados compartilhados; “pessoal” é atribuição/filtro | Sem privacidade de valores; relatórios podem filtrar por responsável. |
| D-003 | Contas | Corrente/carteira, cartão e saldo investido simples | Não implementar carteira de ativos/cotações/impostos. |
| D-004 | Entrada de dados | Manual + CSV próprio com prévia | Não suportar extratos/formato de banco no MVP. |
| D-005 | Orçamento | Mensal por categoria de despesa | Sem rollover, envelopes ou orçamento de receita. |
| D-006 | Cartão | Vários cartões, fatura/vencimento e parcelas | Pagamento é transferência, não despesa duplicada. |
| D-007 | Planejamento | Recorrências pendentes, dívidas manuais, parcelas automáticas | Sem juros/amortização automática; pendência exige confirmação. |
| D-008 | Acesso | E-mail/senha, convite por token, administrador/membro | Recuperação/OAuth ficam fora da primeira fase. |
| D-009 | Auditoria | Autor e timestamps; cancelamento preserva lançamento | Não implementar trilha completa de alterações no MVP. |
| D-010 | Execução | Docker Compose + Postgres persistente + backup manual | Sem deploy/backup externo na fase local. |
| D-011 | Stack | Next.js/React/TypeScript, API Routes e serviços, Prisma/Postgres | Monólito modular; não adotar backend separado ou microserviços. |
| D-012 | Testes | Vitest + Playwright | Unidades, integração e E2E de identidade/lançamentos/rateio. |
| D-013 | Git/CI | `main` + branches por feature; GitHub Actions | Lint, typecheck, testes e build verdes antes de integração. |
| D-014 | Governança de agentes | Specs por feature, revisão humana e pontos de parada definidos | Agente consulta humano em decisões de alto impacto; não commita sem revisão. |
| D-015 | Documentação | PRODUCT, REQUIREMENTS, ARCHITECTURE, DECISIONS + AGENTS, README e specs | Documentos vivos, atualizados com decisões e obstáculos reais. |
