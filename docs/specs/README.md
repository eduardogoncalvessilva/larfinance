# Roadmap de specs — LarFinance

Cada spec é deliberadamente pequena e só deve ser iniciada quando suas dependências estiverem concluídas, com testes verdes. A numeração é a ordem proposta de integração na `main`; não é uma ordem de prioridade absoluta de produto.

| Ordem | Spec | Resultado que desbloqueia | Depende de |
| --- | --- | --- | --- |
| 00 | [Fundação técnica](00-fundacao-tecnica.md) | Ambiente local reproduzível e pipeline de qualidade | — |
| 01 | [Contrato do domínio financeiro](01-contrato-dominio-financeiro.md) | Modelo de dados e invariantes sem ambiguidade | 00 |
| 02 | [Acesso e configuração inicial](02-acesso-e-configuracao-inicial.md) | Família isolada, administrador e primeiro cenário | 01 |
| 03 | [Cadastros financeiros](03-cadastros-financeiros.md) | Contas e categorias administráveis | 02 |
| 04 | [Livro-caixa e saldos](04-livro-caixa-e-saldos.md) | Receitas, despesas, ajustes, transferências e saldo confiável | 03 |
| 05 | [Membros e convites](05-membros-e-convites.md) | Família com múltiplos membros e responsabilidades consistentes | 04 |
| 06 | [Lançamentos, filtros e rateio](06-lancamentos-filtros-e-rateio.md) | Operação cotidiana de lançamentos e divisão entre membros | 04, 05 |
| 07 | [Dashboard e saldo investido](07-dashboard-e-saldo-investido.md) | Visão imediata do cenário familiar | 04, 06 |
| 08 | [Orçamento mensal](08-orcamento-mensal.md) | Planejado versus realizado por categoria | 06 |
| 09 | [Cartões, faturas e parcelas](09-cartoes-faturas-e-parcelas.md) | Compras no cartão sem duplicar despesas | 04, 08 |
| 10 | [Planejamento e dívidas](10-planejamento-e-dividas.md) | Recorrências confirmáveis, dívidas e pendências | 06 |
| 11 | [Relatórios](11-relatorios.md) | Análise histórica consistente | 07, 08, 09, 10 |
| 12 | [Importação CSV](12-importacao-csv.md) | Migração em lote segura de histórico | 06, 09 |
| 13 | [Central de pendências, notificações e acabamento](13-pendencias-notificacoes-e-acabamento.md) | Vencimentos visíveis e requisitos de experiência consolidados | 09, 10, 11 |

## Convenções de execução

- Uma spec gera uma branch curta e um PR. Não misturar mudanças de specs diferentes.
- Antes de codificar, copiar os critérios desta spec para a descrição do PR e detalhar somente os contratos que ela tocar.
- O contrato definido na spec 01 é a fonte de verdade para dinheiro, datas, efetivação, cancelamento e vínculos financeiros. Alterá-lo exige atualizar `docs/DECISIONS.md` antes da migration.
- A coluna “depende de” considera integração, não pesquisa. Um protótipo ou investigação pode ocorrer antes, sem introduzir schema ou código de produção.
- Cada spec precisa concluir com lint, typecheck, testes apropriados e build verdes. Os E2E indicados são cumulativos.

## Pontos que exigem decisão humana antes da spec 01

1. Definir a representação de uma transferência: duas movimentações espelhadas vinculadas ou uma transação composta com duas pernas. A escolha afeta saldo, importação e relatórios.
2. Definir se o saldo investido entra no patrimônio consolidado exibido no dashboard ou aparece apenas como indicador separado. O produto diz “saldo investido compartilhado”, mas não fixa a fórmula do patrimônio.
3. Aprovar a taxonomia inicial de categorias e a regra para categoria arquivada (permitir histórico e bloquear somente novos lançamentos é a recomendação).
4. Definir a regra de reatribuição ao remover membro: escolher um membro destino obrigatório, ou permitir “sem responsável”. A recomendação é exigir destino para preservar filtros e rateios.

As demais ambiguidades encontradas em uma spec devem virar decisão curta em `docs/DECISIONS.md`, não suposição de implementação.
