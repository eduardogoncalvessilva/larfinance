# Spec 06 — Lançamentos, filtros e rateio

**Depende de:** Specs 04 e 05.

## 1. Objetivo

Completar a operação diária de lançamentos com consulta paginada e permitir dividir despesas entre membros sem alterar o valor financeiro da família.

## 2. Escopo

- Criar lista paginada de lançamentos com filtros por período, categoria, responsável, tipo e status.
- Aprimorar o formulário de receita/despesa para criação e edição com responsável e marcação pessoal.
- Criar, editar e remover rateios de despesas por valor ou percentual.
- Exibir a composição do rateio no lançamento e manter seus vínculos após edição/cancelamento.
- Transferir rateios atribuídos a membro removido para o destino definido na remoção da Spec 05.

## 3. Fora de Escopo

- Rateio de transferência, ajuste, pagamento de fatura, receita ou compra de cartão.
- Orçamento, cartões, faturas, recorrências, importação, exportação e relatórios.
- Privacidade de lançamento pessoal; o atributo continua sendo apenas filtro/atribuição.

## 4. Regras de Negócio

- Somente despesa efetivada pode receber rateio; cada participante deve ser membro ativo da mesma família.
- Rateio por valor exige soma exata, em centavos, igual ao total da despesa.
- Rateio percentual exige soma de 100%; a conversão para centavos usa a regra de maior resto, com desempate estável por identificador do membro, e a soma final deve ser igual ao total.
- Percentual/valor não pode ser zero ou negativo; o mesmo membro aparece no máximo uma vez por rateio.
- Alterar total, status ou responsável de despesa preserva rateios válidos ou rejeita a alteração quando o rateio deixaria de obedecer às regras; não pode persistir estado parcialmente recalculado.
- Remover membro transfere seus rateios para o destino obrigatório. Se a transferência criar participante duplicado, os valores são consolidados e ainda devem somar o total.
- Filtros e paginação sempre aplicam `familyId`; lançamento pessoal não é ocultado de outros membros da família.

## 5. Fluxo Principal

1. Membro abre lançamentos, define filtros opcionais e percorre a lista paginada da própria família.
2. Ao criar/editar despesa, informa responsável e seleciona rateio por valor ou percentual quando necessário.
3. A tela mostra soma parcial e o servidor valida participantes, total e arredondamento antes de gravar.
4. O caso de uso grava despesa e rateios, ou altera ambos, dentro da mesma transação.
5. A lista atualiza conforme filtros e mostra os participantes do lançamento.
6. Em soma divergente, percentuais inválidos, membro inativo, participante duplicado, página inválida ou filtro de outra família, nenhuma alteração é feita e o erro é explicado.

## 6. Critérios de Aceite

- A lista é paginada e filtra por todos os campos previstos sem expor dados de outra família.
- Despesa pode ser criada/editada com rateio por valor ou percentual, e a soma persistida sempre equivale ao total em centavos.
- Bordas de arredondamento percentual têm resultado determinístico e testado.
- Edição/cancelamento de lançamento mantém saldo e rateio consistentes; remoção de membro transfere rateios de modo atômico.
- A experiência funciona em 360 px, tem estados vazio/carregando/erro e torna clara a visibilidade familiar de “pessoal”.

## 7. Testes Esperados

- Unitários em tabela para rateio por valor, percentuais, maior resto, duplicidade, centavos e consolidação na reatribuição.
- Integração para criação/edição/cancelamento transacional, filtros/paginação, isolamento por família e remoção de membro com rateios.
- E2E para criar despesa com rateio, editar, filtrar e confirmar atualização da lista/saldo. Este é o E2E financeiro obrigatório do MVP.

## 8. Restrições e Decisões Técnicas

- Rateio é policy/calculator de domínio puro; React e Route Handlers não calculam nem arredondam valores financeiros.
- Query de lista é separada do comando de lançamento e projeta apenas os campos necessários à tela.
- Paginação deve usar ordenação estável e cursor ou estratégia equivalente que não gere duplicações/omissões durante a navegação.
- Comandos de lançamento/rateio e reatribuição usam `prisma.$transaction`; o repositório recebe `familyId` do contexto autenticado.

## 9. Plano de Implementação

1. Definir contratos de consulta paginada/filtros e policies puras de rateio.
2. Implementar schema, constraints e repositórios de `Split`, com testes unitários e integração.
3. Integrar rateio aos casos de uso de despesa/edição/cancelamento e à remoção de membro.
4. Criar consulta paginada, endpoints e interface de lista/filtros/formulário responsivo.
5. Cobrir bordas financeiras e concluir E2E de lançamento com rateio.
