# Outros Créditos/Débitos

Aplicação Angular para o módulo contábil `Outros Créditos/Débitos`, com foco em:

- Consulta de lotes com filtros, tabela, seleção por checkbox, paginação e barra de ações.
- Modal de inclusão e manutenção de lançamentos com Reactive Forms, busca de conta corrente em mock e grade em memória.

## Stack adotada

- Angular `20.3.32`
- Standalone components
- Reactive Forms
- RxJS com `Observable + delay`
- Signals para estado local de UI
- SCSS com tokens visuais próprios

## O que foi implementado

- Painel de filtros recolhível com:
  - Instituição Resp.
  - Instituição
  - Situação do lote
  - ID lote de/até
  - Valor lote de/até
  - Data de entrada de/até
- Validação reativa de intervalos com validador customizado.
- Tabela de lotes com:
  - seleção individual
  - selecionar todos da página
  - colunas principais do módulo
  - formatação de moeda e datas em `pt-BR`
  - paginação primeira/anterior/número/próxima/última
- Barra de ações com:
  - `Confirmar`
  - `Enviar`
  - `Visualizar Justificativa`
  - `Incluir`
  - `Alterar`
  - `Excluir`
  - `Visualizar`
- Modal `Incluir Lançamento` com:
  - busca de conta corrente via mock
  - exibição do titular localizado
  - valor obrigatório e maior que zero
  - histórico obrigatório
  - estorno
  - documento obrigatório
  - descrição
  - situação inicial `Pendente`
  - seção `Documento CSC` com `PA`
  - grade dos lançamentos do lote
  - ações `Visualizar`, `Incluir`, `Alterar`, `Excluir` e `Duplicar`
- Painel lateral para `Visualizar`, `Visualizar Justificativa` e `Alterar` lote.
- Mock em memória com serviço separado e respostas assíncronas simuladas.
- Testes unitários básicos do serviço.

## Estrutura da solução

```text
src/app/
  components/
    filter-panel/
    lots-table/
    launch-modal/
    lot-details-panel/
  data/
    mock-data.ts
  models/
    accounting.models.ts
  services/
    accounting-mock.service.ts
    accounting-mock.service.spec.ts
  shared/validators/
    range-validators.ts
```

## Decisões técnicas

- Usei `standalone components` para manter a base mais enxuta e moderna.
- Mantive a regra de negócio em `AccountingMockService` para separar UI de dados simulados.
- Usei `Signals` para estado de interface como seleção, loading, modal aberta e painel lateral.
- Usei `Reactive Forms` tanto nos filtros quanto no modal para facilitar validações e previsibilidade.
- Mantive CSS próprio para controlar melhor a aparência visual do módulo.
- Implementei um validador customizado de faixa e outro para garantir que a conta corrente foi realmente localizada no mock.

## Como executar

```bash
npm install
npx ng serve
```

Depois, abra `http://localhost:4200`.

## Validações executadas

Compilação Angular:

```bash
npx ngc -p tsconfig.app.json
```

Tipagem de testes:

```bash
npx tsc --noEmit -p tsconfig.spec.json
```
