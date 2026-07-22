import {
  ContaCorrenteMock,
  Lancamento,
  Lote,
  SituacaoDocumentoCsc,
  SituacaoLote
} from '../models/accounting.models';

interface LancamentoSeed {
  id: number;
  pa: string;
  contaCorrente: string;
  titularConta: string;
  valor: number;
  historico: string;
  documento: string;
  descricao: string;
  criadoEm: string;
  estorno?: boolean;
  situacaoDocumentoCsc?: SituacaoDocumentoCsc;
  retornoProcessamento?: string;
}

interface LoteSeed {
  id: number;
  instituicaoResponsavel: string;
  instituicao: string;
  dataEntrada: string;
  usuarioRegistro: string;
  usuarioAprovacao?: string | null;
  situacaoLote: SituacaoLote;
  dataHoraSituacaoLote: string;
  justificativa: string;
  lancamentos: LancamentoSeed[];
}

const createLancamento = (loteId: number, seed: LancamentoSeed): Lancamento => ({
  id: seed.id,
  loteId,
  pa: seed.pa,
  contaCorrente: seed.contaCorrente,
  titularConta: seed.titularConta,
  valor: seed.valor,
  historico: seed.historico,
  estorno: seed.estorno ?? false,
  documento: seed.documento,
  descricao: seed.descricao,
  situacao: 'Pendente',
  situacaoDocumentoCsc: seed.situacaoDocumentoCsc ?? 'Pendente',
  retornoProcessamento: seed.retornoProcessamento ?? 'Aguardando envio',
  criadoEm: seed.criadoEm
});

const createLote = (seed: LoteSeed): Lote => {
  const lancamentos = seed.lancamentos.map((item) => createLancamento(seed.id, item));
  const valor = lancamentos.reduce((total, item) => total + item.valor, 0);

  return {
    id: seed.id,
    instituicaoResponsavel: seed.instituicaoResponsavel,
    instituicao: seed.instituicao,
    dataEntrada: seed.dataEntrada,
    valor,
    quantidadeLancamentos: lancamentos.length,
    usuarioRegistro: seed.usuarioRegistro,
    usuarioAprovacao: seed.usuarioAprovacao ?? null,
    situacaoLote: seed.situacaoLote,
    dataHoraSituacaoLote: seed.dataHoraSituacaoLote,
    justificativa: seed.justificativa,
    lancamentos
  };
};

export const PA_OPTIONS = [
  'PA 001 - Matriz',
  'PA 014 - Norte',
  'PA 028 - Centro',
  'PA 043 - Sul',
  'PA 055 - Cooperado PJ'
];

export const HISTORICO_OPTIONS = [
  'Lançamento Manual',
  'Ajuste Operacional',
  'Crédito em Convênio',
  'Débito em Conta Corrente',
  'Reprocessamento CSC'
];

export const MOCK_CONTAS: ContaCorrenteMock[] = [
  { numero: '114444', titular: 'Bruna Faial', apelido: 'Conta Salary' },
  { numero: '221890', titular: 'Claudio Leite', apelido: 'Conta Empresas' },
  { numero: '330021', titular: 'Cooperado Norte Agro', apelido: 'Conta Safra' },
  { numero: '448899', titular: 'Juliana Valim', apelido: 'Conta Premium' },
  { numero: '550012', titular: 'Lucas Ferreira', apelido: 'Conta Corrente PF' },
  { numero: '661145', titular: 'Maria Faria', apelido: 'Conta Invest' },
  { numero: '772320', titular: 'Cooperado Central Log', apelido: 'Conta PJ' }
];

export const MOCK_LOTES: Lote[] = [
  createLote({
    id: 1042,
    instituicaoResponsavel: '0001 - Sicoob',
    instituicao: '0002 - Sicoob Central',
    dataEntrada: '2026-04-26',
    usuarioRegistro: 'gearo0300_00',
    usuarioAprovacao: null,
    situacaoLote: 'Aberto',
    dataHoraSituacaoLote: '2026-04-27T12:35:11',
    justificativa: 'Lote criado para regularização manual de créditos pendentes do dia.',
    lancamentos: [
      {
        id: 7001,
        pa: 'PA 001 - Matriz',
        contaCorrente: '114444',
        titularConta: 'Bruna Faial',
        valor: 1000,
        historico: 'Lançamento Manual',
        documento: 'DOC-1042-01',
        descricao: 'Ajuste de crédito referente a baixa de tarifa.',
        criadoEm: '2026-04-26T09:30:00'
      }
    ]
  }),
  createLote({
    id: 1041,
    instituicaoResponsavel: '0001 - Sicoob',
    instituicao: '0007 - Cooperativa Vale Verde',
    dataEntrada: '2026-04-25',
    usuarioRegistro: 'mafe1100_01',
    usuarioAprovacao: 'analista.aprov',
    situacaoLote: 'Confirmado',
    dataHoraSituacaoLote: '2026-04-25T18:11:00',
    justificativa: 'Confirmação efetuada após conferência do arquivo de retorno do CSC.',
    lancamentos: [
      {
        id: 6998,
        pa: 'PA 043 - Sul',
        contaCorrente: '448899',
        titularConta: 'Juliana Valim',
        valor: 480.5,
        historico: 'Crédito em Convênio',
        documento: 'DOC-1041-01',
        descricao: 'Crédito de convênio processado pela central.',
        criadoEm: '2026-04-25T08:20:00',
        situacaoDocumentoCsc: 'Processado',
        retornoProcessamento: 'Arquivo confirmado'
      },
      {
        id: 6999,
        pa: 'PA 043 - Sul',
        contaCorrente: '550012',
        titularConta: 'Lucas Ferreira',
        valor: 319.5,
        historico: 'Ajuste Operacional',
        documento: 'DOC-1041-02',
        descricao: 'Complemento de ajuste operacional do fechamento diário.',
        criadoEm: '2026-04-25T09:05:00',
        situacaoDocumentoCsc: 'Processado',
        retornoProcessamento: 'Arquivo confirmado'
      }
    ]
  }),
  createLote({
    id: 1040,
    instituicaoResponsavel: '0012 - Sicoob Expansão',
    instituicao: '0088 - Cooperativa Agro Serra',
    dataEntrada: '2026-04-24',
    usuarioRegistro: 'danv2200_02',
    usuarioAprovacao: null,
    situacaoLote: 'Enviado',
    dataHoraSituacaoLote: '2026-04-24T16:03:19',
    justificativa: 'Lote enviado aguardando retorno do processamento centralizado.',
    lancamentos: [
      {
        id: 6994,
        pa: 'PA 014 - Norte',
        contaCorrente: '330021',
        titularConta: 'Cooperado Norte Agro',
        valor: 1300,
        historico: 'Débito em Conta Corrente',
        documento: 'DOC-1040-01',
        descricao: 'Débito referente a regularização de saldo indevido.',
        criadoEm: '2026-04-24T10:14:00',
        situacaoDocumentoCsc: 'Em processamento',
        retornoProcessamento: 'Aguardando arquivo de retorno'
      },
      {
        id: 6995,
        pa: 'PA 014 - Norte',
        contaCorrente: '661145',
        titularConta: 'Maria Faria',
        valor: 420.8,
        historico: 'Reprocessamento CSC',
        documento: 'DOC-1040-02',
        descricao: 'Reenvio de documento com divergência de histórico.',
        criadoEm: '2026-04-24T11:40:00',
        situacaoDocumentoCsc: 'Em processamento',
        retornoProcessamento: 'Aguardando arquivo de retorno'
      }
    ]
  }),
  createLote({
    id: 1039,
    instituicaoResponsavel: '0001 - Sicoob',
    instituicao: '0024 - Cooperativa Centro Oeste',
    dataEntrada: '2026-04-23',
    usuarioRegistro: 'talm0900_04',
    usuarioAprovacao: null,
    situacaoLote: 'Aberto',
    dataHoraSituacaoLote: '2026-04-23T15:44:03',
    justificativa: 'Necessário complementar documentação de suporte antes do envio.',
    lancamentos: [
      {
        id: 6990,
        pa: 'PA 028 - Centro',
        contaCorrente: '772320',
        titularConta: 'Cooperado Central Log',
        valor: 720,
        historico: 'Lançamento Manual',
        documento: 'DOC-1039-01',
        descricao: 'Crédito operacional efetuado mediante autorização interna.',
        criadoEm: '2026-04-23T08:35:00'
      },
      {
        id: 6991,
        pa: 'PA 028 - Centro',
        contaCorrente: '221890',
        titularConta: 'Claudio Leite',
        valor: 210.32,
        historico: 'Ajuste Operacional',
        documento: 'DOC-1039-02',
        descricao: 'Ajuste complementar solicitado pela central contábil.',
        criadoEm: '2026-04-23T09:12:00'
      },
      {
        id: 6992,
        pa: 'PA 055 - Cooperado PJ',
        contaCorrente: '772320',
        titularConta: 'Cooperado Central Log',
        valor: 95.9,
        historico: 'Débito em Conta Corrente',
        documento: 'DOC-1039-03',
        descricao: 'Baixa parcial de valor cobrado em duplicidade.',
        criadoEm: '2026-04-23T09:28:00'
      }
    ]
  }),
  createLote({
    id: 1038,
    instituicaoResponsavel: '0005 - Sicoob Empresas',
    instituicao: '0102 - Cooperativa Horizonte',
    dataEntrada: '2026-04-22',
    usuarioRegistro: 'marf7100_03',
    usuarioAprovacao: 'coord.financeiro',
    situacaoLote: 'Confirmado',
    dataHoraSituacaoLote: '2026-04-22T17:55:40',
    justificativa: 'Lote aprovado sem ressalvas após dupla conferência.',
    lancamentos: [
      {
        id: 6987,
        pa: 'PA 055 - Cooperado PJ',
        contaCorrente: '221890',
        titularConta: 'Claudio Leite',
        valor: 2200,
        historico: 'Crédito em Convênio',
        documento: 'DOC-1038-01',
        descricao: 'Liquidação de convênio PJ do fechamento semanal.',
        criadoEm: '2026-04-22T10:10:00',
        situacaoDocumentoCsc: 'Processado',
        retornoProcessamento: 'Baixado com sucesso'
      }
    ]
  }),
  createLote({
    id: 1037,
    instituicaoResponsavel: '0009 - Sicoob Negócios',
    instituicao: '0130 - Cooperativa Horizonte Norte',
    dataEntrada: '2026-04-21',
    usuarioRegistro: 'rilo1200_01',
    usuarioAprovacao: null,
    situacaoLote: 'Aberto',
    dataHoraSituacaoLote: '2026-04-21T14:03:12',
    justificativa: 'Lote aberto para tratamento de ajuste manual solicitado pela agência.',
    lancamentos: [
      {
        id: 6983,
        pa: 'PA 014 - Norte',
        contaCorrente: '114444',
        titularConta: 'Bruna Faial',
        valor: 180.75,
        historico: 'Lançamento Manual',
        documento: 'DOC-1037-01',
        descricao: 'Complemento de crédito não compensado.',
        criadoEm: '2026-04-21T08:19:00'
      },
      {
        id: 6984,
        pa: 'PA 014 - Norte',
        contaCorrente: '661145',
        titularConta: 'Maria Faria',
        valor: 67.3,
        historico: 'Ajuste Operacional',
        documento: 'DOC-1037-02',
        descricao: 'Correção de arredondamento operacional.',
        criadoEm: '2026-04-21T09:04:00'
      }
    ]
  }),
  createLote({
    id: 1036,
    instituicaoResponsavel: '0012 - Sicoob Expansão',
    instituicao: '0099 - Cooperativa Serra Azul',
    dataEntrada: '2026-04-20',
    usuarioRegistro: 'helo9900_04',
    usuarioAprovacao: null,
    situacaoLote: 'Enviado',
    dataHoraSituacaoLote: '2026-04-20T16:45:52',
    justificativa: 'Aguardando retorno do CSC para liberação de crédito.',
    lancamentos: [
      {
        id: 6980,
        pa: 'PA 001 - Matriz',
        contaCorrente: '448899',
        titularConta: 'Juliana Valim',
        valor: 905.45,
        historico: 'Reprocessamento CSC',
        documento: 'DOC-1036-01',
        descricao: 'Documento reenviado após inconsistência de arquivo.',
        criadoEm: '2026-04-20T11:18:00',
        situacaoDocumentoCsc: 'Em processamento',
        retornoProcessamento: 'Arquivo em esteira'
      }
    ]
  }),
  createLote({
    id: 1035,
    instituicaoResponsavel: '0001 - Sicoob',
    instituicao: '0002 - Sicoob Central',
    dataEntrada: '2026-04-19',
    usuarioRegistro: 'biaa1000_00',
    usuarioAprovacao: 'analista.aprov',
    situacaoLote: 'Confirmado',
    dataHoraSituacaoLote: '2026-04-19T13:25:19',
    justificativa: 'Regularização concluída e conciliada com extrato do cooperado.',
    lancamentos: [
      {
        id: 6975,
        pa: 'PA 028 - Centro',
        contaCorrente: '550012',
        titularConta: 'Lucas Ferreira',
        valor: 150.9,
        historico: 'Débito em Conta Corrente',
        documento: 'DOC-1035-01',
        descricao: 'Débito de ajuste confirmado pelo retorno do extrato.',
        criadoEm: '2026-04-19T08:15:00',
        situacaoDocumentoCsc: 'Processado',
        retornoProcessamento: 'Baixado com sucesso'
      },
      {
        id: 6976,
        pa: 'PA 028 - Centro',
        contaCorrente: '114444',
        titularConta: 'Bruna Faial',
        valor: 830,
        historico: 'Crédito em Convênio',
        documento: 'DOC-1035-02',
        descricao: 'Crédito complementar de convênio mensal.',
        criadoEm: '2026-04-19T09:09:00',
        situacaoDocumentoCsc: 'Processado',
        retornoProcessamento: 'Baixado com sucesso'
      }
    ]
  }),
  createLote({
    id: 1034,
    instituicaoResponsavel: '0005 - Sicoob Empresas',
    instituicao: '0102 - Cooperativa Horizonte',
    dataEntrada: '2026-04-18',
    usuarioRegistro: 'cami1001_07',
    usuarioAprovacao: null,
    situacaoLote: 'Aberto',
    dataHoraSituacaoLote: '2026-04-18T10:12:58',
    justificativa: 'Lote em elaboração com pendência de validação documental.',
    lancamentos: [
      {
        id: 6971,
        pa: 'PA 055 - Cooperado PJ',
        contaCorrente: '772320',
        titularConta: 'Cooperado Central Log',
        valor: 1450,
        historico: 'Lançamento Manual',
        documento: 'DOC-1034-01',
        descricao: 'Crédito emergencial liberado para regularização de contrato.',
        criadoEm: '2026-04-18T08:32:00'
      }
    ]
  }),
  createLote({
    id: 1033,
    instituicaoResponsavel: '0009 - Sicoob Negócios',
    instituicao: '0130 - Cooperativa Horizonte Norte',
    dataEntrada: '2026-04-17',
    usuarioRegistro: 'guiu1900_03',
    usuarioAprovacao: null,
    situacaoLote: 'Enviado',
    dataHoraSituacaoLote: '2026-04-17T18:23:11',
    justificativa: 'Reenvio feito após divergência do lote anterior.',
    lancamentos: [
      {
        id: 6968,
        pa: 'PA 014 - Norte',
        contaCorrente: '330021',
        titularConta: 'Cooperado Norte Agro',
        valor: 512.12,
        historico: 'Ajuste Operacional',
        documento: 'DOC-1033-01',
        descricao: 'Ajuste referente a lançamento importado com divergência.',
        criadoEm: '2026-04-17T10:01:00',
        situacaoDocumentoCsc: 'Em processamento',
        retornoProcessamento: 'Aguardando arquivo de retorno'
      },
      {
        id: 6969,
        pa: 'PA 014 - Norte',
        contaCorrente: '661145',
        titularConta: 'Maria Faria',
        valor: 89.88,
        historico: 'Débito em Conta Corrente',
        documento: 'DOC-1033-02',
        descricao: 'Baixa de valor cobrado em operação manual.',
        criadoEm: '2026-04-17T11:14:00',
        situacaoDocumentoCsc: 'Em processamento',
        retornoProcessamento: 'Aguardando arquivo de retorno'
      }
    ]
  }),
  createLote({
    id: 1032,
    instituicaoResponsavel: '0012 - Sicoob Expansão',
    instituicao: '0099 - Cooperativa Serra Azul',
    dataEntrada: '2026-04-16',
    usuarioRegistro: 'lean4300_01',
    usuarioAprovacao: 'coord.financeiro',
    situacaoLote: 'Confirmado',
    dataHoraSituacaoLote: '2026-04-16T14:10:31',
    justificativa: 'Lote de baixa complexidade confirmado pela coordenação.',
    lancamentos: [
      {
        id: 6964,
        pa: 'PA 001 - Matriz',
        contaCorrente: '448899',
        titularConta: 'Juliana Valim',
        valor: 230,
        historico: 'Crédito em Convênio',
        documento: 'DOC-1032-01',
        descricao: 'Crédito de convênio simplificado.',
        criadoEm: '2026-04-16T09:17:00',
        situacaoDocumentoCsc: 'Processado',
        retornoProcessamento: 'Baixado com sucesso'
      },
      {
        id: 6965,
        pa: 'PA 001 - Matriz',
        contaCorrente: '550012',
        titularConta: 'Lucas Ferreira',
        valor: 315,
        historico: 'Ajuste Operacional',
        documento: 'DOC-1032-02',
        descricao: 'Ajuste contábil complementar de fechamento.',
        criadoEm: '2026-04-16T09:55:00',
        situacaoDocumentoCsc: 'Processado',
        retornoProcessamento: 'Baixado com sucesso'
      }
    ]
  }),
  createLote({
    id: 1031,
    instituicaoResponsavel: '0001 - Sicoob',
    instituicao: '0024 - Cooperativa Centro Oeste',
    dataEntrada: '2026-04-15',
    usuarioRegistro: 'nati3000_00',
    usuarioAprovacao: null,
    situacaoLote: 'Aberto',
    dataHoraSituacaoLote: '2026-04-15T11:47:21',
    justificativa: 'Pendência de conferência do documento de origem antes do envio.',
    lancamentos: [
      {
        id: 6960,
        pa: 'PA 028 - Centro',
        contaCorrente: '221890',
        titularConta: 'Claudio Leite',
        valor: 640,
        historico: 'Lançamento Manual',
        documento: 'DOC-1031-01',
        descricao: 'Crédito manual inserido pelo operador da central.',
        criadoEm: '2026-04-15T08:08:00'
      },
      {
        id: 6961,
        pa: 'PA 028 - Centro',
        contaCorrente: '114444',
        titularConta: 'Bruna Faial',
        valor: 320.45,
        historico: 'Ajuste Operacional',
        documento: 'DOC-1031-02',
        descricao: 'Ajuste complementar após revisão contábil.',
        criadoEm: '2026-04-15T08:45:00'
      }
    ]
  })
];
