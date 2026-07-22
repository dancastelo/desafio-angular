export type SituacaoLote = 'Aberto' | 'Enviado' | 'Confirmado';

export type SituacaoLoteFiltro = 'Todas' | SituacaoLote;

export type SituacaoDocumentoCsc = 'Pendente' | 'Em processamento' | 'Processado';

export interface ContaCorrenteMock {
  numero: string;
  titular: string;
  apelido: string;
}

export interface Lancamento {
  id: number;
  loteId: number;
  pa: string;
  contaCorrente: string;
  titularConta: string;
  valor: number;
  historico: string;
  estorno: boolean;
  documento: string;
  descricao: string;
  situacao: 'Pendente';
  situacaoDocumentoCsc: SituacaoDocumentoCsc;
  retornoProcessamento: string;
  criadoEm: string;
}

export interface Lote {
  id: number;
  instituicaoResponsavel: string;
  instituicao: string;
  dataEntrada: string;
  valor: number;
  quantidadeLancamentos: number;
  usuarioRegistro: string;
  usuarioAprovacao: string | null;
  situacaoLote: SituacaoLote;
  dataHoraSituacaoLote: string;
  justificativa: string;
  lancamentos: Lancamento[];
}

export interface LoteFilters {
  instituicaoResponsavel: string;
  instituicao: string;
  situacaoLote: SituacaoLoteFiltro;
  idLoteDe: number | null;
  idLoteAte: number | null;
  valorDe: number | null;
  valorAte: number | null;
  dataEntradaDe: string | null;
  dataEntradaAte: string | null;
}

export interface LotesPage {
  items: Lote[];
  total: number;
  pageIndex: number;
  pageSize: number;
}

export interface LancamentoPayload {
  pa: string;
  contaCorrente: string;
  titularConta: string;
  valor: number;
  historico: string;
  estorno: boolean;
  documento: string;
  descricao: string;
}

export interface LoteUpdatePayload {
  instituicaoResponsavel: string;
  instituicao: string;
  justificativa: string;
}
