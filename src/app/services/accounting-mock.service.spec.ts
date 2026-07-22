import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { LotesPage } from '../models/accounting.models';
import { AccountingMockService } from './accounting-mock.service';

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
});
