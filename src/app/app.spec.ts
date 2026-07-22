import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { App } from './app';
import { LoteFilters } from './models/accounting.models';
import { AccountingMockService } from './services/accounting-mock.service';

const DEFAULT_FILTERS: LoteFilters = {
  instituicaoResponsavel: '0001 - Sicoob',
  instituicao: '',
  situacaoLote: 'Todas',
  idLoteDe: null,
  idLoteAte: null,
  valorDe: null,
  valorAte: null,
  dataEntradaDe: null,
  dataEntradaAte: null
};

registerLocaleData(localePt);

describe('App', () => {
  let accountingService: AccountingMockService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App]
    }).compileComponents();

    accountingService = TestBed.inject(AccountingMockService);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('abre a modal de inclusão usando o primeiro lote visível quando não há seleção', fakeAsync(() => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    tick(420);
    fixture.detectChanges();

    expect(app.selectedIds()).toEqual([]);

    app.openLaunchModal();

    expect(app.launchModalOpen()).toBeTrue();
    expect(app.launchModalLot()?.id).toBe(app.currentLots()[0].id);
  }));

  it('limpa os filtros e refaz a busca com os valores padrão', fakeAsync(() => {
    const searchSpy = spyOn(accountingService, 'searchLots').and.callThrough();
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;

    tick(420);

    app.filterForm.patchValue({
      instituicaoResponsavel: '0012 - Sicoob Expansão',
      instituicao: 'Horizonte',
      situacaoLote: 'Confirmado',
      idLoteDe: 1038,
      idLoteAte: 1042,
      valorDe: 100,
      valorAte: 900,
      dataEntradaDe: '2026-04-22',
      dataEntradaAte: '2026-04-26'
    });

    app.filterForm.markAsDirty();
    app.filterForm.markAllAsTouched();

    app.resetFilters();

    expect(app.filterForm.getRawValue()).toEqual(DEFAULT_FILTERS);
    expect(app.filterForm.pristine).toBeTrue();
    expect(app.filterForm.untouched).toBeTrue();

    tick(420);

    expect(searchSpy.calls.count()).toBe(2);
    expect(searchSpy.calls.mostRecent().args[0]).toEqual(DEFAULT_FILTERS);
    expect(searchSpy.calls.mostRecent().args[1]).toBe(0);
    expect(searchSpy.calls.mostRecent().args[2]).toBe(6);
    expect(app.submittedFilters()).toEqual(DEFAULT_FILTERS);
  }));
});
