# Spec 03 — Cadastros financeiros

**Depende de:** Spec 02.

## 1. Objetivo

Permitir que administradores mantenham contas e categorias confiáveis para os lançamentos posteriores, preservando o histórico quando um cadastro deixa de ser usado.

## 2. Escopo

- Criar, listar, editar, arquivar e reativar contas corrente/carteira.
- Criar, listar, editar, arquivar e reativar categorias e subcategorias compartilhadas.
- Exibir somente cadastros ativos nos seletores de novos lançamentos, mantendo arquivados visíveis no histórico.
- Validar papel de administrador e pertencimento à família em todas as operações.
- Explicar bloqueio de remoção física para cadastros referenciados por histórico.

## 3. Fora de Escopo

- Cartões, saldo investido, orçamento e importação.
- Alterar retroativamente saldo inicial ou data de referência de conta que já possua movimentações efetivadas.
- Exclusão física de conta/categoria com histórico, mesclagem de categorias e remoção de membro.

## 4. Regras de Negócio

- Conta exige nome único dentro da família, tipo corrente/carteira, saldo inicial em centavos e data de referência válida.
- Categoria e subcategoria pertencem à mesma família; subcategoria não pode ser pai de outra categoria nesta fase.
- Conta ou categoria arquivada preserva vínculos históricos e não é elegível para novo lançamento.
- Conta/categoria sem histórico só pode ser removida se isso não violar as constraints do contrato; a interface deve pedir confirmação.
- Membro pode consultar cadastros necessários ao lançamento, mas não cria, edita, arquiva, reativa ou remove cadastros.
- Nenhuma ação pode usar o identificador de uma entidade de outra família, ainda que ele seja enviado pelo cliente.

## 5. Fluxo Principal

1. Um administrador acessa configurações financeiras e cria conta ou categoria com dados válidos.
2. O cadastro passa a aparecer nos seletores ativos da família.
3. O administrador edita dados permitidos ou arquiva um cadastro que não será mais usado.
4. O sistema mantém o cadastro arquivado em históricos e o remove dos novos seletores.
5. Se o usuário não for administrador, o cadastro pertencer a outra família, o nome duplicar ou houver remoção bloqueada, a operação falha com mensagem segura e acionável.

## 6. Critérios de Aceite

- Administrador cria e edita conta/categoria/subcategoria válidas somente na própria família.
- Arquivamento e reativação não quebram referências existentes; itens arquivados não aparecem para novos lançamentos.
- Subcategoria com pai de outra família ou categoria em cadeia inválida é rejeitada.
- Remoção física de cadastro com histórico é bloqueada e explicada; a interface oferece arquivamento.
- Membro não possui ações administrativas, inclusive ao chamar o endpoint diretamente.

## 7. Testes Esperados

- Unitários para validação de conta, hierarquia de categoria e transição ativo/arquivado.
- Integração para autorização de administrador, constraints familiares, referência histórica e bloqueio de remoção.
- E2E para criar, editar, arquivar e reativar conta/categoria; verificar que membro não pode administrar.

## 8. Restrições e Decisões Técnicas

- Cada caso de uso recebe contexto autenticado e aplica `familyId` no repositório; não aceita escopo de família do formulário.
- Repositórios Prisma não decidem se um cadastro pode ser arquivado/removido; essa política pertence ao domínio/aplicação.
- Não adicionar saldo calculado ou lógica de lançamento nesta spec. Saldo inicial permanece dado de referência até a Spec 04.
- Use constraints de unicidade e chaves estrangeiras como proteção adicional à validação de domínio.

## 9. Plano de Implementação

1. Finalizar schema/constraints de conta, categoria e subcategoria necessários às operações.
2. Implementar políticas e casos de uso de conta, com testes unitários e integração.
3. Implementar políticas e casos de uso de categoria/subcategoria, com testes equivalentes.
4. Criar endpoints e telas administrativas responsivas, com confirmação de ações sensíveis.
5. Adicionar testes E2E, estados vazio/erro e revisão de autorização por família/papel.
