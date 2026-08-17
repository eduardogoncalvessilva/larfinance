# Spec 11 — Relatórios

**Depende de:** Specs 07, 08, 09 e 10.

## 1. Objetivo

Permitir que a família interprete receitas, despesas, categorias e evolução de saldo sem criar uma segunda fonte de verdade financeira.

## 2. Escopo

- Relatório de receitas versus despesas por período.
- Relatório de gastos por categoria, com a regra de subcategoria aprovada na Spec 08.
- Evolução do saldo por período, usando a mesma política do livro-caixa/dashboard.
- Filtros por período, categoria e responsável quando aplicáveis.
- Tabelas e gráficos responsivos, acessíveis e com estados de vazio/erro/carregamento.

## 3. Fora de Escopo

- Exportação CSV/PDF, BI externo, metas, comparativos automáticos, relatórios de impostos ou análise de investimentos.
- Alterar lançamentos a partir do relatório ou criar dados agregados como fonte de verdade.
- Predição de gastos ou recomendação automática.

## 4. Regras de Negócio

- Relatórios consideram somente transações efetivadas do período e família solicitados.
- Receita e despesa são classificadas uma única vez. Transferência não é receita/despesa; pagamento de fatura não é nova despesa.
- Compra de cartão aparece uma vez como despesa na competência da compra, mesmo que possua parcelas; pendência de recorrência não confirmada não aparece.
- Gastos por categoria aplicam a mesma regra de categorias/subcategorias e cancelamento do orçamento.
- Evolução de saldo parte do saldo inicial aplicável e inclui movimentos efetivados em ordem estável; deve coincidir com saldo do dashboard para a mesma data final.
- Filtro por responsável é atribuição, não privacidade; não expõe dados de outra família.
- Período inválido, intervalo invertido ou categoria/responsável de outra família gera erro de validação sem consulta ampla.

## 5. Fluxo Principal

1. Membro seleciona relatório e período; pode restringir por categoria ou responsável.
2. O sistema valida filtros e executa a query agregada escopada à família.
3. A tela apresenta totais, detalhamento e gráfico adequado ao relatório.
4. Usuário ajusta período/filtros e a consulta atualiza sem alterar dados financeiros.
5. Se não existir dado, a tela explica o estado vazio; se houver filtro inválido ou falha de consulta, mostra erro e retry sem números parcialmente inconsistentes.

## 6. Critérios de Aceite

- Receitas, despesas e categorias batem com massa financeira conhecida e com regras de cartão, transferência, cancelamento e recorrência.
- Saldo final do relatório coincide com dashboard/livro-caixa para a mesma família e data.
- Filtros respeitam período, categoria, responsável e `familyId`; dados de outra família nunca são retornados.
- Períodos sem dados, conjuntos grandes e tela de 360 px mantêm experiência compreensível e responsiva.
- Gráficos possuem alternativa textual/tabelar suficiente para leitura básica.

## 7. Testes Esperados

- Unitários em tabela para classificação de cada tipo financeiro e fronteiras de período/competência.
- Integração para agregações por família, filtros, cancelamentos, cartões parcelados e consistência com saldo.
- E2E para trocar filtros, validar dados conhecidos e visualizar estado vazio/erro.

## 8. Restrições e Decisões Técnicas

- Relatórios são queries read-only; não recalculam ou materializam dados em componentes.
- Centralizar classificação/agregação em serviço de consulta compartilhado, evitando SQL/Prisma divergente entre cards, gráficos e dashboard.
- Consultas devem selecionar/agregar somente dados necessários, usar índices por `familyId`/data e paginar detalhamentos quando houver lista.
- Não introduzir ferramenta de BI, exportação ou cache global sem nova decisão de produto/arquitetura.

## 9. Plano de Implementação

1. Definir contratos de período/filtros e conjunto de cenários financeiros de referência.
2. Implementar policies de classificação e queries de receita/despesa/categoria, com testes unitários e integração.
3. Implementar query de evolução de saldo e validar compatibilidade com dashboard.
4. Criar telas, tabelas/gráficos acessíveis e estados de consulta.
5. Adicionar E2E, teste de desempenho com massa representativa e revisão dos números com casos conhecidos.
