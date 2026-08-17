# Spec 10 — Planejamento e dívidas

**Depende de:** Spec 06.

## 1. Objetivo

Exibir compromissos futuros por recorrências e dívidas sem tratá-los como dinheiro efetivado antes da confirmação do usuário.

## 2. Escopo

- Criar, editar, pausar, retomar e listar regras de recorrência mensal.
- Gerar pendências confirmáveis na data prevista, com vínculo à regra de origem.
- Confirmar pendência criando a transação efetiva; permitir descartar ou adiar com registro mínimo de estado.
- Registrar, editar e consultar dívida manual com credor, valor inicial, saldo atual e vencimento.
- Disponibilizar recorrências/dívidas como fontes para a central de pendências da Spec 13.

## 3. Fora de Escopo

- Lançamento automático de transação, juros, amortização, parcelamento de dívida, negociação ou cálculo de quitação.
- Frequências além de mensal, calendário de feriados, notificações do navegador e comunicação externa.
- Tratar dívida como despesa, saldo de conta ou fatura automaticamente.

## 4. Regras de Negócio

- Regra de recorrência mensal possui tipo de lançamento suportado, valor em centavos, conta/categoria quando exigidas, dia previsto e status ativa/pausada.
- Uma regra ativa gera no máximo uma pendência por competência mensal; a geração deve ser idempotente.
- Pendência não afeta saldo, orçamento, fatura ou relatório até ser confirmada.
- Confirmar pendência cria exatamente uma transação efetiva vinculada à pendência e impede nova confirmação. Descartar não cria transação; adiar preserva a origem e define nova data prevista.
- Pausar regra impede geração futura, mas não apaga pendências existentes; retomar não recria pendências já tratadas.
- Dívida exige credor, valor inicial positivo, saldo atual não negativo e vencimento. Alterar saldo atual é registro manual auditável, sem cálculo de juros/amortização.
- Todos os registros pertencem à família; responsável, conta e categoria referenciados devem permanecer válidos conforme o tipo de recorrência.

## 5. Fluxo Principal

1. Membro autorizado cria recorrência mensal e informa dados da futura transação.
2. Na data prevista, uma execução controlada gera/consulta a pendência da competência sem criar lançamento efetivo.
3. Usuário abre pendência e confirma, descarta ou adia.
4. Ao confirmar, o sistema cria a transação do livro-caixa e marca a pendência como tratada atomicamente.
5. Administrador ou papel definido registra dívida e atualiza saldo manual quando necessário.
6. Em regra pausada, competência já tratada, referência arquivada, saldo de dívida negativo ou confirmação repetida, o sistema bloqueia a operação sem efeito financeiro parcial.

## 6. Critérios de Aceite

- Recorrência ativa produz no máximo uma pendência por mês e recorrência pausada não produz novas pendências.
- Pendência não aparece em saldo, orçamento ou relatório antes da confirmação.
- Confirmação cria uma única transação vinculada; repetição é idempotente/rejeitada sem duplicar dinheiro.
- Descarte/adiamento preserva origem e estado auditável.
- Dívida é apenas registro manual e nunca cria despesa, juros ou movimentação implícita.
- Registros e ações são isolados por família e respeitam papel/autorização definidos.

## 7. Testes Esperados

- Unitários para cálculo de competência mensal, pausa/retomada, idempotência e transições de pendência.
- Unitários para validação de dívida e garantia de ausência de efeito financeiro automático.
- Integração para geração concorrente, confirmação transacional, referências familiares e auditoria.
- E2E para criar recorrência, gerar/confirmar pendência, pausar e registrar dívida.

## 8. Restrições e Decisões Técnicas

- Geração de pendências deve ser acionável por consulta/rotina local e segura para repetição; não introduzir fila ou cron externo no MVP.
- A confirmação chama o caso de uso de transação da Spec 04; não duplica lógica de saldo em planejamento.
- Pendência, regra e dívida têm status explícitos e erros de domínio tipados; não usar flags ambíguas.
- Operações de geração/confirmação usam constraints de unicidade e `prisma.$transaction` quando criam registros vinculados.

## 9. Plano de Implementação

1. Criar schema/migrations, enums de status e contracts de regra, pendência e dívida.
2. Implementar policy mensal/idempotente e testes unitários de competência.
3. Implementar casos de uso de recorrência e confirmação transacional com o livro-caixa.
4. Implementar dívida manual, endpoints e telas de planejamento.
5. Adicionar testes de concorrência/E2E e expor fontes de pendência para a Spec 13.
