# Spec 02 — Acesso e configuração inicial

**Depende de:** Spec 01.

## 1. Objetivo

Permitir que a primeira pessoa se cadastre, crie uma família isolada e saia do onboarding com categorias padrão e uma conta pronta para uso.

## 2. Escopo

- Cadastro por e-mail e senha, login e logout.
- Hash de senha com Argon2id e sessão persistida no PostgreSQL.
- Cookie de sessão `HttpOnly`, `SameSite=Lax` e `Secure` em produção.
- Criação de família nomeada e `Membership` do criador como administrador.
- Criação idempotente das categorias padrão aprovadas para a nova família.
- Cadastro obrigatório da primeira conta corrente/carteira, com saldo inicial e data de referência.
- Proteção das áreas privadas, autorização de papel no servidor, rate limit de login e logs seguros.

## 3. Fora de Escopo

- Convites, remoção de membros, recuperação de senha, OAuth e autenticação multifator.
- Alteração posterior de contas/categorias, cartões, lançamentos ou dashboard.
- E-mail transacional e notificações externas.

## 4. Regras de Negócio

- Uma família é criada somente no primeiro onboarding concluído do usuário; o criador é administrador.
- Categorias padrão pertencem à família criada, são compartilhadas e não podem ser duplicadas pela repetição de requisição.
- A primeira conta exige nome, tipo suportado, saldo inicial em centavos e data de referência válida.
- Usuário não autenticado não acessa rota privada; usuário autenticado só acessa dados da própria família.
- Falha de login não revela se o e-mail existe. Senha, token, cookie e segredo nunca entram em logs.
- O cliente não decide papel ou `familyId`; ambos são obtidos e validados no servidor pela sessão.

## 5. Fluxo Principal

1. A pessoa abre cadastro, informa e-mail e senha válidos.
2. Informa o nome da família e os dados da primeira conta.
3. O sistema cria usuário, família, membership de administrador, categorias padrão e conta em operação consistente; então inicia a sessão.
4. A pessoa é direcionada à área autenticada.
5. Se e-mail já existir, senha for inválida, a sessão expirar ou o onboarding estiver incompleto, o sistema explica a próxima ação sem revelar dados de terceiros ou gravar cenário parcial inconsistente.

## 6. Critérios de Aceite

- Cadastro completo cria família isolada, administrador, categorias padrão sem duplicidade e primeira conta válida.
- Login e logout criam/inativam sessão corretamente; rota privada bloqueia visitante.
- Um usuário não consulta nem altera dados de outra família por URL, payload ou endpoint.
- Apenas servidor grava papel, família e senha; a senha é armazenada somente como hash Argon2id.
- O formulário é utilizável em 360 px e apresenta validações, carregamento e erro compreensíveis.

## 7. Testes Esperados

- Unitários para política de senha, criação/expiração de sessão e idempotência das categorias padrão.
- Integração para cadastro transacional, autorização por papel/família e invalidação de sessão no logout.
- E2E para cadastro/onboarding, login, logout e redirecionamento/bloqueio de rota protegida.

## 8. Restrições e Decisões Técnicas

- Não implementar JWT manualmente; sessão persistida é a fonte de autenticação no servidor.
- Route Handlers/Server Actions só validam entrada, autenticam/autorizam e chamam o caso de uso; não contêm regra de criação de família.
- Cadastro e onboarding têm fronteira transacional: falha em qualquer etapa não deixa família, categorias ou conta incompletas.
- Zod é obrigatório no servidor e pode ser reutilizado no cliente; não confiar apenas na validação do navegador.

## 9. Plano de Implementação

1. Implementar hashing, sessão e guardas de rota com testes unitários.
2. Criar caso de uso transacional de cadastro, família e membership de administrador.
3. Adicionar categorias padrão e primeira conta ao onboarding idempotente.
4. Criar telas de cadastro/login, formulários validados e logout.
5. Adicionar rate limit, logs seguros, testes de integração e E2E do fluxo completo.
