# LarFinance — Arquitetura

## Princípios

- Monólito modular: maximizar aprendizagem e simplicidade operacional local.
- Regra financeira no domínio, não em componentes React ou handlers HTTP.
- Dados consistentes antes de automações; cada alteração deve ser testável.
- Segurança e operabilidade desde o início, sem antecipar infraestrutura de produção.
- Dependências apontam para o domínio: detalhes de React, Next.js, Prisma, HTTP e ambiente não definem regras financeiras.
- A arquitetura deve ser pragmática: aplicar padrões quando eles reduzem acoplamento ou risco financeiro, não como cerimônia.

## Stack inicial

| Camada | Escolha | Papel no LarFinance |
| --- | --- | --- |
| Framework web | Next.js (App Router) + React + TypeScript | Páginas, layouts, rotas, renderização e camada web da aplicação. |
| Estilização | Tailwind CSS | Estilização rápida, responsiva e consistente. |
| Componentes UI | shadcn/ui | Componentes reutilizáveis e acessíveis, adaptáveis ao design do projeto. |
| Formulários | React Hook Form + Zod | Estado e validação de formulários no cliente; Zod também valida os contratos recebidos pela API. |
| API | Next.js Route Handlers | Endpoints HTTP para operações do sistema. Regras de negócio ficam nos serviços de domínio, não nas rotas. |
| Domínio | Serviços TypeScript por módulo | Regras financeiras testáveis: saldo, rateio, cartão, orçamento, importação e recorrências. |
| Persistência | PostgreSQL em Docker | Banco relacional para dados financeiros, relacionamentos e consistência transacional. |
| ORM | Prisma | Schema tipado, consultas e migrations versionadas. |
| Estado local de UI | Zustand, quando necessário | Estado efêmero compartilhado, como sidebar, modal, filtros em edição e preferências visuais. Não guardar dados financeiros persistidos aqui. |
| Dados no cliente | `fetch` nativo; TanStack Query quando necessário | `fetch` para chamadas simples. TanStack Query entra para listas paginadas, cache, invalidação e sincronização de dados client-side. |
| Testes unitários e integração | Vitest | Testar regras financeiras e serviços sem depender da interface. |
| Testes E2E | Playwright | Validar login/convite e fluxos críticos de lançamentos e rateio. |
| Ambiente local | Docker Compose | Subir aplicação e PostgreSQL de forma reproduzível. |
| CI | GitHub Actions | Executar lint, typecheck, testes e build antes de integrar mudanças na `main`. |

### Decisões de stack

- Não usar React Router ou TanStack Router: o Next.js App Router será o único responsável pelas rotas.
- Não usar Axios inicialmente: o `fetch` nativo atende o projeto no cliente e no servidor.
- Não usar TanStack Query desde a primeira tela: introduzi-lo quando houver consultas client-side reutilizadas, paginação ou necessidade real de cache/invalidação.
- Não usar Zustand como fonte de verdade para saldo, lançamentos, faturas ou orçamento. Esses dados vêm da API e do PostgreSQL.
- Zod valida no cliente para boa experiência, mas toda entrada deve ser validada novamente no servidor.

## Organização sugerida

```text
src/
  app/
    (auth)/
      login/
      cadastro/
    dashboard/
    contas/
    lancamentos/
    orcamentos/
    cartoes/
    configuracoes/
    api/
    layout.tsx
    page.tsx

  components/
    ui/              # shadcn/ui
    layout/
    forms/

  modules/
    auth/
    familia/
    contas/
    lancamentos/
    orcamentos/
    cartoes/
    relatorios/

    # Estrutura interna gradual por módulo
    <modulo>/
      contracts/       # schemas Zod e DTOs de entrada/saída
      domain/          # entidades, políticas e cálculos puros
      application/     # casos de uso e fronteiras transacionais
      infrastructure/  # repositórios Prisma e adapters
      __tests__/

  lib/
    prisma.ts
    auth.ts
    money.ts
    date.ts
    utils.ts

  stores/
    ui-store.ts      # Zustand, apenas para estado visual

prisma/
  schema.prisma
  migrations/
  seed.ts

tests/
  unit/
  integration/
  e2e/

docs/
  specs/
```

Pastas internas entram somente quando ajudarem a manter uma fronteira clara; módulos pequenos podem começar com poucos arquivos. Cada módulo contém contratos/validação, serviço de domínio, repositório quando necessário e testes. Route Handlers fazem autenticação, autorização, parsing e conversão HTTP; não calculam saldo, rateio ou fatura. Server Actions podem servir formulários simples, mas não substituem a API de domínio.

## Fronteiras e dependências

```text
UI (app/components) → application (casos de uso) → domain (regras)
infrastructure (Prisma/adapters) ── implementa portas definidas por ──► application/domain
```

- `app/` e `components/` podem usar contratos e casos de uso, mas não acessam Prisma diretamente.
- Route Handlers são adaptadores web: autenticam, autorizam, validam a entrada, chamam um caso de uso e convertem o resultado para HTTP.
- `domain/` é independente de React, Next.js, Prisma, HTTP, variáveis de ambiente e banco. Suas políticas devem poder ser testadas com valores simples.
- `application/` coordena um caso de uso, a autorização contextual e, quando necessário, a transação de banco. Não renderiza UI nem contém cálculo financeiro duplicado.
- `infrastructure/` implementa persistência e integrações; não toma decisões de regra financeira. Repositórios sempre recebem e aplicam `familyId`.
- Um módulo não acessa tabelas ou repositórios internos de outro. Integrações entre módulos ocorrem por contrato ou função de aplicação explícita.
- `lib/` contém somente infraestrutura transversal mínima (`prisma`, autenticação, dinheiro, datas e utilitários realmente genéricos); não é destino para regras de negócio.

## Princípios de design

### SOLID aplicado ao projeto

- **Responsabilidade única:** componentes renderizam e interagem; handlers traduzem HTTP; casos de uso orquestram; políticas calculam; repositórios persistem.
- **Aberto/fechado:** variações estáveis, como tipos de transação, usam tipos discriminados e políticas isoladas em vez de condições espalhadas em telas e handlers.
- **Substituição:** qualquer adapter de uma porta/repositório respeita o mesmo escopo por família, contrato de erro e semântica transacional.
- **Segregação de interfaces:** portas pequenas por capacidade são preferíveis a `BaseRepository` ou interfaces genéricas extensas.
- **Inversão de dependência:** quando um caso de uso precisa ser testado sem banco ou admite mais de um adapter, ele depende de uma porta definida pelo módulo; o adapter Prisma a implementa. Não criar abstrações sem necessidade concreta.

Funções puras e tipos explícitos são preferidos. Classes só entram quando identidade, estado encapsulado ou polimorfismo real melhorarem a clareza.

### Padrões adotados

- **Application service/use case:** cada operação recebe um nome de intenção (`createExpense`, `payInvoice`, `confirmRecurringPending`) e possui entrada/saída tipadas.
- **Repository específico de agregado:** encapsula Prisma, aplica `familyId` e retorna os dados necessários à regra; não usar repositório-base genérico.
- **Policy/calculator:** saldo, rateio, ciclo de fatura e consumo de orçamento são funções puras, pequenas e testadas por tabela.
- **Value objects/funções de valor:** dinheiro e data de negócio têm helpers únicos, evitando parsing e arredondamento duplicados.
- **Command/query separation:** comandos alteram estado e consultas não o alteram, projetando apenas os dados necessários à tela ou relatório.
- **Unit of work:** operações com registros vinculados executam em uma única transação Prisma no limite da aplicação.
- **Erros de domínio tipados:** falhas previsíveis têm código estável e mensagem segura; o adaptador HTTP as mapeia sem expor erros brutos do ORM.

Event Sourcing, microserviços, CQRS com infraestrutura separada, service locator, herança de repositórios e estado global de negócio não fazem parte do MVP sem nova decisão arquitetural.

## Modelo de domínio inicial

- `Family`, `User`, `Membership` e `Invitation` isolam o espaço familiar e os papéis.
- `Account` representa conta corrente/carteira; mantém saldo inicial datado e status ativo/arquivado.
- `CreditCard` representa cartão, ciclo, vencimento e faturas.
- `Category` possui relação opcional de subcategoria e pertence à família.
- `Transaction` é o registro financeiro base; tipos: receita, despesa, transferência, ajuste e compra no cartão.
- `Split` reparte uma despesa por membro, valor ou percentual.
- `Budget` guarda valor planejado por competência e categoria.
- `Installment` liga parcelas à compra de origem e à fatura correspondente.
- `RecurringRule`, `Debt`, `ImportBatch` e `InvestmentBalance` atendem planejamento/importação/investimentos simples.

As chaves e consultas de entidades financeiras devem sempre considerar `familyId`. Valores monetários usam inteiros em centavos e o fuso de negócio é America/Sao_Paulo.

### Integridade, persistência e evolução do schema

- O banco aplica invariantes estruturais com `NOT NULL`, chaves estrangeiras, índices e constraints de unicidade; o domínio aplica regras comportamentais.
- Índices e consultas multi-tenant frequentes devem iniciar por `familyId`.
- Schema, migration e caso de uso evoluem juntos. Migrations aplicadas não são editadas; mudanças são preferencialmente aditivas e têm plano de backfill/recuperação quando necessário.
- Uma operação que cria ou altera registros relacionados — transferência, pagamento de fatura, edição com rateio, importação e reatribuição de membro — é atômica via `prisma.$transaction`.
- Não confiar em “consultar e depois inserir” para unicidade ou idempotência. Constraints do banco complementam a validação e são traduzidas em erro de domínio.
- Importações são idempotentes e validam todo o arquivo antes de iniciar sua transação de escrita.

## Fluxos consistentes

- **Saldo**: derivado de saldo inicial mais movimentações efetivadas aplicáveis. Transferência cria débitos/créditos vinculados ou lançamento composto atomicamente.
- **Cartão**: compra afeta orçamento; fatura consolida compras do ciclo. Pagamento gera transferência da conta escolhida e marca/atualiza fatura.
- **Rateio**: o serviço rejeita soma diferente do total, inclusive por arredondamento de centavos.
- **Importação**: parser → validação completa → prévia → transação de banco atômica. Erro em qualquer linha impede a escrita.
- **Recorrência**: cria pendência; somente confirmação cria transação efetiva.

### Contratos financeiros decididos

- **Transferência (D-016):** duas movimentações `TRANSFER`, uma de débito e outra de crédito, vinculadas por `Transfer` e criadas em uma única transação. Saldos por conta usam sua respectiva perna; patrimônio consolidado ignora ambas.
- **Saldo investido (D-017):** indicador manual separado, que não integra o saldo consolidado das contas nem recebe cálculo implícito na interface.
- **Categorias arquivadas (D-018):** o histórico é preservado e novos lançamentos são bloqueados; a taxonomia padrão será definida no onboarding.
- **Remoção de membro (D-019):** requer membro ativo de destino para reatribuir responsabilidades de modo atômico, preservando o autor e o histórico.

### Autenticação e sessão

- Senhas devem ser protegidas com Argon2id; nunca armazenadas ou registradas em texto puro.
- A aplicação usará sessões persistidas no PostgreSQL.
- O navegador receberá apenas um identificador de sessão aleatório em cookie `HttpOnly`, `Secure` em produção e `SameSite=Lax`.
- JWT não será implementado manualmente no MVP.
- Uma biblioteca de autenticação poderá usar JWT internamente se necessário, mas isso não deve vazar para as regras de negócio.
- Toda rota protegida deve obter o usuário e validar `familyId` e papel no servidor.

## Segurança

- Hash de senha forte; tokens e sessão tratados como credenciais.
- Autorização de papel e `familyId` executada no servidor em todo endpoint/serviço sensível.
- Validação de payload no servidor, rate limit no login e erros sem vazamento de dados.
- `.env` fora do versionamento; `.env.example` sem valores reais.
- Logs estruturados locais com IDs e contexto técnico, nunca senha, token, cookie ou segredo.

## Qualidade e entrega

- `main` recebe apenas mudanças vindas de branches curtas por feature após revisão humana.
- GitHub Actions: lint, typecheck, Vitest (unidade/integração) e build.
- Playwright cobre login/convite e lançamento/rateio; roda localmente antes do merge na primeira fase.
- Docker Compose inclui app e Postgres em volume persistente. README traz comando de backup/restauração manual.
- Seed demo é exclusivo de desenvolvimento e nunca se mistura com dados reais.
- Regras de cálculo financeiro usam testes de tabela, incluindo bordas de centavos, competência e ciclo de fatura. Casos de uso/repositórios têm testes de integração contra Postgres para transações, constraints e isolamento por `familyId`.
- Correções de defeito devem acrescentar teste de regressão quando viável. O `AGENTS.md` contém as regras operacionais para mudanças no repositório.

## Evolução posterior

Produção controlada pode adicionar deploy, backup externo, monitoramento, e-mail, E2E no CI e suporte Safari. Open Finance, formatos bancários, cotações e investimento detalhado só entram mediante nova decisão de produto/arquitetura.
