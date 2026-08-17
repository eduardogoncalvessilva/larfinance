# LarFinance — Requisitos

## Requisitos funcionais

### Acesso e família

- RF-01: permitir cadastro por e-mail e senha e login/logout seguro.
- RF-02: criar família nomeada no primeiro acesso e associar seu criador como administrador.
- RF-03: permitir convite de membros por token/link, com expiração e uso único.
- RF-04: permitir remover o acesso de membro, preservando lançamentos e transferindo responsabilidade.
- RF-05: aplicar papéis administrador e membro em todas as ações.

### Cadastros financeiros

- RF-06: cadastrar, editar, arquivar e listar conta corrente/carteira, cartão de crédito e saldo total investido.
- RF-07: exigir saldo inicial e data de referência para conta; possibilitar importar histórico posteriormente.
- RF-08: disponibilizar categorias padrão editáveis e subcategorias compartilhadas.
- RF-09: impedir remoção física de conta, cartão ou categoria com histórico; oferecer arquivamento ou bloqueio explicado.

### Movimentações

- RF-10: criar receita, despesa, transferência, ajuste de saldo e compra no cartão.
- RF-11: armazenar valor, moeda BRL, conta/cartão, categoria, data de competência, data de lançamento, responsável, descrição e autor.
- RF-12: permitir marcar lançamento como pessoal apenas para atribuição e filtro; ele continua no saldo e orçamento familiares.
- RF-13: permitir rateio por valor ou percentual, validando que a soma seja exatamente igual ao total.
- RF-14: recalcular de modo consistente saldos, orçamento e fatura após edição; solicitar confirmação para editar ou cancelar.
- RF-15: registrar criador/data e atualizador/data. Cancelamentos preservam o registro; não apagar movimentações financeiras definitivamente.

### Orçamento, cartões e planejamento

- RF-16: definir orçamento mensal por categoria de despesa e apresentar planejado, realizado e percentual consumido para meses passados e futuros.
- RF-17: gerenciar diversos cartões com ciclo de fatura e vencimento.
- RF-18: lançar compras parceladas, criar parcelas futuras vinculadas e posicioná-las na fatura correta.
- RF-19: pagar fatura selecionando conta de origem e criando transferência vinculada, sem duplicar despesa.
- RF-20: criar recorrências pausáveis que geram pendência para confirmação na data prevista.
- RF-21: registrar dívida manual com credor, valor inicial, saldo atual e vencimento; sem cálculo automático de juros.

### Importação, consulta e alertas

- RF-22: importar somente CSV do modelo LarFinance, com prévia obrigatória.
- RF-23: validar todo o arquivo antes de gravar; se houver erro, bloquear a importação e indicar linha/campo.
- RF-24: filtrar lançamentos por período, categoria, responsável, tipo e status; paginar listas.
- RF-25: exibir dashboard com saldo por contas, lançamentos recentes e saldo investido.
- RF-26: apresentar receitas x despesas, gastos por categoria e evolução do saldo por período.
- RF-27: exibir central de pendências e solicitar permissão para notificações do navegador de vencimentos.

## Regras de negócio e invariantes

- RN-01: valores monetários são armazenados em centavos inteiros; BRL é a única moeda do MVP.
- RN-02: datas são interpretadas no fuso America/Sao_Paulo.
- RN-03: transferência não altera o patrimônio consolidado; apenas move valor entre contas.
- RN-04: compra no cartão impacta orçamento na competência da compra; o saldo da conta de origem só muda ao pagar a fatura.
- RN-05: pagamento de fatura é transferência vinculada e não gera nova despesa.
- RN-06: parcela futura pertence à compra de origem e à fatura de seu ciclo.
- RN-07: recorrência pendente não é pagamento realizado até confirmação do usuário.
- RN-08: dados de uma família nunca são visíveis ou alteráveis por usuário de outra família.

## Requisitos não funcionais

- RNF-01: executar localmente via Docker Compose com PostgreSQL persistente.
- RNF-02: documentar inicialização, variáveis de ambiente, backup e restauração manual.
- RNF-03: oferecer seed de demonstração apenas em desenvolvimento.
- RNF-04: responsividade a partir de 360 px, contraste básico, tema escuro e estados de tela claros.
- RNF-05: listas paginadas, navegação local perceptivelmente rápida e gráficos sem travamentos evitáveis.
- RNF-06: mensagens de erro compreensíveis, página de erro/retry e logs estruturados locais sem senhas ou segredos.
- RNF-07: senha com hash forte, validação no servidor, sessão segura, autorização por família, rate limit de login e segredos em `.env` fora do Git.
- RNF-08: CI deve executar lint, typecheck, testes unitários/integração e build antes de integrar na `main`.

## Critérios de aceite globais

- Cada feature relevante possui spec curta em `docs/specs/` com escopo e testes esperados.
- Testes unitários, integração e build passam; E2E obrigatório para login/convite e lançamentos/rateio.
- A revisão humana ocorre antes do commit/inclusão na `main`.
- Mudanças arquiteturais, nova dependência, migration arriscada, ambiguidade financeira ou falha de segurança/CI exigem decisão humana.
