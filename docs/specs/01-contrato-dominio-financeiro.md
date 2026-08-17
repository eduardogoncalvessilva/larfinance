# Spec 01 — Contrato do domínio financeiro

**Depende de:** Spec 00.

## 1. Objetivo

Definir o contrato de dados e os invariantes que tornam os valores financeiros auditáveis antes que qualquer endpoint ou tela possa alterá-los.

## 2. Escopo

- Modelar em Prisma os fundamentos transversais: `User`, `Family`, `Membership`, `Session`, `Account`, `Category` e `Transaction`.
- Criar tipos/enums para papéis, status e tipos de transação já definidos no produto.
- Definir auditoria: criador, atualizador e timestamps; definir `familyId` em entidades financeiras.
- Criar helpers únicos para dinheiro em centavos e datas civis no fuso `America/Sao_Paulo`.
- Definir constraints, chaves estrangeiras e índices essenciais; criar migrations iniciais e testes de persistência.
- Registrar os contratos de status, cancelamento, saldo e transferência em `docs/DECISIONS.md` antes de persistir transações.

## 3. Fora de Escopo

- Login, endpoints, formulários, listagens e cálculos completos de saldo.
- Modelar prematuramente todos os campos de cartão, orçamento, recorrência, dívida ou importação.
- Saldo materializado, trilha completa de versões ou exclusão física de lançamentos.

## 4. Regras de Negócio

- Todo valor financeiro é um inteiro de centavos em BRL; valores com fração de centavo são inválidos.
- Datas de competência e lançamento são datas de negócio interpretadas no fuso `America/Sao_Paulo`.
- Dados financeiros pertencem a uma família; consulta ou mutação sem escopo de `familyId` é inválida.
- Movimentações não são excluídas definitivamente; o contrato define status efetivado/cancelado e quais status impactam projeções.
- Saldo é derivado de saldo inicial e movimentações efetivadas; não pode ser salvo como fonte de verdade nesta fase.
- A representação de transferência deve ser única e atômica. A implementação não pode escolher entre duas pernas e transação composta sem decisão registrada.

## 5. Fluxo Principal

1. O desenvolvedor lê requisitos, arquitetura e decisões pendentes do domínio.
2. Define tipos, schema e constraints para os agregados fundamentais.
3. Implementa helpers de dinheiro/data e testes de borda.
4. Aplica a migration em banco vazio e valida que as constraints rejeitam registros inválidos.
5. Se uma decisão financeira estiver ambígua, interrompe a implementação e registra/solicita a decisão antes de ampliar o schema.

## 6. Critérios de Aceite

- Migration é aplicada em banco vazio e o Prisma gera cliente tipado sem erros.
- Nenhuma entidade financeira fundamental é persistível sem `familyId`, auditoria ou campos obrigatórios definidos pelo contrato.
- Helpers não usam ponto flutuante nem o fuso local do navegador como fonte de verdade.
- Constraints cobrem relações familiares, unicidades relevantes e integridade referencial inicial.
- As decisões financeiras pendentes estão resolvidas ou explicitamente bloqueadas antes do schema que delas depende.

## 7. Testes Esperados

- Unitários para conversão/soma/comparação de centavos, parsing de BRL e conversão de datas civis.
- Integração com Postgres para relações, constraints, unicidades e isolamento por `familyId`.
- Teste de migration em banco vazio.
- Não há E2E nesta spec, pois ainda não existe fluxo de produto.

## 8. Restrições e Decisões Técnicas

- O domínio não importa React, Next.js, Prisma, HTTP ou variáveis de ambiente; Prisma fica no adapter de persistência.
- O banco protege invariantes estruturais; políticas comportamentais continuam no domínio.
- Migrations aplicadas não são editadas. Qualquer evolução ocorre em nova migration, com plano de backfill quando necessário.
- Não introduzir `BaseRepository`, Event Sourcing ou abstrações para entidades ainda inexistentes.

## 9. Plano de Implementação

1. Registrar decisões de contrato pendentes e mapear os agregados fundamentais.
2. Criar helpers de `money` e `date`, tipos de domínio e testes unitários.
3. Implementar schema Prisma, constraints e migration inicial.
4. Criar adapters/repositórios mínimos somente para testes de persistência.
5. Executar testes de migration/integração e revisar o contrato contra `REQUIREMENTS.md`.
