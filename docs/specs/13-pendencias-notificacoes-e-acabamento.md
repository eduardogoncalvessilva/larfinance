# Spec 13 — Pendências, notificações e acabamento

**Depende de:** Specs 09, 10 e 11.

## 1. Objetivo

Consolidar o MVP com uma central de compromissos futuros, avisos locais não intrusivos e evidência de que requisitos de experiência, segurança e operação foram atendidos.

## 2. Escopo

- Consolidar pendências de recorrências, faturas abertas e dívidas por família.
- Ordenar por vencimento/prioridade, deduplicar itens e oferecer links para a ação de origem.
- Solicitar permissão de notificações do navegador apenas em contexto útil e emitir avisos locais enquanto a aplicação estiver aberta.
- Revisar responsividade, contraste, estados de carregamento/vazio/erro, confirmações e mensagens de erro em fluxos do MVP.
- Revisar logs estruturados locais, README de backup/restauração, `.env.example` e isolamento do seed de desenvolvimento.

## 3. Fora de Escopo

- E-mail, WhatsApp, SMS, push server-side, notificações com aplicação fechada, deploy, backup externo e monitoramento remoto.
- Novo motor de regras para pendências; a central apenas projeta fontes já existentes.
- Alterar regras financeiras de cartão, recorrência, dívida, orçamento ou relatório.

## 4. Regras de Negócio

- Pendência contém origem, família, vencimento, estado e link de ação; o mesmo compromisso não pode aparecer duas vezes na central.
- Recorrência pendente só desaparece/atualiza pelo seu fluxo de confirmação, descarte ou adiamento; fatura e dívida refletem seus próprios estados.
- Central e notificações exibem somente itens da família da sessão atual. “Pessoal” não cria ocultação entre membros.
- Permissão de navegador é opcional: negar, bloquear ou não suportar a API não impede uso da central.
- Sem push/servidor, notificação local só é tentada enquanto o app estiver aberto e após permissão explícita; não prometer aviso em segundo plano.
- Ações sensíveis preservam as confirmações e validações das features de origem, em vez de executar mutação direta pela central.
- Logs têm contexto técnico/IDs necessários para diagnóstico, mas nunca senha, token, cookie, segredo ou conteúdo bruto de arquivo importado.

## 5. Fluxo Principal

1. Membro abre central de pendências.
2. O sistema consulta fontes permitidas da família, normaliza estados/vencimentos, deduplica e apresenta ordem de ação.
3. Usuário abre a origem de uma pendência e executa a ação existente — pagar fatura, confirmar recorrência ou atualizar dívida.
4. Em contexto apropriado, a interface explica benefício da notificação e solicita permissão; se aceita e há item elegível, mostra aviso local enquanto aberta.
5. Após ação/refetch, a central atualiza o estado do item.
6. Em permissão negada, navegador sem suporte, item de outra família, fonte indisponível ou erro de consulta, a central permanece utilizável e mostra estado seguro/acionável.

## 6. Critérios de Aceite

- Central mostra uma única vez cada pendência elegível da família atual, ordenada por vencimento, com origem e ação corretas.
- Ações não criam caminho paralelo: respeitam as regras, confirmações e transações das specs de origem.
- Negar permissão ou não suportar notificações não bloqueia nenhum fluxo financeiro.
- Notificações locais nunca são prometidas/emitidas para aplicação fechada e só ocorrem após consentimento explícito.
- Fluxos principais do MVP têm estado responsivo a 360 px, contraste básico, carregamento/vazio/erro e mensagens sem vazamento de dados.
- README/CI/seed/logs apresentam evidência dos requisitos não funcionais de `docs/REQUIREMENTS.md`.

## 7. Testes Esperados

- Unitários para normalização, ordenação, elegibilidade e deduplicação de pendências.
- Integração para escopo por família, transição de estado após ação de origem e sanitização de logs.
- E2E para central, ação de pendência, permissão negada/suportada simulada e estados de erro/vazio.
- Smoke manual em Chrome, Edge e Firefox atuais, nos breakpoints de 360 px e desktop, documentando resultado.

## 8. Restrições e Decisões Técnicas

- Central é uma projeção read-only que chama casos de uso de origem por links/ações; não deve manter tabela duplicada de pendências sem necessidade.
- Usar a API nativa de Notifications somente atrás de detecção de suporte e consentimento; não adicionar serviço de push, worker persistente ou dependência externa.
- Preferências visuais/permissão já concedida podem usar estado local; dados financeiros continuam na API/Postgres.
- A revisão transversal não deve ampliar escopo de produto. Falhas descobertas viram correções pequenas ou decisões registradas.

## 9. Plano de Implementação

1. Definir DTO de pendência unificado e queries de cada fonte, com policy de deduplicação/ordenação.
2. Implementar central read-only e links para ações já existentes, com testes unitários e integração.
3. Adicionar camada de notificação local com detecção, consentimento e testes simulados.
4. Executar revisão de UX/acessibilidade/erros/logs/operabilidade e aplicar correções pontuais.
5. Concluir E2E, smoke manual de navegadores/breakpoints e checklist de requisitos não funcionais no README/PR.
