# AGENTS.md — LarFinance

## Propósito e fontes de verdade

LarFinance é um sistema web local para finanças familiares. A prioridade é **correção financeira, isolamento por família e simplicidade operacional**; conveniência de interface nunca pode violar esses objetivos.

Leia antes de alterar o código, nesta ordem:

1. `docs/PRODUCT.md` — objetivo e limites do MVP.
2. `docs/REQUIREMENTS.md` — requisitos, invariantes e critérios globais.
3. `docs/ARCHITECTURE.md` — stack e decisões de arquitetura.
4. `docs/DECISIONS.md` — decisões já tomadas.
5. A spec em `docs/specs/` que está sendo implementada.

Em conflito, o requisito mais específico e a decisão registrada prevalecem. Não implemente funcionalidade fora do MVP sem decisão humana registrada.

## Fluxo de trabalho obrigatório

1. Trabalhe em uma única spec por mudança. Leia suas dependências antes de iniciar.
2. Identifique invariantes, casos de erro, autorização e testes de aceite antes de editar código.
3. Mantenha a alteração pequena e vertical: contrato/validação → domínio → persistência → endpoint → interface → testes.
4. Execute os comandos de lint, typecheck, testes e build definidos no `package.json`/README quando existirem.
5. Atualize a spec, `docs/DECISIONS.md` ou o README quando a mudança alterar comportamento, contrato ou operação.
6. Não faça commit, push, migration destrutiva ou alteração de dependência sem revisão humana explícita.

Pare e peça decisão humana antes de: mudar um invariante financeiro, escolher a modelagem de transferência/fatura/parcelas, adicionar dependência relevante, criar migration potencialmente arriscada, enfraquecer segurança/autorização, ou resolver uma ambiguidade de produto.

## Arquitetura-alvo

O projeto é um **monólito modular**, não um conjunto de camadas globais. Organize cada contexto em `src/modules/<modulo>/` e deixe a aplicação web como adaptador fino.

```text
src/
  app/                 # rotas, páginas e Route Handlers (adapters web)
  components/          # componentes visuais reutilizáveis
  modules/
    <modulo>/
      contracts/       # schemas Zod, DTOs de entrada/saída
      domain/          # entidades, políticas e serviços puros
      application/     # casos de uso/orquestração e transações
      infrastructure/  # repositórios Prisma e adapters externos
      __tests__/
  lib/                 # infraestrutura transversal mínima: prisma, money, date, auth
  stores/              # somente estado efêmero de UI
```

Pastas podem ser introduzidas gradualmente; não crie arquivos vazios só para espelhar a estrutura. Um módulo pequeno pode começar com `contracts.ts`, `service.ts`, `repository.ts` e testes, desde que preserve as fronteiras abaixo.

### Direção das dependências

- `app/` e `components/` podem chamar casos de uso/contratos, mas não Prisma diretamente.
- Route Handlers fazem autenticação, autorização, parsing, chamada do caso de uso e mapeamento para HTTP. Não contêm cálculo de saldo, rateio, fatura, orçamento ou recorrência.
- `domain/` não importa React, Next.js, Prisma, variáveis de ambiente, HTTP nem banco. Deve ser testável com objetos simples.
- `application/` orquestra um caso de uso, autorização contextual e fronteira transacional; não renderiza UI nem contém queries ad hoc do ORM.
- `infrastructure/` implementa persistência; não decide regra financeira. Repositórios retornam dados necessários ao domínio e usam filtros obrigatórios de família.
- Um módulo não acessa tabelas/repositórios internos de outro módulo. Exponha uma função de aplicação ou contrato explícito quando houver integração.
- `lib/` não vira um depósito genérico. Código específico de negócio pertence ao módulo correspondente.

## SOLID aplicado de forma pragmática

- **Responsabilidade única:** componente renderiza/interage; handler traduz HTTP; caso de uso coordena; política de domínio calcula; repositório persiste. Não concentre tudo em um `service.ts` ou componente.
- **Aberto/fechado:** modele variações estáveis com tipos discriminados e políticas isoladas (por exemplo, tipo de transação), não com cadeias crescentes de `if` espalhadas.
- **Substituição:** toda implementação de porta/repositório deve respeitar o contrato, inclusive escopo por `familyId`, erros e semântica transacional.
- **Segregação de interfaces:** prefira portas pequenas por capacidade (`findAccountForFamily`, `saveTransaction`) a um `BaseRepository` genérico ou interface gigante.
- **Inversão de dependência:** quando um caso de uso precisar ser testado sem banco ou puder ter mais de um adapter, defina uma porta no módulo e injete o adapter. Não crie interfaces/classes abstratas sem uma necessidade concreta.

Prefira funções puras e tipos explícitos em TypeScript. Use classes somente quando identidade, estado encapsulado ou polimorfismo real tornar isso mais claro.

## Padrões permitidos e esperados

- **Value object/funções de valor:** dinheiro e datas de negócio são centralizados em `lib/money` e `lib/date`; não replique parsing, arredondamento ou formatação.
- **Application service / use case:** uma operação de negócio nomeada por intenção (`createExpense`, `payInvoice`, `confirmRecurringPending`), com input/output tipados.
- **Repository específico de agregado:** encapsula Prisma e sempre recebe `familyId`; evite `BaseRepository`, `any` e acesso ao ORM na camada web.
- **Policy/calculator:** regras como rateio, saldo, ciclo de fatura e consumo de orçamento devem ser funções puras, pequenas e testadas por tabela.
- **Command/query separation:** comandos mudam estado e retornam o resultado mínimo; consultas não alteram estado e projetam somente os dados exigidos pela tela/relatório.
- **Unit of work:** toda operação que cria/edita registros vinculados deve usar uma única `prisma.$transaction` no limite da aplicação. Exemplos: transferência, pagamento de fatura, importação, edição com rateio e reatribuição de membro.
- **Erros de domínio tipados:** erros previsíveis devem ter código estável e mensagem segura; o handler os converte para HTTP. Não exponha erro bruto de Prisma nem use `catch` vazio.

Não aplique padrões “por catálogo”: Event Sourcing, CQRS com infraestrutura separada, microserviços, service locator, herança de repositórios e singleton de estado de negócio estão fora do MVP, salvo decisão documentada.

## Regras financeiras inegociáveis

- Valores financeiros são inteiros em centavos, sempre em BRL. Nunca use `number` com frações, `float`, `toFixed` como cálculo ou arredondamento implícito.
- Datas de negócio usam `America/Sao_Paulo`. Distinguir data de competência de data de lançamento; não usar o fuso do navegador como fonte de verdade.
- Toda entidade financeira e toda consulta mutável/leitura sensível deve ser escopada por `familyId` no servidor e no banco quando possível.
- Saldo é derivado do saldo inicial datado mais movimentos efetivados. Não o trate como fonte de verdade materializada sem uma decisão e estratégia de reconciliação.
- Transferência não altera patrimônio consolidado. Deve ser persistida atomicamente, com vínculo que permita rastrear as duas pernas ou a transação composta definida no contrato.
- Compra no cartão entra no orçamento pela competência; somente pagamento da fatura altera a conta de origem. Pagamento é transferência vinculada, nunca nova despesa.
- Parcelas, faturas, rateios, importações e recorrências devem conservar vínculo com a origem. Rateios somam exatamente o total em centavos.
- Pendência de recorrência não é transação efetivada. Dívida manual não gera despesa automaticamente.
- Lançamentos financeiros não são apagados definitivamente; cancelamento preserva histórico e remove efeito conforme o contrato.

Uma alteração financeira deve recalcular todas as projeções afetadas (saldo, orçamento, fatura, relatórios) dentro de uma semântica consistente e testada.

## Persistência, migrations e concorrência

- Use Prisma com PostgreSQL; schema, migration e serviço devem evoluir juntos.
- Use `NOT NULL`, chaves estrangeiras, índices e unicidade para invariantes estruturais. Validações de negócio continuam no domínio.
- Indices e filtros de entidades da família devem começar por `familyId` quando forem consultas multi-tenant frequentes.
- Toda migration deve ser aditiva e reversível na prática quando possível. Não editar migration já aplicada; crie outra migration.
- Antes de remover/renomear dados, planeje backfill, compatibilidade e recuperação. Pare para revisão humana quando houver risco aos dados.
- Não faça “check then insert” fora de transação quando unicidade/idempotência importa. Traduza violação de constraint em erro de domínio compreensível.
- Importação deve validar o arquivo inteiro antes de escrever e persistir tudo em uma única transação; reenvio precisa de estratégia de idempotência.

## Web, UI e API

- Server Components são padrão para leitura simples; Client Components só quando houver interatividade ou estado de navegador necessário.
- Formulários usam React Hook Form + Zod para UX, mas a mesma entrada é obrigatoriamente validada no servidor.
- `fetch` nativo é o padrão. Introduza TanStack Query apenas para cache/invalidação/paginação reutilizada no cliente. Zustand guarda somente estado visual efêmero.
- Não duplique fontes de verdade de dados financeiros em estado do cliente.
- Toda página deve prever carregamento, vazio, erro e retry; ações destrutivas/cancelamentos exigem confirmação explícita.
- Interface é responsiva a partir de 360 px, com tema escuro e contraste básico. Não esconder informação financeira essencial apenas em `hover`.
- APIs devem validar payload, autenticar, autorizar papel e `familyId`, e responder erros consistentes. Nunca confiar em `familyId`, papel ou total enviado pelo cliente.

## Segurança e privacidade

- Senhas usam Argon2id. Sessões persistidas são identificadas por cookie `HttpOnly`, `SameSite=Lax` e `Secure` em produção.
- Não implementar JWT manualmente no MVP.
- Não registrar senha, token, cookie, sessão, `Authorization`, segredo ou dados de `.env` em logs, testes ou mensagens de erro.
- Aplicar rate limit em login e evitar enumeração de e-mail em falhas de autenticação.
- “Pessoal” significa atribuição/filtro, não privacidade: os dados continuam visíveis aos membros da mesma família.

## Testes e definição de pronto

- Teste políticas e cálculos financeiros com Vitest, usando tabelas de casos e bordas de centavos/datas.
- Teste casos de uso e repositórios contra PostgreSQL de teste para transações, constraints e isolamento por `familyId`.
- Playwright cobre pelo menos cadastro/login/convite e lançamento/rateio; adicione E2E para novos fluxos críticos.
- Cada correção de bug recebe um teste que falhava antes da correção quando viável.
- A mudança está pronta somente com lint, typecheck, testes aplicáveis e build verdes, além dos critérios de aceite da spec.

## Documentação e limites de agente

- Escreva specs em `docs/specs/` antes de features relevantes; não altere a sequência sem autorização do responsável pelo produto.
- Registre decisões arquiteturais/produto em `docs/DECISIONS.md` com contexto, escolha e consequência.
- Preserve mudanças existentes do usuário e não faça `git reset --hard`, `git checkout --`, remoção recursiva ou sobrescrita ampla.
- Não leia nem exponha segredos. Mantenha `.env` fora do Git e atualize somente `.env.example` com valores fictícios quando necessário.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
