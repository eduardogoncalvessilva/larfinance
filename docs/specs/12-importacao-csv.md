# Spec 12 — Importação CSV

**Depende de:** Specs 06 e 09.

## 1. Objetivo

Permitir importar histórico pelo formato próprio do LarFinance com prévia obrigatória, validação total e gravação atômica.

## 2. Escopo

- Publicar e documentar o modelo CSV LarFinance versionado.
- Receber arquivo local, fazer parser, validar todas as linhas e apresentar prévia sem gravar transações.
- Mapear referências apenas para contas, categorias, cartões e membros existentes da família atual.
- Confirmar importação explicitamente e gravar um `ImportBatch` auditável com resultado/erros por linha e campo.
- Garantir tudo-ou-nada e idempotência contra reenvio do mesmo arquivo confirmado.

## 3. Fora de Escopo

- Formatos de bancos, OFX, XLSX, anexos, importação automática, correção parcial e mapeamento assistido.
- Criar conta, categoria, cartão ou membro durante importação.
- Suportar tipo financeiro cujo formato ainda não tenha contrato aprovado, incluindo variações de cartão/parcelas não representadas pelo modelo publicado.

## 4. Regras de Negócio

- O sistema aceita exclusivamente a versão atual documentada do CSV LarFinance; cabeçalho, codificação, delimitador, colunas obrigatórias e formatos de data/centavos são parte do contrato versionado.
- Arquivo inteiro é validado antes de qualquer escrita. Uma linha inválida bloqueia a confirmação e lista linha/campo/motivo, sem importação parcial.
- Datas, valores, tipo de transação, status e referências devem obedecer às mesmas regras dos casos de uso manuais.
- Conta, categoria, cartão e responsável referenciados pertencem à família atual e estão elegíveis conforme o tipo da linha; o arquivo não pode contornar autorização ou arquivamento.
- A prévia é vinculada ao conteúdo do arquivo, à família e a uma expiração. Confirmar conteúdo alterado, prévia expirada ou família divergente é inválido.
- Importação confirmada executa em uma única transação e cria `ImportBatch` com checksum/identificador idempotente. Reenvio confirmado do mesmo conteúdo não duplica dados.
- Erros de parser/validação não revelam dados de outra família e não registram o conteúdo integral sensível em logs.

## 5. Fluxo Principal

1. Usuário autorizado baixa/consulta o modelo CSV e prepara arquivo no formato publicado.
2. Envia arquivo; o sistema faz parser e valida todas as linhas contra dados da família.
3. A tela apresenta prévia de registros que seriam criados ou lista completa de erros por linha/campo.
4. Se não houver erros, usuário confirma a prévia ainda válida.
5. O caso de uso grava lote e lançamentos vinculados atomicamente e apresenta resumo rastreável.
6. Arquivo inválido, referência ausente/arquivada, prévia expirada, conteúdo alterado, duplicidade ou falha de transação impede escrita parcial e mostra erro acionável.

## 6. Critérios de Aceite

- Modelo CSV é versionado, documentado e possui exemplos válidos/inválidos.
- Um único erro bloqueia todo o lote e identifica linha/campo/motivo na prévia.
- Confirmação válida cria todos os registros ou nenhum; rollback é comprovado em falha.
- Reenvio do mesmo arquivo confirmado não duplica lançamentos e permite identificar o lote original.
- Importação não acessa entidades de outra família nem cria referências ausentes.
- `ImportBatch` registra autor, timestamps, checksum, estado e resumo sem armazenar segredos em logs.

## 7. Testes Esperados

- Unitários para parser, schema versionado, codificação suportada, datas, centavos e mensagens por linha/campo.
- Unitários para conversão de cada tipo de linha aprovado ao input de caso de uso financeiro.
- Integração para validação integral, rollback, checksum/idempotência, expiração de prévia e isolamento por família.
- E2E para upload com prévia válida, arquivo inválido bloqueado e confirmação de importação sem duplicidade.

## 8. Restrições e Decisões Técnicas

- Definir o contrato v1 do arquivo em documento/asset versionado antes de criar o parser; não aceitar heurísticas de CSV de bancos.
- Parser e validação produzem DTOs; a escrita reutiliza casos de uso/policies de domínio, não replica cálculo de saldo, fatura ou rateio.
- Prévia e confirmação usam identificador opaco armazenado no servidor ou checksum equivalente; não confiar em resumo enviado pelo cliente.
- Limites de tamanho/linhas, tempo de processamento e codificações aceitas devem ser documentados antes do endpoint público.

## 9. Plano de Implementação

1. Definir/publicar contrato CSV v1, exemplos e limites operacionais.
2. Criar parser/validador e testes unitários por formato e erro.
3. Implementar prévia persistida/expirável, `ImportBatch` e idempotência por checksum.
4. Integrar confirmação transacional aos casos de uso financeiros e testar rollback.
5. Criar tela de upload/prévia/resultado e concluir E2E de sucesso, erro e reenvio.
