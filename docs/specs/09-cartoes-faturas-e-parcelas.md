# Spec 09 — Cartões, faturas e parcelas

**Depende de:** Specs 04 e 08.

## 1. Objetivo

Permitir compras no cartão, faturas e parcelamentos sem duplicar despesas, orçamento ou saldo de contas.

## 2. Escopo

- Criar, editar, arquivar e listar cartões da família, com dia de fechamento e vencimento.
- Registrar compra à vista ou parcelada, com categoria, competência, responsável e vínculo ao cartão.
- Gerar parcelas futuras vinculadas à compra de origem e à fatura correta.
- Consultar faturas abertas/pagas com suas parcelas e totais.
- Pagar uma fatura integral selecionando conta de origem e criando transferência vinculada.
- Refletir compra no orçamento pela competência da compra, conforme regra existente.

## 3. Fora de Escopo

- Juros, multa, pagamento parcial, estorno de operadora, limite de crédito, conciliação bancária e cartão compartilhado entre famílias.
- Parcelamento de fatura, renegociação, importação de fatura e notificações.
- Alterar retrospectivamente o ciclo de um cartão que já possua faturas.

## 4. Regras de Negócio

- Cartão pertence a uma família e possui dia de fechamento e vencimento entre 1 e 28; novos cartões exigem nome único na família.
- Compra com dia de competência até o fechamento pertence à fatura do ciclo corrente; após o fechamento pertence à fatura do ciclo seguinte. A regra é inclusiva e usa data civil em `America/Sao_Paulo`.
- Compra parcelada gera parcelas mensais consecutivas. A soma de parcelas é exatamente o valor da compra em centavos; centavos residuais são distribuídos deterministicamente nas primeiras parcelas.
- Cada parcela possui uma única compra de origem e uma única fatura. A compra aparece como despesa/orçamento uma vez, na competência original; parcelas existem para compor a cobrança, não para duplicar despesa em relatórios.
- Compra no cartão não altera saldo de conta. Pagamento integral de fatura cria transferência vinculada da conta escolhida, altera seu saldo e não cria nova despesa.
- Uma fatura paga não pode receber segundo pagamento integral. Cartão arquivado preserva faturas e impede novas compras, mas permite consultar/pagar faturas abertas.
- Edição/cancelamento de compra ou parcela recalcula fatura e orçamento de forma transacional; pagamento já efetuado exige erro/fluxo explícito, nunca ajuste silencioso.

## 5. Fluxo Principal

1. Administrador cadastra cartão com fechamento e vencimento válidos.
2. Membro registra compra, informa uma ou mais parcelas e visualiza fatura de destino.
3. O sistema valida cartão/categoria ativos, calcula parcelas e atualiza orçamento na competência da compra.
4. Usuário abre fatura e confere parcelas, total e vencimento.
5. Ao pagar, seleciona conta de origem e confirma; o sistema cria transferência vinculada e marca a fatura como paga atomicamente.
6. Em ciclo inválido, cartão arquivado, parcela que não soma o total, conta de outra família ou repetição de pagamento, nada é gravado e o erro é acionável.

## 6. Critérios de Aceite

- Cartões e faturas são isolados por família; cartão arquivado não aceita compra nova.
- Compra é atribuída à fatura correta nos limites de fechamento e seu parcelamento soma exatamente o total.
- Compra afeta orçamento uma única vez e não reduz conta antes do pagamento.
- Pagamento integral gera uma transferência vinculada, reduz somente a conta de origem e não aparece como despesa adicional.
- Edição/cancelamento mantém compra, parcelas, fatura, saldo e orçamento coerentes ou falha sem persistência parcial.

## 7. Testes Esperados

- Unitários em tabela para limites de fechamento, competência, parcelas, distribuição de centavos e classificação de relatório/orçamento.
- Integração para geração de fatura, atomicidade do pagamento, bloqueio de duplicidade e alteração/cancelamento de compra.
- E2E para cadastrar cartão, lançar compra parcelada, consultar fatura e pagá-la com conta de origem.

## 8. Restrições e Decisões Técnicas

- Ciclo/fatura, parcelas e pagamento são policies/casos de uso de domínio; não calcular em componentes ou handlers.
- Pagamento usa a mesma representação de transferência definida na Spec 01 e uma única `prisma.$transaction` para transferência e atualização da fatura.
- Faturas e parcelas mantêm IDs de origem e constraints de unicidade; não armazenar totais como fonte de verdade sem estratégia de reconciliação.
- O schema deve impedir que compra, cartão, conta de pagamento ou fatura de outra família sejam vinculados.

## 9. Plano de Implementação

1. Criar schema/migrations e contracts de cartão, fatura, compra e parcela.
2. Implementar policies de ciclo e parcelamento, com testes de tabela de datas/centavos.
3. Implementar casos de uso de cartão, compra, fatura e cancelamento/edição.
4. Implementar pagamento atômico via transferência e testes de integração.
5. Criar telas de cartões/faturas e concluir E2E crítico de compra parcelada e pagamento.
