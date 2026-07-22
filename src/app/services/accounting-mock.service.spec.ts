import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ContaCorrenteMock, Lote, LoteFilters, LotesPage } from '../models/accounting.models';
import { AccountingMockService } from './accounting-mock.service';

const ALL_LOTS_FILTERS: LoteFilters = {
  instituicaoResponsavel: '',
  instituicao: '',
  situacaoLote: 'Todas',
  idLoteDe: null,
  idLoteAte: null,
  valorDe: null,
  valorAte: null,
  dataEntradaDe: null,
  dataEntradaAte: null
};

describe('AccountingMockService', () => {
  let service: AccountingMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountingMockService);
  });

  it('filtra lotes por situação e faixa de ID', fakeAsync(() => {
    let response: LotesPage | undefined;

    service
      .searchLots(
        {
          instituicaoResponsavel: '',
          instituicao: '',
          situacaoLote: 'Aberto',
          idLoteDe: 1037,
          idLoteAte: 1042,
          valorDe: null,
          valorAte: null,
          dataEntradaDe: null,
          dataEntradaAte: null
        },
        0,
        10
      )
      .subscribe((page) => {
        response = page;
      });

    tick(420);

    expect(response?.items.length).toBeGreaterThan(0);
    expect(response?.items.every((lot) => lot.situacaoLote === 'Aberto')).toBeTrue();
    expect(response?.items.every((lot) => lot.id >= 1037 && lot.id <= 1042)).toBeTrue();
  }));

  it('recalcula quantidade e valor ao incluir um lançamento', fakeAsync(() => {
    let updatedValue = 0;
    let updatedCount = 0;

    service
      .addLancamento(1042, {
        pa: 'PA 001 - Matriz',
        contaCorrente: '114444',
        titularConta: 'Bruna Faial',
        valor: 150,
        historico: 'Lançamento Manual',
        estorno: false,
        documento: 'DOC-TESTE-01',
        descricao: 'Inclusão de teste'
      })
      .subscribe((lot) => {
        updatedValue = lot.valor;
        updatedCount = lot.quantidadeLancamentos;
      });

    tick(280);

    expect(updatedCount).toBe(2);
    expect(updatedValue).toBe(1150);
  }));

  it('localiza conta corrente mesmo com espaços extras no valor informado', fakeAsync(() => {
    let account: ContaCorrenteMock | null | undefined;

    service.findContaCorrente(' 114444 ').subscribe((resolvedAccount) => {
      account = resolvedAccount;
    });

    tick(280);

    expect(account).toEqual(
      jasmine.objectContaining({
        numero: '114444',
        titular: 'Bruna Faial'
      })
    );
  }));

  it('atualiza o status dos lotes selecionados e registra o aprovador na confirmação', fakeAsync(() => {
    let updatedLots: Lote[] = [];

    service.updateLotsStatus([1042, 1040], 'Confirmado').subscribe((lots) => {
      updatedLots = lots;
    });

    tick(280);

    expect(updatedLots.length).toBe(2);
    expect(updatedLots.every((lot) => lot.situacaoLote === 'Confirmado')).toBeTrue();
    expect(updatedLots.every((lot) => lot.usuarioAprovacao === 'aprovador.mirante')).toBeTrue();
    expect(updatedLots.every((lot) => !Number.isNaN(Date.parse(lot.dataHoraSituacaoLote)))).toBeTrue();
  }));

  it('duplica lançamento preservando dados principais e recalculando totais do lote', fakeAsync(() => {
    let updatedLot: Lote | undefined;

    service.duplicateLancamento(1042, 7001).subscribe((lot) => {
      updatedLot = lot;
    });

    tick(280);

    expect(updatedLot?.quantidadeLancamentos).toBe(2);
    expect(updatedLot?.valor).toBe(2000);
    expect(updatedLot?.lancamentos[0].documento).toBe('DOC-1042-01-DUP');
    expect(updatedLot?.lancamentos[0].id).not.toBe(7001);
  }));

  it('recalcula quantidade e valor ao excluir um lançamento', fakeAsync(() => {
    let updatedLot: Lote | undefined;

    service.deleteLancamento(1039, 6991).subscribe((lot) => {
      updatedLot = lot;
    });

    tick(280);

    expect(updatedLot?.quantidadeLancamentos).toBe(2);
    expect(updatedLot?.valor).toBeCloseTo(815.9, 2);
    expect(updatedLot?.lancamentos.some((lancamento) => lancamento.id === 6991)).toBeFalse();
  }));

  it('remove lote da base simulada para as buscas seguintes', fakeAsync(() => {
    let initialPage: LotesPage | undefined;
    let updatedPage: LotesPage | undefined;

    service.searchLots(ALL_LOTS_FILTERS, 0, 10).subscribe((page) => {
      initialPage = page;
    });

    tick(420);

    service.deleteLot(1042).subscribe();

    tick(280);

    service.searchLots(ALL_LOTS_FILTERS, 0, 10).subscribe((page) => {
      updatedPage = page;
    });

    tick(420);

    expect(updatedPage?.total).toBe((initialPage?.total ?? 0) - 1);
    expect(updatedPage?.items.some((lot) => lot.id === 1042)).toBeFalse();
  }));
});
