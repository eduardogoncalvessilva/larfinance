# Spec 08 — Orçamento mensal

**Depende de:** Spec 06.

## 1. Objetivo

Permitir que a família planeje limite mensal por categoria de despesa e acompanhe o realizado pela data de competência.

## 2. Escopo

- Criar, consultar e editar orçamento mensal por família, categoria de despesa e mês.
- Exibir planejado, realizado e percentual consumido para meses passados, atual e futuros.
- Recalcular realizado quando despesa é criada, editada ou cancelada.
- Aplicar a regra aprovada para subcategorias ao calcular categoria orçada.
- Entregar telas responsivas com estados vazio, carregamento, erro e explicação de meses sem orçamento.

## 3. Fora de Escopo

- Rollover de saldo, envelopes, orçamento de receitas, metas, alertas automáticos e previsão de saldo.
- Orçamento de cartão antes da Spec 09; compras de cartão serão integradas conforme a regra financeira já definida.
- Rateio como divisão de consumo do orçamento: a despesa familiar conta uma vez, independentemente dos participantes.

## 4. Regras de Negócio

- Orçamento pertence a uma família, uma categoria de despesa e uma competência mensal; existe no máximo um por combinação família/categoria/mês.
- Valor planejado é inteiro não negativo em centavos; somente categoria de despesa ativa pode receber novo orçamento.
- Realizado é a soma de despesas efetivadas na competência mensal, não na data de lançamento; despesas canceladas não contam.
- Transferências, receitas, ajustes e pendências não entram no realizado.
- A regra de subcategoria deve ser registrada antes da implementação: orçamento exclusivo por categoria pai com agregação das filhas, ou orçamento independente por subcategoria. Não aceitar os dois comportamentos sem contrato explícito.
- Alterar/cancelar despesa deve refletir no realizado sem criar ou alterar o valor planejado.
- Membro pode consultar orçamento; somente administrador cria ou edita valores planejados.

## 5. Fluxo Principal

1. Administrador escolhe mês e categoria de despesa e informa limite planejado.
2. O sistema valida unicidade, categoria ativa e valor; cria ou atualiza o orçamento da competência.
3. A tela mostra planejado, realizado derivado das despesas e percentual consumido.
4. Ao criar, editar ou cancelar despesa, o próximo carregamento/refetch mostra o realizado atualizado.
5. Se categoria for de receita, estiver arquivada, pertencer a outra família, houver duplicidade concorrente ou a regra de subcategoria estiver indefinida, a operação é bloqueada com mensagem clara.

## 6. Critérios de Aceite

- Administrador mantém um orçamento por categoria/mês; constraint impede duplicidade na mesma família.
- Tela compara planejado, realizado e percentual para meses passados e futuros, sem tratar pendência como gasto.
- Uma despesa entra no mês de competência correto; edição/cancelamento altera somente o realizado derivado.
- Transferência, receita e ajuste não alteram consumo de orçamento.
- Regra de subcategoria está decidida, testada e aplicada de modo uniforme em formulário, consulta e relatório futuro.
- Membro não altera orçamento, inclusive por endpoint direto.

## 7. Testes Esperados

- Unitários em tabela para agregação por competência, tipos elegíveis, cancelamento e percentual consumido.
- Unitários para a regra aprovada de categoria/subcategoria e bordas de valor zero.
- Integração para unicidade família/categoria/mês, autorização, isolamento por família e recálculo após alteração de despesa.
- E2E para configurar orçamento, criar/editar/cancelar despesa e observar o realizado atualizado.

## 8. Restrições e Decisões Técnicas

- Orçamento é configuração persistida; realizado é projeção derivada do livro-caixa, não contador salvo e atualizado por componentes.
- Serviço de agregação recebe `familyId`, intervalo mensal no fuso `America/Sao_Paulo` e regra única para tipos/status elegíveis.
- Commands de orçamento usam caso de uso e constraints de banco; queries de consumo não alteram estado.
- Não antecipar lógica de fatura nesta spec; a Spec 09 deve reutilizar a mesma política de competência ao incluir compras no cartão.

## 9. Plano de Implementação

1. Registrar decisão de subcategoria e definir contratos de mês/categoria/orçamento.
2. Criar schema, migration, constraint de unicidade e casos de uso de orçamento.
3. Implementar policy/query de realizado por competência, com testes financeiros de tabela.
4. Criar endpoints e telas mensais com autorização, estados e validações.
5. Adicionar integração com alterações de despesa, E2E e revisão de consistência para meses passados/futuros.
