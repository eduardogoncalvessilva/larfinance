# Spec 07 — Dashboard e saldo investido

**Depende de:** Specs 04 e 06.

## 1. Objetivo

Oferecer uma visão imediata e confiável do cenário financeiro da família: saldos, movimentações recentes e total investido informado manualmente.

## 2. Escopo

- Exibir saldo de cada conta ativa/arquivada com histórico, saldo consolidado e lançamentos recentes da família.
- Cadastrar e editar o saldo investido total manual, com autor e data da última atualização.
- Exibir o saldo investido de acordo com a decisão de patrimônio registrada na Spec 01.
- Tratar estados de carregamento, vazio, erro e retry; garantir responsividade a partir de 360 px.
- Criar consultas eficientes, isoladas por família e baseadas nos mesmos serviços de saldo do livro-caixa.

## 3. Fora de Escopo

- Carteira de ativos, cotações, rentabilidade, impostos, histórico detalhado de investimentos e integração com corretoras.
- Gráficos analíticos, metas, orçamento, faturas e relatórios completos.
- Criar movimentação de conta a partir da edição do saldo investido.

## 4. Regras de Negócio

- Saldo por conta e consolidado usam exclusivamente a política de saldo do livro-caixa e consideram apenas movimentos efetivados.
- Lançamentos recentes respeitam cancelamento, escopo familiar e ordenação estável por data de lançamento/atualização conforme contrato de consulta.
- Saldo investido é um valor total manual em centavos, BRL, compartilhado pela família e não representa ativos individuais ou rendimento.
- Alterar saldo investido não altera saldo de conta, orçamento, fatura ou transação.
- A forma de exibir saldo investido no patrimônio consolidado deve seguir a decisão explícita da Spec 01; sem essa decisão, a tela o apresenta como indicador separado e não soma valores implicitamente.
- Dados pessoais continuam visíveis à família; o dashboard não cria uma regra de privacidade diferente.

## 5. Fluxo Principal

1. Membro autenticado abre o dashboard da própria família.
2. O sistema busca saldos derivados, lançamentos recentes e o último saldo investido registrado.
3. A tela mostra resumo e listas correspondentes; se não houver lançamentos/investimentos, explica o estado vazio e oferece ação permitida.
4. Administrador ou papel definido pelo contrato informa/atualiza o saldo investido manual.
5. Em falha de consulta, registro inválido ou tentativa de usar dados de outra família, o sistema não exibe dados indevidos e mostra retry/erro compreensível.

## 6. Critérios de Aceite

- Saldos exibidos coincidem com os resultados da política usada no livro-caixa para dados conhecidos.
- Dashboard apresenta somente dados da família atual e ignora movimentações canceladas nas projeções.
- Saldo investido aceita apenas centavos válidos, registra auditoria e não cria movimentação financeira.
- O tratamento de patrimônio investido é explícito e consistente com a decisão registrada; não há soma implícita na UI.
- Tela funciona em 360 px e cobre carregamento, vazio, erro e retry.

## 7. Testes Esperados

- Unitários para composição dos indicadores e separação/integração do saldo investido conforme decisão registrada.
- Integração para consulta de saldos/recentes por família, exclusão de cancelados e auditoria de saldo investido.
- E2E para visualização de dashboard, estado vazio e atualização do saldo investido por usuário autorizado.

## 8. Restrições e Decisões Técnicas

- Dashboard é uma query/projeção; não recalcula regras em componentes nem mantém cópia persistente de saldo.
- Consultas de saldo usam serviço/policy de domínio compartilhado; não criar SQL/Prisma divergente em cada card.
- Saldo investido tem caso de uso e repositório próprios, com `familyId` obrigatório e validação no servidor.
- Não introduzir cache cliente global; TanStack Query só entra se a tela adquirir necessidade real de invalidação/reuso.

## 9. Plano de Implementação

1. Registrar/verificar decisão sobre composição do patrimônio investido e contratos da projeção.
2. Implementar queries de saldo/recentes reutilizando políticas do livro-caixa, com testes de integração.
3. Implementar caso de uso e persistência do saldo investido, com auditoria e autorização.
4. Criar dashboard responsivo com cards, listas e estados de tela.
5. Adicionar E2E, validar números com massa conhecida e revisar desempenho das consultas.
