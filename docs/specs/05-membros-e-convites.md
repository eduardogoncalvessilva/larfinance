# Spec 05 — Membros e convites

**Depende de:** Spec 04.

## 1. Objetivo

Permitir que o administrador forme a família e revogue acessos sem perder a autoria ou deixar responsabilidades financeiras sem destino.

## 2. Escopo

- Listar membros da família e seus papéis administrador/membro.
- Criar, consultar e revogar convites por token/link de uso único e expiração.
- Aceitar convite com login de usuário existente ou cadastro de novo usuário.
- Associar o convidado à família como membro e permitir que administrador gerencie papéis dentro dos limites do MVP.
- Revogar o acesso de membro, invalidar suas sessões da família e transferir seus lançamentos sob responsabilidade para um membro destino.
- Preservar autor, timestamps e histórico do usuário removido.

## 3. Fora de Escopo

- E-mail ou outro canal de entrega do convite; o administrador compartilha o link manualmente.
- Permissões granulares, OAuth, recuperação de senha e exclusão física de usuário.
- Transferência de parcelas de rateio já existentes; essa extensão é concluída na Spec 06.

## 4. Regras de Negócio

- Convite pertence a uma família, possui `expiresAt`, pode ser aceito uma única vez e não concede acesso após expirar ou ser revogado.
- Aceite usa a identidade da sessão ou cadastro concluído; o token nunca escolhe usuário, papel arbitrário ou outra família.
- Somente administrador cria/revoga convite, altera papel ou remove membro.
- A família deve manter pelo menos um administrador ativo; não é permitido remover ou rebaixar o último administrador.
- Remover membro revoga seu acesso, preserva autoria e exige um membro ativo de destino para reatribuir lançamentos pelos quais ele é responsável.
- Não é permitido convidar ou associar o mesmo usuário duas vezes à mesma família.
- Token, link bruto e sessão são credenciais: não podem ser registrados em logs ou devolvidos em listagens após a criação.

## 5. Fluxo Principal

1. Administrador abre a gestão de membros e gera convite com expiração.
2. Compartilha o link fora do sistema; a tela mostra apenas estado do convite, nunca o token novamente após sair da criação.
3. Convidado abre o link, entra ou se cadastra, e aceita o convite válido.
4. O sistema consome o token atomicamente, cria a membership e direciona o membro à família.
5. Para remover acesso, o administrador seleciona membro e destino da responsabilidade, confirma a ação e o sistema reatribui lançamentos/invalida sessões em uma transação.
6. Token expirado, usado, revogado, usuário já membro, ausência de destino ou tentativa de remover o último administrador retornam erro seguro sem alterar dados.

## 6. Critérios de Aceite

- Convite válido cria exatamente uma membership; uso repetido, expiração ou revogação impedem novo acesso.
- Usuário convidado só acessa a família após aceite; token não pode conceder acesso a família diferente.
- Apenas administradores administram membros e convites, inclusive por chamada direta de endpoint.
- Remoção impede acesso futuro, preserva autoria e transfere responsabilidades ao destino escolhido de modo atômico.
- O sistema impede duplicidade de membership e família sem administrador ativo.

## 7. Testes Esperados

- Unitários para expiração/consumo de token, invariantes de administrador e validação do destino de reatribuição.
- Integração para aceite idempotente/atômico, isolamento por `familyId`, invalidação de sessão e reatribuição de lançamentos.
- E2E para gerar convite, aceitar com usuário novo/existente, acessar família e remover membro.

## 8. Restrições e Decisões Técnicas

- Tokens devem ser aleatórios, armazenados apenas em formato seguro (hash ou equivalente) e comparados no servidor.
- O caso de uso de aceite e o de remoção definem a fronteira transacional; handlers não manipulam memberships e lançamentos diretamente.
- A duração padrão do convite deve ser documentada como configuração/decisão de produto antes da implementação; o banco armazena uma data de expiração explícita.
- Não usar e-mail como chave de autorização; o contexto autenticado e `familyId` determinam o acesso.

## 9. Plano de Implementação

1. Criar schema/constraints para convite e completar invariantes de membership/papel.
2. Implementar serviços de convite e aceite atômico, com testes unitários e integração.
3. Criar lista de membros e casos de uso para mudança de papel/revogação de convite.
4. Implementar remoção com reatribuição de responsabilidade e invalidação de sessão.
5. Criar telas/links seguros e concluir os E2E de convite e remoção.
