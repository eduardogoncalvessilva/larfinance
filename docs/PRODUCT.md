# LarFinance — Produto

## Visão

LarFinance é um sistema web local de controle financeiro para uma família. Ele ajuda membros a registrar e compreender receitas, despesas, cartões, orçamento, dívidas e saldo investido compartilhados. O projeto também é um laboratório prático de desenvolvimento orientado a specs com agentes de IA.

## Problema

Planilhas e conversas dispersas tornam difícil responder: quanto a família tem disponível, onde gastou no mês, o que vence em breve e quem é responsável por cada gasto. O sistema deve centralizar a informação sem exigir integração bancária.

## Público e acesso

- Uma família por instalação inicial, modelada como espaço isolado para permitir evolução futura.
- Administrador: configura família, membros, contas/cartões, categorias e orçamento.
- Membro: consulta e cria/edita lançamentos conforme as regras.
- Entrada por cadastro com e-mail e senha; o administrador convida membros por link/token.
- Um lançamento pode ser marcado como pessoal, mas continua visível a todos: é atribuição/filtro, não privacidade.

## Proposta de valor do MVP

Em poucos minutos, a família consegue registrar seu cenário atual, acompanhar saldo, lançar gastos e receitas, planejar por categoria e visualizar compromissos futuros.

## Fluxos principais

1. Primeiro acesso: usuário cria e nomeia a família, recebe categorias padrão, cadastra a primeira conta e pode convidar membros.
2. Lançamentos: criar receita, despesa, transferência, ajuste e compra no cartão; informar competência, lançamento, categoria, responsável e descrição.
3. Rateio: uma despesa pode ser dividida entre membros por valor ou percentual.
4. Orçamento: administrar limite mensal por categoria de despesa e comparar com gasto realizado.
5. Cartão: cadastrar vários cartões, compras e parcelas; acompanhar fatura e vencimento; pagar com transferência de uma conta de origem.
6. Planejamento: recorrências geram pendências confirmáveis; dívidas manuais mostram credor, valor/saldo e vencimento.
7. Importação: enviar CSV do modelo LarFinance, revisar prévia e importar apenas se o arquivo inteiro for válido.
8. Consulta: dashboard com saldo/contas, lançamentos recentes e saldo investido; relatórios de receitas x despesas, categorias e evolução do saldo.

## Experiência

- Web responsiva, de 360 px a desktop; suporte para versões atuais de Chrome, Edge e Firefox.
- Interface funcional, limpa, com tema escuro, estados de carregamento/vazio/erro e confirmações para ações sensíveis.
- Central de pendências e notificações do navegador para vencimentos; sem e-mail ou WhatsApp no MVP.

## Fora do MVP

- Open Finance, integração bancária e formatos de bancos.
- Cotações, ativos, rentabilidade e impostos de investimentos; apenas saldo total investido manual.
- Múltiplas moedas, anexos/recibos e comunicação externa.
- Juros e amortização automática de dívidas.
- Fechamento formal de mês e permissões detalhadas além de administrador/membro.

## Métricas de sucesso do experimento

- Features guiadas por specs curtas e concluídas com critérios de aceite.
- CI verde em toda integração na `main`.
- Cobertura robusta das regras financeiras e E2E dos fluxos escolhidos.
- Pouco retrabalho por ambiguidade e decisões/aprendizados registrados.
