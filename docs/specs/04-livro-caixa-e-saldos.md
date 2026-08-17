# Spec 04 — Livro-caixa e saldos

**Depende de:** Spec 03.

## 1. Objetivo

Estabelecer o livro-caixa familiar como fonte de verdade para receitas, despesas, ajustes e transferências, permitindo derivar saldos confiáveis por conta e no consolidado.

## 2. Escopo

- Criar, consultar, editar e cancelar receitas, despesas, ajustes de saldo e transferências.
- Registrar valor, tipo, conta(s), categoria quando aplicável, competência, lançamento, responsável, marcação pessoal, descrição, autor e auditoria.
- Calcular saldo por conta e consolidado a partir de saldo inicial datado e movimentações efetivadas.
- Persistir transferências atomicamente, conforme representação definida na Spec 01.
- Recalcular projeções de saldo de forma determinística após edição ou cancelamento.
- Entregar API e interface mínima para registrar e consultar os quatro tipos, com confirmação para editar/cancelar.

## 3. Fora de Escopo

- Rateio, lista avançada/paginação/filtros detalhados, cartões, faturas, orçamento, recorrências, dívidas, importação, investimentos, dashboard e relatórios.
- Exclusão definitiva, conciliação bancária, múltiplas moedas, anexos e integrações bancárias.
- Lançamento automático de transações futuras.

## 4. Regras de Negócio

- Receita, despesa e ajuste afetam uma conta; transferência envolve origem e destino distintos da mesma família.
- Transferência altera saldos das duas contas, mas não altera o patrimônio consolidado.
- Ajuste altera somente o saldo da conta alvo e exige motivo ou descrição.
- Despesa exige categoria ativa; receita, ajuste e transferência seguem a regra de categoria definida no contrato.
- Somente transações efetivadas entram no saldo. Cancelamento preserva o registro e remove seu efeito; edição atualiza o mesmo registro/vínculo segundo o contrato, sem apagar histórico.
- Competência e lançamento são obrigatórios, válidos no fuso de negócio e podem ser diferentes.
- Responsável deve ser membro ativo da família; “pessoal” é somente atributo de filtro/atribuição e não restringe visibilidade.
- Toda alteração vinculada, especialmente transferência, ocorre em uma única transação de banco e é isolada por `familyId`.

## 5. Fluxo Principal

1. Membro autenticado escolhe criar receita, despesa, ajuste ou transferência e preenche os campos exigidos.
2. O sistema valida dados, contas/categoria ativas, papel/família e regras do tipo de transação.
3. O caso de uso grava a movimentação — e todas as pernas necessárias de uma transferência — atomicamente.
4. A tela mostra o lançamento e os saldos recalculados.
5. Ao editar ou cancelar, o sistema mostra confirmação, reaplica as regras e atualiza saldos sem apagar o registro.
6. Em valor inválido, conta arquivada, conta de outra família, categoria ausente, origem igual ao destino ou falha transacional, nada é gravado e o usuário recebe erro compreensível.

## 6. Critérios de Aceite

- Usuário autorizado cria os quatro tipos de movimentação com auditoria e escopo familiar corretos.
- Saldo por conta equivale a saldo inicial mais efeitos das movimentações efetivadas; saldo consolidado não muda em transferência.
- Transferência não deixa apenas uma perna gravada, mesmo diante de erro.
- Edição e cancelamento preservam rastreabilidade e recalculam saldo de modo determinístico.
- Dados de outra família não são lidos nem alterados por endpoint, payload ou identificador direto.
- A interface solicita confirmação para edição/cancelamento e tem estados de carregamento, erro e sucesso.

## 7. Testes Esperados

- Unitários por tabela para sinais de cada tipo, cálculo de saldo, competência/data de lançamento e transições de status.
- Unitários para regras de transferência: origem/destino distintos, valor positivo e preservação do consolidado.
- Integração contra Postgres para atomicidade de transferência, edição, cancelamento, auditoria e isolamento por `familyId`.
- E2E para registrar receita, despesa e transferência; cancelar lançamento e confirmar atualização dos saldos.

## 8. Restrições e Decisões Técnicas

- A representação de transferência deve ser exatamente a aprovada na Spec 01; não misturar transação composta e duas pernas em fluxos diferentes.
- Cálculos de saldo residem em policy/calculator de domínio, não em React, Route Handler ou query isolada de tela.
- Route Handlers apenas autenticam/autorizam, validam Zod, chamam caso de uso e mapeiam erros de domínio para HTTP.
- Repositórios aplicam `familyId`; operações vinculadas usam `prisma.$transaction` no caso de uso/adaptador transacional.
- Valores usam helpers de dinheiro; é proibido calcular com ponto flutuante ou confiar em total vindo do cliente.

## 9. Plano de Implementação

1. Definir tipos de input/output, erros de domínio e policies puras para efeito no saldo.
2. Implementar persistência e casos de uso para receita, despesa e ajuste, com testes unitários e integração.
3. Implementar transferência atômica conforme contrato, com testes de rollback e consolidado.
4. Adicionar edição/cancelamento auditáveis e recalcular saldos; testar transições de status.
5. Criar endpoints, formulários e consulta mínima de lançamentos/saldos; concluir E2E crítico.
